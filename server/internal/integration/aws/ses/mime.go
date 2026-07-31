package ses

import (
	"bytes"
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

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

func buildMIME(message platformemail.Message) ([]byte, error) {
	if strings.TrimSpace(message.From.Email) == "" || len(message.To)+len(message.CC)+len(message.BCC) == 0 {
		return nil, errors.New("email requires a sender and at least one recipient")
	}
	if message.Text == "" && message.HTML == "" {
		return nil, errors.New("email requires a text or HTML body")
	}
	var output bytes.Buffer
	writeHeader(&output, "From", formatAddress(message.From))
	writeHeader(&output, "To", joinAddresses(message.To))
	writeHeader(&output, "Cc", joinAddresses(message.CC))
	writeHeader(&output, "Reply-To", joinAddresses(message.ReplyTo))
	writeHeader(&output, "Subject", mime.QEncoding.Encode("UTF-8", message.Subject))
	writeHeader(&output, "MIME-Version", "1.0")
	for key, value := range message.Headers {
		key = textproto.CanonicalMIMEHeaderKey(strings.TrimSpace(key))
		if key != "" && !reservedHeader(key) {
			writeHeader(&output, key, value)
		}
	}
	mixed := multipart.NewWriter(&output)
	writeHeader(&output, "Content-Type", fmt.Sprintf("multipart/mixed; boundary=%q", mixed.Boundary()))
	output.WriteString("\r\n")
	bodyHeader := textproto.MIMEHeader{}
	bodyBoundary := randomBoundary()
	bodyHeader.Set("Content-Type", fmt.Sprintf("multipart/alternative; boundary=%q", bodyBoundary))
	bodyPart, err := mixed.CreatePart(bodyHeader)
	if err != nil {
		return nil, fmt.Errorf("create email body: %w", err)
	}
	alternative := multipart.NewWriter(bodyPart)
	if err := alternative.SetBoundary(bodyBoundary); err != nil {
		return nil, fmt.Errorf("set email body boundary: %w", err)
	}
	if message.Text != "" {
		if err := writeBodyPart(alternative, "text/plain; charset=UTF-8", message.Text); err != nil {
			return nil, err
		}
	}
	if message.HTML != "" {
		if err := writeBodyPart(alternative, "text/html; charset=UTF-8", message.HTML); err != nil {
			return nil, err
		}
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
		filename := filepath.Base(strings.TrimSpace(attachment.Filename))
		if filename == "" || filename == "." {
			return nil, errors.New("attachment filename is required")
		}
		contentType := strings.TrimSpace(attachment.ContentType)
		if contentType == "" {
			contentType = "application/octet-stream"
		}
		header := textproto.MIMEHeader{}
		header.Set("Content-Type", contentType)
		header.Set("Content-Transfer-Encoding", "base64")
		header.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
		if id := sanitizeHeaderValue(attachment.ContentID); id != "" {
			header.Set("Content-ID", "<"+id+">")
		}
		part, err := mixed.CreatePart(header)
		if err != nil {
			return nil, fmt.Errorf("create attachment %q: %w", filename, err)
		}
		encoder := base64.NewEncoder(base64.StdEncoding, part)
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

func writeBodyPart(writer *multipart.Writer, contentType, body string) error {
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

func formatAddress(address platformemail.Address) string {
	return (&mail.Address{Name: strings.TrimSpace(address.Name), Address: strings.TrimSpace(address.Email)}).String()
}

func joinAddresses(addresses []platformemail.Address) string {
	values := make([]string, 0, len(addresses))
	for _, address := range addresses {
		values = append(values, formatAddress(address))
	}
	return strings.Join(values, ", ")
}

func writeHeader(output *bytes.Buffer, key, value string) {
	value = sanitizeHeaderValue(value)
	if value != "" {
		fmt.Fprintf(output, "%s: %s\r\n", key, value)
	}
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
