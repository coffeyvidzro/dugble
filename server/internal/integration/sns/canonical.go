package sns

import (
	"errors"
	"strings"
)

func canonicalMessage(message Message) (string, error) {
	if strings.TrimSpace(message.MessageID) == "" || strings.TrimSpace(message.TopicARN) == "" || strings.TrimSpace(message.Timestamp) == "" {
		return "", errors.New("SNS message is missing required fields")
	}
	fields := make([]string, 0, 14)
	appendField := func(name, value string) { fields = append(fields, name, value) }
	switch message.Type {
	case "Notification":
		appendField("Message", message.Message)
		appendField("MessageId", message.MessageID)
		if message.Subject != "" {
			appendField("Subject", message.Subject)
		}
		appendField("Timestamp", message.Timestamp)
		appendField("TopicArn", message.TopicARN)
		appendField("Type", message.Type)
	case "SubscriptionConfirmation", "UnsubscribeConfirmation":
		if message.Token == "" || message.SubscribeURL == "" {
			return "", errors.New("SNS confirmation is missing required fields")
		}
		appendField("Message", message.Message)
		appendField("MessageId", message.MessageID)
		appendField("SubscribeURL", message.SubscribeURL)
		appendField("Timestamp", message.Timestamp)
		appendField("Token", message.Token)
		appendField("TopicArn", message.TopicARN)
		appendField("Type", message.Type)
	default:
		return "", errors.New("unsupported SNS message type")
	}
	return strings.Join(fields, "\n"), nil
}
