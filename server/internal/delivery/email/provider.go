package emaildelivery

import (
	"bytes"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"mime"
	"mime/multipart"
	"mime/quotedprintable"
	"net/mail"
	"net/textproto"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
)

const ProviderSES = "ses"

var ErrUnsupportedAttachmentPath = errors.New("attachment paths are not supported by the email worker")

type ProviderMessage struct {
	From Address
	ReplyTo, To, CC, BCC []Address
	Subject, HTML, Text string
	Headers map[string]string
	Attachments []Attachment
}

type Address struct { Email, Name string }

type Attachment struct { Content, Filename, Path, ContentType, ContentID string }

type ProviderResult struct { Provider, MessageID string }

type Provider interface { Send(context.Context, ProviderMessage) (ProviderResult, error) }

type sesAPI interface {
	SendRawEmail(context.Context, *ses.SendRawEmailInput, ...func(*ses.Options)) (*ses.SendRawEmailOutput, error)
}

type SESProvider struct { client sesAPI }

func NewSESProvider(region, accessKey, secretKey string) *SESProvider {
	cfg := aws.Config{Region: strings.TrimSpace(region), Credentials: credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")}
	return &SESProvider{client: ses.NewFromConfig(cfg)}
}

func (p *SESProvider) Send(ctx context.Context, message ProviderMessage) (ProviderResult, error) {
	if p == nil || p.client == nil { return ProviderResult{}, errors.New("SES provider is not configured") }
	raw, err := buildMIME(message)
	if err != nil { return ProviderResult{}, err }
	output, err := p.client.SendRawEmail(ctx, &ses.SendRawEmailInput{RawMessage: &types.RawMessage{Data: raw}})
	if err != nil { return ProviderResult{}, err }
	if output.MessageId == nil || strings.TrimSpace(*output.MessageId) == "" { return ProviderResult{}, errors.New("SES returned an empty message ID") }
	return ProviderResult{Provider: ProviderSES, MessageID: strings.TrimSpace(*output.MessageId)}, nil
}

func buildMIME(message ProviderMessage) ([]byte, error) {
	if strings.TrimSpace(message.From.Email) == "" || len(message.To)+len(message.CC)+len(message.BCC) == 0 {
		return nil, errors.New("email requires a sender and at least one recipient")
	}
	if message.Text == "" && message.HTML == "" { return nil, errors.New("email requires a text or HTML body") }

	var output bytes.Buffer
	writeHeader(&output, "From", formatAddress(message.From))
	writeHeader(&output, "To", joinAddresses(message.To))
	writeHeader(&output, "Cc", joinAddresses(message.CC))
	writeHeader(&output, "Reply-To", joinAddresses(message.ReplyTo))
	writeHeader(&output, "Subject", mime.QEncoding.Encode("UTF-8", message.Subject))
	writeHeader(&output, "MIME-Version", "1.0")
	for key, value := range message.Headers {
		key = textproto.CanonicalMIMEHeaderKey(strings.TrimSpace(key))
		if key != "" && !reservedHeader(key) { writeHeader(&output, key, value) }
	}

	mixed := multipart.NewWriter(&output)
	writeHeader(&output, "Content-Type", fmt.Sprintf("multipart/mixed; boundary=%q", mixed.Boundary()))
	output.WriteString("\r\n")

	bodyHeader := textproto.MIMEHeader{}
	bodyBoundary := randomBoundary()
	bodyHeader.Set("Content-Type", fmt.Sprintf("multipart/alternative; boundary=%q", bodyBoundary))
	bodyPart, err := mixed.CreatePart(bodyHeader)
	if err != nil { return nil, fmt.Errorf("create email body: %w", err) }
	alternative := multipart.NewWriter(bodyPart)
	if err := alternative.SetBoundary(bodyBoundary); err != nil { return nil, fmt.Errorf("set email body boundary: %w", err) }
	if message.Text != "" {
		if err := writeBodyPart(alternative, "text/plain; charset=UTF-8", message.Text); err != nil { return nil, err }
	}
	if message.HTML != "" {
		if err := writeBodyPart(alternative, "text/html; charset=UTF-8", message.HTML); err != nil { return nil, err }
	}
	if err := alternative.Close(); err != nil { return nil, fmt.Errorf("close email body: %w", err) }

	for _, attachment := range message.Attachments {
		if strings.TrimSpace(attachment.Path) != "" && strings.TrimSpace(attachment.Content) == "" { return nil, ErrUnsupportedAttachmentPath }
		data, err := base64.StdEncoding.DecodeString(strings.TrimSpace(attachment.Content))
		if err != nil { return nil, fmt.Errorf("decode attachment %q: %w", attachment.Filename, err) }
		filename := filepath.Base(strings.TrimSpace(attachment.Filename))
		if filename == "" || filename == "." { return nil, errors.New("attachment filename is required") }
		contentType := strings.TrimSpace(attachment.ContentType)
		if contentType == "" { contentType = "application/octet-stream" }
		header := textproto.MIMEHeader{}
		header.Set("Content-Type", contentType)
		header.Set("Content-Transfer-Encoding", "base64")
		header.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
		if id := sanitizeHeaderValue(attachment.ContentID); id != "" { header.Set("Content-ID", "<"+id+">") }
		part, err := mixed.CreatePart(header)
		if err != nil { return nil, fmt.Errorf("create attachment %q: %w", filename, err) }
		encoded := base64.StdEncoding.EncodeToString(data)
		for len(encoded) > 76 {
			if _, err := fmt.Fprintf(part, "%s\r\n", encoded[:76]); err != nil { return nil, err }
			encoded = encoded[76:]
		}
		if _, err := fmt.Fprintf(part, "%s\r\n", encoded); err != nil { return nil, err }
	}
	if err := mixed.Close(); err != nil { return nil, fmt.Errorf("close MIME message: %w", err) }
	return output.Bytes(), nil
}

func writeBodyPart(writer *multipart.Writer, contentType, body string) error {
	header := textproto.MIMEHeader{}
	header.Set("Content-Type", contentType)
	header.Set("Content-Transfer-Encoding", "quoted-printable")
	part, err := writer.CreatePart(header)
	if err != nil { return fmt.Errorf("create MIME body part: %w", err) }
	encoded := quotedprintable.NewWriter(part)
	if _, err := encoded.Write([]byte(body)); err != nil { return fmt.Errorf("write MIME body part: %w", err) }
	if err := encoded.Close(); err != nil { return fmt.Errorf("close MIME body part: %w", err) }
	return nil
}

func formatAddress(address Address) string {
	return (&mail.Address{Name: strings.TrimSpace(address.Name), Address: strings.TrimSpace(address.Email)}).String()
}

func joinAddresses(addresses []Address) string {
	values := make([]string, 0, len(addresses))
	for _, address := range addresses { values = append(values, formatAddress(address)) }
	return strings.Join(values, ", ")
}

func writeHeader(output *bytes.Buffer, key, value string) {
	value = sanitizeHeaderValue(value)
	if value == "" { return }
	fmt.Fprintf(output, "%s: %s\r\n", key, value)
}

func sanitizeHeaderValue(value string) string {
	return strings.ReplaceAll(strings.ReplaceAll(strings.TrimSpace(value), "\r", ""), "\n", "")
}

func reservedHeader(key string) bool {
	switch key {
	case "From", "To", "Cc", "Bcc", "Reply-To", "Subject", "MIME-Version", "Content-Type", "Content-Transfer-Encoding": return true
	default: return false
	}
}

func randomBoundary() string {
	var buffer bytes.Buffer
	writer := multipart.NewWriter(&buffer)
	boundary := writer.Boundary()
	_ = writer.Close()
	return boundary
}
