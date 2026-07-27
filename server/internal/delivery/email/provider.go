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
)

const ProviderSES = "ses"

var ErrUnsupportedAttachmentPath = errors.New("attachment paths are not supported by the email worker")

type ProviderMessage struct {
	From        Address
	ReplyTo     []Address
	To          []Address
	CC          []Address
	BCC         []Address
	Subject     string
	HTML        string
	Text        string
	Headers     map[string]string
	Attachments []Attachment
}

type Address struct {
	Email string
	Name  string
}

type Attachment struct {
	Content     string
	Filename    string
	Path        string
	ContentType string
	ContentID   string
}

type ProviderResult struct {
	Provider  string
	MessageID string
}

type Provider interface {
	Send(context.Context, ProviderMessage) (ProviderResult, error)
}

type sesAPI interface {
	SendRawEmail(context.Context, *ses.SendRawEmailInput, ...func(*ses.Options)) (*ses.SendRawEmailOutput, error)
}

type SESProvider struct {
	client sesAPI
}

func NewSESProvider(region, accessKey, secretKey string) *SESProvider {
	cfg := aws.Config{
		Region:      strings.TrimSpace(region),
		Credentials: credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
	}
	return &SESProvider{client: ses.NewFromConfig(cfg)}
}

func (p *SESProvider) Send(ctx context.Context, message ProviderMessage) (ProviderResult, error) {
	if p == nil || p.client == nil {
		return ProviderResult{}, errors.New("SES provider is not configured")
	}
	raw, err := buildMIME(message)
	if err != nil {
		return ProviderResult{}, err
	}
	output, err := p.client.SendRawEmail(ctx, &ses.SendRawEmailInput{RawMessage: &ses.RawMessage{Data: raw}})
	if err != nil {
		return ProviderResult{}, err
	}
	if output.MessageId == nil || strings.TrimSpace(*output.MessageId) == "" {
		return ProviderResult{}, errors.New("SES returned an empty message ID")
	}
	return ProviderResult{Provider: ProviderSES, MessageID: strings.TrimSpace(*output.MessageId)}, nil
}

func buildMIME(message ProviderMessage) ([]byte, error) {
	if strings.TrimSpace(message.From.Email) == "" || len(message.To)+len(message.CC)+len(message.BCC) == 0 {
		return nil, errors.New("email requires a sender and at least one recipient")
	}

	var output bytes.Buffer
	writeHeader(&output, "From", formatAddress(message.From))
	writeHeader(&output, "To", joinAddresses(message.To))
	if len(message.CC) > 0 {
		writeHeader(&output, "Cc", joinAddresses(message.CC))
	}
	if len(message.ReplyTo) > 0 {
		writeHeader(&output, "Reply-To", joinAddresses(message.ReplyTo))
	}
	writeHeader(&output, "Subject", mime.QEncoding.Encode("UTF-8", message.Subject))
	writeHeader(&output, "MIME-Version", "1.0")
	for key, value := range message.Headers {
		canonical := textproto.CanonicalMIMEHeaderKey(strings.TrimSpace(key))
		if canonical == "" || reservedHeader(canonical) {
			continue
		}
		writeHeader(&output, canonical, value)
	}

	mixed := multipart.NewWriter(&output)
	writeHeader(&output, "Content-Type", fmt.Sprintf("multipart/mixed; boundary=%q", mixed.Boundary()))
	output.WriteString("\r\n")

	alternativeHeader := textproto.MIMEHeader{}
	alternativeBoundary := randomBoundary()
	alternativeHeader.Set("Content-Type", fmt.Sprintf("multipart/alternative; boundary=%q", alternativeBoundary))
	alternativePart, err := mixed.CreatePart(alternativeHeader)
	if err != nil {
		return nil, fmt.Errorf("create email body: %w", err)
	}
	alternative := multipart.NewWriter(alternativePart)
	if err := alternative.SetBoundary(alternativeBoundary); err != nil {
		return nil, fmt.Errorf("set email body boundary: %w", err)
	}
	if message.Text != "" {
		if err := writeQuotedPrintablePart(alternative, "text/plain; charset=UTF-8", message.Text); err != nil {
			return nil, err
		}
	}
	if message.HTML != "" {
		if err := writeQuotedPrintablePart(alternative, "text/html; charset=UTF-8", message.HTML); err != nil {
			return nil, err
		}
	}
	if message.Text == "" && message.HTML == "" {
		return nil, errors.New("email requires a text or HTML body")
	}
	if err := alternative.Close(); err != nil {
		return nil, fmt.Errorf("close email body: %w", err)
	}

	for _, attachment := range message.Attachments {
		if strings.TrimSpace(attachment.Path) != "" && strings.TrimSpace(attachment.Content) == "" {
			return nil, ErrUnsupportedAttachmentPath
		}
		data, err := base64.StdEncoding.DecodeString(strings.TrimSpace(attachment.Content))
		if err != nil {
			return nil, fmt.Errorf("decode attachment %q: %w", attachment.Filename, err)
		}
		contentType := strings.TrimSpace(attachment.ContentType)
		if contentType == "" {
			contentType = "application/octet-stream"
		}
		filename := filepath.Base(strings.TrimSpace(attachment.Filename))
		if filename == "." || filename == "" {
			return nil, errors.New("attachment filename is required")
		}
		header := textproto.MIMEHeader{}
		header.Set("Content-Type", contentType)
		header.Set("Content-Transfer-Encoding", "base64")
		header.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
		if strings.TrimSpace(attachment.ContentID) != "" {
			header.Set("Content-ID", "<"+sanitizeHeaderValue(attachment.ContentID)+">")
		}
		part, err := mixed.CreatePart(header)
		if err != nil {
			return nil, fmt.Errorf("create attachment %q: %w", filename, err)
		}
		encoder := base64.NewEncoder(base64.StdEncoding, newBase64LineWriter(part))
		if _, err := encoder.Write(data); err != nil {
			return nil, fmt.Errorf("write attachment %q: %w", filename, err)
		}
		if err := encoder.Close(); err != nil {
			return nil, fmt.Errorf("close attachment %q: %w", filename, err)
		}
	}
	if err := mixed.Close(); err != nil {
		return nil, fmt.Errorf("close MIME message: %w", err)
	}
	return output.Bytes(), nil
}

func writeQuotedPrintablePart(writer *multipart.Writer, contentType, body string) error {
	header := textproto.MIMEHeader{}
	header.Set("Content-Type", contentType)
	header.Set("Content-Transfer-Encoding", "quoted-printable")
	part, err := writer.CreatePart(header)
	if err != nil {
		return fmt.Errorf("create MIME body part: %w", err)
	}
	encoded := quotedprintable.NewWriter(part)
	if _, err := encoded.Write([]byte(body)); err != nil {
		return fmt.Errorf("write MIME body part: %w", err)
	}
	if err := encoded.Close(); err != nil {
		return fmt.Errorf("close MIME body part: %w", err)
	}
	return nil
}

func formatAddress(address Address) string {
	return (&mail.Address{Name: strings.TrimSpace(address.Name), Address: strings.TrimSpace(address.Email)}).String()
}

func joinAddresses(addresses []Address) string {
	values := make([]string, 0, len(addresses))
	for _, address := range addresses {
		values = append(values, formatAddress(address))
	}
	return strings.Join(values, ", ")
}

func writeHeader(output *bytes.Buffer, key, value string) {
	if strings.TrimSpace(value) == "" {
		return
	}
	output.WriteString(key)
	output.WriteString(": ")
	output.WriteString(sanitizeHeaderValue(value))
	output.WriteString("\r\n")
}

func sanitizeHeaderValue(value string) string {
	return strings.ReplaceAll(strings.ReplaceAll(strings.TrimSpace(value), "\r", ""), "\n", "")
}

func reservedHeader(key string) bool {
	switch key {
	case "From", "To", "Cc", "Bcc", "Reply-To", "Subject", "MIME-Version", "Content-Type", "Content-Transfer-Encoding":
		return true
	default:
		return false
	}
}

func randomBoundary() string {
	var buffer bytes.Buffer
	writer := multipart.NewWriter(&buffer)
	boundary := writer.Boundary()
	_ = writer.Close()
	return boundary
}

type base64LineWriter struct {
	writer  interface{ Write([]byte) (int, error) }
	column  int
}

func newBase64LineWriter(writer interface{ Write([]byte) (int, error) }) *base64LineWriter {
	return &base64LineWriter{writer: writer}
}

func (w *base64LineWriter) Write(data []byte) (int, error) {
	written := 0
	for len(data) > 0 {
		remaining := 76 - w.column
		if remaining == 0 {
			if _, err := w.writer.Write([]byte("\r\n")); err != nil {
				return written, err
			}
			w.column = 0
			remaining = 76
		}
		count := min(remaining, len(data))
		if _, err := w.writer.Write(data[:count]); err != nil {
			return written, err
		}
		w.column += count
		written += count
		data = data[count:]
	}
	return written, nil
}
