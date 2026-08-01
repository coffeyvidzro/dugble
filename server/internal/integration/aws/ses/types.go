package ses

import (
	"context"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsses "github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
)

const ProviderSES = "ses"

type sesAPI interface {
	SendRawEmail(context.Context, *awsses.SendRawEmailInput, ...func(*awsses.Options)) (*awsses.SendRawEmailOutput, error)
}

type sesIdentityAPI interface {
	CreateEmailIdentity(context.Context, *sesv2.CreateEmailIdentityInput, ...func(*sesv2.Options)) (*sesv2.CreateEmailIdentityOutput, error)
	PutEmailIdentityMailFromAttributes(context.Context, *sesv2.PutEmailIdentityMailFromAttributesInput, ...func(*sesv2.Options)) (*sesv2.PutEmailIdentityMailFromAttributesOutput, error)
	GetEmailIdentity(context.Context, *sesv2.GetEmailIdentityInput, ...func(*sesv2.Options)) (*sesv2.GetEmailIdentityOutput, error)
}

// Client implements provider-neutral sending and sender-domain operations using AWS SES.
type Client struct {
	defaultRegion    string
	defaultFrom      string
	configurationSet string
	awsConfig        aws.Config

	mu              sync.Mutex
	sendingClients  map[string]sesAPI
	identityClients map[string]sesIdentityAPI
}
