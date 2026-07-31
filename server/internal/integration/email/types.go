package email

import (
	"context"
	"errors"
	"sync"

	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
)

const ProviderSES = "ses"

var ErrUnsupportedAttachmentPath = errors.New("attachment paths are not supported by the SES integration")

type sesAPI interface {
	SendRawEmail(context.Context, *ses.SendRawEmailInput, ...func(*ses.Options)) (*ses.SendRawEmailOutput, error)
}

type sesIdentityAPI interface {
	CreateEmailIdentity(context.Context, *sesv2.CreateEmailIdentityInput, ...func(*sesv2.Options)) (*sesv2.CreateEmailIdentityOutput, error)
	PutEmailIdentityMailFromAttributes(context.Context, *sesv2.PutEmailIdentityMailFromAttributesInput, ...func(*sesv2.Options)) (*sesv2.PutEmailIdentityMailFromAttributesOutput, error)
	GetEmailIdentity(context.Context, *sesv2.GetEmailIdentityInput, ...func(*sesv2.Options)) (*sesv2.GetEmailIdentityOutput, error)
}

// Client implements provider-neutral sending and sender-domain operations using AWS SES.
type Client struct {
	defaultRegion   string
	defaultFrom     string
	configurationSet string
	accessKey       string
	secretKey       string

	mu              sync.Mutex
	sendingClients  map[string]sesAPI
	identityClients map[string]sesIdentityAPI
}
