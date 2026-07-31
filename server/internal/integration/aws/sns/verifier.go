package sns

import (
	"context"
	"crypto"
	"crypto/rsa"
	"encoding/base64"
	"fmt"
	"strings"
)

type Verifier struct {
	allowedTopics map[string]struct{}
	certificates  CertificateLoader
}

func NewVerifier(allowedTopics []string, certificates CertificateLoader) *Verifier {
	topics := make(map[string]struct{}, len(allowedTopics))
	for _, topic := range allowedTopics {
		if normalized := strings.TrimSpace(topic); normalized != "" {
			topics[normalized] = struct{}{}
		}
	}
	return &Verifier{allowedTopics: topics, certificates: certificates}
}

func (v *Verifier) Verify(ctx context.Context, envelope Envelope) error {
	if err := validateEnvelope(envelope); err != nil {
		return err
	}
	if v == nil {
		return fmt.Errorf("%w: verifier is not configured", ErrCertificateUnavailable)
	}
	if _, ok := v.allowedTopics[envelope.TopicARN]; !ok {
		return fmt.Errorf("%w: %s", ErrTopicNotAllowed, envelope.TopicARN)
	}
	if err := validateSigningCertificateURL(envelope.SigningCertURL); err != nil {
		return err
	}
	if v.certificates == nil {
		return fmt.Errorf("%w: certificate loader is not configured", ErrCertificateUnavailable)
	}
	certificate, err := v.certificates.Load(ctx, envelope.SigningCertURL)
	if err != nil {
		return err
	}
	publicKey, ok := certificate.PublicKey.(*rsa.PublicKey)
	if !ok {
		return fmt.Errorf("%w: certificate does not contain an RSA public key", ErrInvalidCertificate)
	}

	message, err := canonicalMessage(envelope)
	if err != nil {
		return err
	}
	signature, err := base64.StdEncoding.DecodeString(envelope.Signature)
	if err != nil {
		return fmt.Errorf("%w: signature is not valid base64", ErrInvalidSignature)
	}
	hash, err := signatureHash(envelope.SignatureVersion)
	if err != nil {
		return err
	}
	digest := hash.New()
	_, _ = digest.Write(message)
	if err := rsa.VerifyPKCS1v15(publicKey, hash, digest.Sum(nil), signature); err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidSignature, err)
	}
	return nil
}

func canonicalMessage(envelope Envelope) ([]byte, error) {
	if err := validateEnvelope(envelope); err != nil {
		return nil, err
	}
	fields := make([]string, 0, 14)
	appendField := func(name, value string) {
		fields = append(fields, name, value)
	}

	appendField("Message", envelope.Message)
	appendField("MessageId", envelope.MessageID)
	switch envelope.Type {
	case TypeNotification:
		if envelope.Subject != nil {
			appendField("Subject", *envelope.Subject)
		}
	case TypeSubscriptionConfirmation, TypeUnsubscribeConfirmation:
		appendField("SubscribeURL", *envelope.SubscribeURL)
	}
	appendField("Timestamp", envelope.Timestamp)
	if envelope.Type == TypeSubscriptionConfirmation || envelope.Type == TypeUnsubscribeConfirmation {
		appendField("Token", *envelope.Token)
	}
	appendField("TopicArn", envelope.TopicARN)
	appendField("Type", string(envelope.Type))
	return []byte(strings.Join(fields, "\n")), nil
}

func signatureHash(version string) (crypto.Hash, error) {
	switch strings.TrimSpace(version) {
	case "1":
		return crypto.SHA1, nil
	case "2":
		return crypto.SHA256, nil
	default:
		return 0, fmt.Errorf("%w: %q", ErrUnsupportedSignatureVersion, version)
	}
}
