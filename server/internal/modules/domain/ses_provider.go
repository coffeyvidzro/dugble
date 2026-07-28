package domain

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

type DomainProvider interface {
	Provision(context.Context, ProvisionRequest) ([]VerificationRecord, error)
	Status(context.Context, string, string) (ProviderStatus, error)
}

type sesIdentityAPI interface {
	CreateEmailIdentity(context.Context, *sesv2.CreateEmailIdentityInput, ...func(*sesv2.Options)) (*sesv2.CreateEmailIdentityOutput, error)
	PutEmailIdentityMailFromAttributes(context.Context, *sesv2.PutEmailIdentityMailFromAttributesInput, ...func(*sesv2.Options)) (*sesv2.PutEmailIdentityMailFromAttributesOutput, error)
	GetEmailIdentity(context.Context, *sesv2.GetEmailIdentityInput, ...func(*sesv2.Options)) (*sesv2.GetEmailIdentityOutput, error)
}

type SESProvider struct {
	accessKey string
	secretKey string
	mu        sync.Mutex
	clients   map[string]sesIdentityAPI
}

func NewSESProvider(accessKey, secretKey string) *SESProvider {
	return &SESProvider{accessKey: strings.TrimSpace(accessKey), secretKey: strings.TrimSpace(secretKey), clients: make(map[string]sesIdentityAPI)}
}

func (p *SESProvider) client(region string) (sesIdentityAPI, error) {
	if p == nil || p.accessKey == "" || p.secretKey == "" {
		return nil, errors.New("SES identity provider credentials are not configured")
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	if client, ok := p.clients[region]; ok {
		return client, nil
	}
	cfg := aws.Config{
		Region:      region,
		Credentials: credentials.NewStaticCredentialsProvider(p.accessKey, p.secretKey, ""),
	}
	client := sesv2.NewFromConfig(cfg)
	p.clients[region] = client
	return client, nil
}

func (p *SESProvider) Provision(ctx context.Context, req ProvisionRequest) ([]VerificationRecord, error) {
	client, err := p.client(req.Region)
	if err != nil {
		return nil, err
	}
	selector, privateKey, publicKey, err := generateBYODKIMMaterial()
	if err != nil {
		return nil, fmt.Errorf("generate BYODKIM material: %w", err)
	}
	_, err = client.CreateEmailIdentity(ctx, &sesv2.CreateEmailIdentityInput{
		EmailIdentity: aws.String(req.Domain),
		DkimSigningAttributes: &types.DkimSigningAttributes{
			DomainSigningPrivateKey: aws.String(privateKey),
			DomainSigningSelector:   aws.String(selector),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("create SES email identity: %w", err)
	}
	mailFromDomain := req.CustomReturnPath + "." + req.Domain
	_, err = client.PutEmailIdentityMailFromAttributes(ctx, &sesv2.PutEmailIdentityMailFromAttributesInput{
		EmailIdentity:       aws.String(req.Domain),
		MailFromDomain:      aws.String(mailFromDomain),
		BehaviorOnMxFailure: types.BehaviorOnMxFailureRejectMessage,
	})
	if err != nil {
		return nil, fmt.Errorf("configure SES MAIL FROM domain: %w", err)
	}
	priority := 10
	return []VerificationRecord{
		{Record: RecordDKIM, Name: selector + "._domainkey", Value: "v=DKIM1; k=rsa; p=" + publicKey, Type: RecordTypeTXT, Status: RecordStatusPending, TTL: "Auto"},
		{Record: RecordSPF, Name: req.CustomReturnPath, Value: "feedback-smtp." + req.Region + ".amazonses.com", Type: RecordTypeMX, Status: RecordStatusPending, TTL: "Auto", Priority: &priority},
		{Record: RecordSPF, Name: req.CustomReturnPath, Value: "v=spf1 include:amazonses.com ~all", Type: RecordTypeTXT, Status: RecordStatusPending, TTL: "Auto"},
	}, nil
}

func (p *SESProvider) Status(ctx context.Context, domainName, region string) (ProviderStatus, error) {
	client, err := p.client(region)
	if err != nil {
		return ProviderStatus{}, err
	}
	output, err := client.GetEmailIdentity(ctx, &sesv2.GetEmailIdentityInput{EmailIdentity: aws.String(domainName)})
	if err != nil {
		return ProviderStatus{}, fmt.Errorf("get SES email identity: %w", err)
	}
	status := ProviderStatus{IdentityVerified: output.VerifiedForSendingStatus}
	if output.DkimAttributes != nil {
		status.DKIMVerified = output.DkimAttributes.SigningEnabled && output.DkimAttributes.Status == types.DkimStatusSuccess
	}
	if output.MailFromAttributes != nil {
		status.MailFromVerified = output.MailFromAttributes.MailFromDomainStatus == types.MailFromDomainStatusSuccess
	}
	return status, nil
}

func generateBYODKIMMaterial() (selector, privateKey, publicKey string, err error) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return "", "", "", err
	}
	privateDER, err := x509.MarshalPKCS8PrivateKey(key)
	if err != nil {
		return "", "", "", err
	}
	publicDER, err := x509.MarshalPKIXPublicKey(&key.PublicKey)
	if err != nil {
		return "", "", "", err
	}
	random := make([]byte, 6)
	if _, err := rand.Read(random); err != nil {
		return "", "", "", err
	}
	selector = "dugble" + hex.EncodeToString(random)
	return selector, base64.StdEncoding.EncodeToString(privateDER), base64.StdEncoding.EncodeToString(publicDER), nil
}
