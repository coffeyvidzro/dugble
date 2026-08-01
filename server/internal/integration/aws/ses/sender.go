package ses

import (
	"context"
	"errors"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsses "github.com/aws/aws-sdk-go-v2/service/ses"
	sestypes "github.com/aws/aws-sdk-go-v2/service/ses/types"
	"github.com/aws/smithy-go"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

const (
	messageIDTagName = "dugble_message_id"
	attemptIDTagName = "dugble_attempt_id"
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
		switch {
		case errors.Is(err, ErrUnsupportedAttachmentPath):
			code = "unsupported_attachment_path"
		case errors.Is(err, ErrMessageTooLarge):
			code = "message_too_large"
		case errors.Is(err, ErrReservedHeader):
			code = "reserved_header"
		}
		return platformemail.Result{}, platformemail.NewSendError(code, false, err)
	}
	input := &awsses.SendRawEmailInput{
		Destinations: envelopeDestinations(message),
		RawMessage:   &sestypes.RawMessage{Data: raw},
		Tags:         deliveryTags(message),
	}
	if c.configurationSet != "" {
		input.ConfigurationSetName = aws.String(c.configurationSet)
	}
	output, err := client.SendRawEmail(ctx, input)
	if err != nil {
		return platformemail.Result{}, classifySESFailure(err)
	}
	if output.MessageId == nil || strings.TrimSpace(*output.MessageId) == "" {
		return platformemail.Result{}, platformemail.NewSubmissionUnknownError(
			"empty_provider_message_id",
			errors.New("SES returned an empty message ID after accepting the request"),
		)
	}
	return platformemail.Result{Provider: ProviderSES, MessageID: strings.TrimSpace(*output.MessageId)}, nil
}

func deliveryTags(message platformemail.Message) []sestypes.MessageTag {
	tags := make([]sestypes.MessageTag, 0, 2)
	if value := strings.TrimSpace(message.MessageID); value != "" {
		tags = append(tags, sestypes.MessageTag{Name: aws.String(messageIDTagName), Value: aws.String(value)})
	}
	if value := strings.TrimSpace(message.AttemptID); value != "" {
		tags = append(tags, sestypes.MessageTag{Name: aws.String(attemptIDTagName), Value: aws.String(value)})
	}
	return tags
}

func envelopeDestinations(message platformemail.Message) []string {
	addresses := make([]platformemail.Address, 0, len(message.To)+len(message.CC)+len(message.BCC))
	addresses = append(addresses, message.To...)
	addresses = append(addresses, message.CC...)
	addresses = append(addresses, message.BCC...)

	destinations := make([]string, 0, len(addresses))
	seen := make(map[string]struct{}, len(addresses))
	for _, address := range addresses {
		email := strings.TrimSpace(address.Email)
		key := strings.ToLower(email)
		if key == "" {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		destinations = append(destinations, email)
	}
	return destinations
}

func classifySESFailure(err error) error {
	var apiError smithy.APIError
	if !errors.As(err, &apiError) {
		return platformemail.NewSubmissionUnknownError("ses_submission_unknown", err)
	}
	code := strings.ToLower(strings.TrimSpace(apiError.ErrorCode()))
	retryable := false
	switch code {
	case "throttling", "throttlingexception", "serviceunavailable", "internalfailure", "internalservererror":
		retryable = true
	case "requesttimeout", "requesttimeoutexception":
		return platformemail.NewSubmissionUnknownError(code, err)
	}
	return platformemail.NewSendError(code, retryable, err)
}
