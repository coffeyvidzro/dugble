package smsdelivery

import "github.com/google/uuid"

const DeliverQueue = "sms"

type DeliverArgs struct {
	MessageID uuid.UUID `json:"message_id"`
	TeamID    uuid.UUID `json:"team_id"`
}

func (DeliverArgs) Kind() string { return "sms.deliver" }
