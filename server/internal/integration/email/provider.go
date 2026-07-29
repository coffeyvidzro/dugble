package email

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	sestypes "github.com/aws/aws-sdk-go-v2/service/ses/types"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	sesv2types "github.com/aws/aws-sdk-go-v2/service/sesv2/types"
	"github.com/aws/smithy-go"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

func (c *Client) Send(ctx context.Context, message platformemail.Message) (platformemail.Result, error) {
	client, err := c.sendingClient(message.Region)
	if err != nil {
		return platformemail.Result{}, err
	}
	if strings.TrimSpace(message.From.Email) == "" {
		message.From.Email = c.defaultFrom
	}
	raw, err := buildMIME(message)
	if err != nil {
		code := "invalid_message"
		if errors.Is(err, ErrUnsupportedAttachmentPath) {
			code = "unsupported_attachment_path"
		}
		return platformemail.Result{}, platformemail.NewSendError(code, false, err)
	}
	input := &ses.SendRawEmailInput{RawMessage: &sestypes.RawMessage{Data: raw}}
	if c.configurationSet != "" {
		input.ConfigurationSetName = aws.String(c.configurationSet)
	}
	output, err := client.SendRawEmail(ctx, input)
	if err != nil {
		return platformemail.Result{}, classifySESFailure(err)
	}
	if output.MessageId == nil || strings.TrimSpace(*output.MessageId) == "" {
		return platformemail.Result{}, platformemail.NewSendError("empty_provider_message_id", true, errors.New("SES returned an empty message ID"))
	}
	return platformemail.Result{Provider: ProviderSES, MessageID: strings.TrimSpace(*output.MessageId)}, nil
}

func (c *Client) ProvisionDomain(ctx context.Context, req platformemail.DomainProvisionRequest) ([]platformemail.VerificationRecord, error) {
	client, err := c.identityClient(req.Region)
	if err != nil {
		return nil, err
	}
	selector, privateKey, publicKey, err := generateBYODKIMMaterial()
	if err != nil {
		return nil, fmt.Errorf("generate BYODKIM material: %w", err)
	}
	_, err = client.CreateEmailIdentity(ctx, &sesv2.CreateEmailIdentityInput{
		EmailIdentity: aws.String(req.Domain),
		DkimSigningAttributes: &sesv2types.DkimSigningAttributes{
			DomainSigningPrivateKey: aws.String(privateKey),
			DomainSigningSelector:   aws.String(selector),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("create SES email identity: %w", err)
	}
	_, err = client.PutEmailIdentityMailFromAttributes(ctx, &sesv2.PutEmailIdentityMailFromAttributesInput{
		EmailIdentity:       aws.String(req.Domain),
		MailFromDomain:      aws.String(req.CustomReturnPath + "." + req.Domain),
		BehaviorOnMxFailure: sesv2types.BehaviorOnMxFailureRejectMessage,
	})
	if err != nil {
		return nil, fmt.Errorf("configure SES MAIL FROM domain: %w", err)
	}
	return mapVerificationRecords(req, selector, publicKey), nil
}

func (c *Client) GetDomainStatus(ctx context.Context, domainName, region string) (platformemail.DomainStatus, error) {
	client, err := c.identityClient(region)
	if err != nil {
		return platformemail.DomainStatus{}, err
	}
	output, err := client.GetEmailIdentity(ctx, &sesv2.GetEmailIdentityInput{EmailIdentity: aws.String(domainName)})
	if err != nil {
		return platformemail.DomainStatus{}, fmt.Errorf("get SES email identity: %w", err)
	}
	status := platformemail.DomainStatus{IdentityVerified: output.VerifiedForSendingStatus}
	if output.DkimAttributes != nil {
		status.DKIMVerified = output.DkimAttributes.SigningEnabled && output.DkimAttributes.Status == sesv2types.DkimStatusSuccess
	}
	if output.MailFromAttributes != nil {
		status.MailFromVerified = output.MailFromAttributes.MailFromDomainStatus == sesv2types.MailFromDomainStatusSuccess
	}
	return status, nil
}

func classifySESFailure(err error) error {
	var apiError smithy.APIError
	if !errors.As(err, &apiError) {
		return platformemail.NewSendError("ses_request_failed", platformemail.IsRetryable(err), err)
	}
	code := strings.ToLower(strings.TrimSpace(apiError.ErrorCode()))
	retryable := false
	switch code {
	case "throttling", "throttlingexception", "requesttimeout", "requesttimeoutexception", "serviceunavailable", "internalfailure", "internalservererror":
		retryable = true
	}
	return platformemail.NewSendError(code, retryable, err)
}
