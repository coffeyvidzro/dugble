package email

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"

	"github.com/coffeyvidzro/dugble/server/internal/notifications"
)

type SESSender struct {
	client *ses.Client
	from   string
}

func NewSESSender(
	ctx context.Context,
	region string,
	from string,
	accessKey string,
	secretKey string,
) (*SESSender, error) {
	awsConfig := aws.Config{
		Credentials: credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		Region:      region,
	}

	return &SESSender{
		client: ses.NewFromConfig(awsConfig),
		from:   from,
	}, nil
}

func (s *SESSender) Send(ctx context.Context, msg notifications.EmailMessage) error {

	_, err := s.client.SendEmail(ctx, &ses.SendEmailInput{
		Source: aws.String(s.from),
		Destination: &types.Destination{
			ToAddresses: []string{msg.To},
		},
		Message: &types.Message{
			Subject: &types.Content{
				Charset: aws.String("UTF-8"),
				Data:    aws.String(msg.Subject),
			},
			Body: &types.Body{
				Html: &types.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(msg.Body),
				},
			},
		},
	})

	return err
}
