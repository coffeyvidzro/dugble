package sns

import "errors"

var (
	ErrInvalidEnvelope             = errors.New("invalid SNS envelope")
	ErrUnsupportedMessageType      = errors.New("unsupported SNS message type")
	ErrUnsupportedSignatureVersion = errors.New("unsupported SNS signature version")
	ErrInvalidSignature            = errors.New("invalid SNS signature")
	ErrTopicNotAllowed             = errors.New("SNS topic is not allowed")
	ErrUntrustedCertificateURL     = errors.New("untrusted SNS signing certificate URL")
	ErrCertificateUnavailable      = errors.New("SNS signing certificate is unavailable")
	ErrInvalidCertificate          = errors.New("invalid SNS signing certificate")
	ErrInvalidConfirmationURL      = errors.New("invalid SNS subscription confirmation URL")
	ErrConfirmationUnavailable     = errors.New("SNS subscription confirmation is unavailable")
)
