package sns

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha1" // SNS signature version 1 requires SHA-1 for protocol compatibility.
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
)

var ErrVerificationUnavailable = errors.New("SNS verification is temporarily unavailable")

type Verifier struct {
	topics  map[string]struct{}
	fetcher certificateFetcher
}

func NewVerifier(topicARNs []string, client *http.Client) *Verifier {
	topics := make(map[string]struct{}, len(topicARNs))
	for _, topic := range topicARNs {
		if topic = strings.TrimSpace(topic); topic != "" {
			topics[topic] = struct{}{}
		}
	}
	return &Verifier{topics: topics, fetcher: newCertificateCache(client)}
}

func (v *Verifier) Verify(ctx context.Context, raw []byte) (Message, error) {
	if v == nil || v.fetcher == nil {
		return Message{}, errors.New("SNS verifier is not configured")
	}
	var message Message
	if err := json.Unmarshal(raw, &message); err != nil {
		return Message{}, fmt.Errorf("decode SNS message: %w", err)
	}
	if _, ok := v.topics[message.TopicARN]; !ok {
		return Message{}, errors.New("SNS topic is not allowed")
	}
	canonical, err := canonicalMessage(message)
	if err != nil {
		return Message{}, err
	}
	certificate, err := v.fetcher.Fetch(ctx, message.SigningCertURL)
	if err != nil {
		return Message{}, fmt.Errorf("%w: fetch signing certificate: %v", ErrVerificationUnavailable, err)
	}
	publicKey, ok := certificate.PublicKey.(*rsa.PublicKey)
	if !ok {
		return Message{}, errors.New("SNS signing certificate does not contain an RSA key")
	}
	signature, err := base64.StdEncoding.DecodeString(message.Signature)
	if err != nil {
		return Message{}, errors.New("SNS signature is not valid base64")
	}
	var digest []byte
	var algorithm crypto.Hash
	switch message.SignatureVersion {
	case "1":
		sum := sha1.Sum([]byte(canonical))
		digest, algorithm = sum[:], crypto.SHA1
	case "2":
		sum := sha256.Sum256([]byte(canonical))
		digest, algorithm = sum[:], crypto.SHA256
	default:
		return Message{}, errors.New("unsupported SNS signature version")
	}
	if err := rsa.VerifyPKCS1v15(publicKey, algorithm, digest, signature); err != nil {
		return Message{}, errors.New("SNS signature verification failed")
	}
	return message, nil
}
