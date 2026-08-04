package inbox

import (
	"bytes"
	"encoding/json"
	"net/url"
	"regexp"
	"strings"
	"unicode/utf8"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxRecipients     = 500
	maxRecipientBytes = 256
	maxCategoryBytes  = 64
	maxTitleBytes     = 200
	maxBodyBytes      = 10_000
	maxDataBytes      = 32_000
	maxActions        = 4
	maxActionIDBytes  = 64
	maxActionLabel    = 120
	maxActionURL      = 2_048
)

var categoryPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9._-]*$`)

func validateCreateMessage(request CreateMessageRequest) (validatedCreateMessage, error) {
	recipients, err := normalizeRecipients(request.Recipients)
	if err != nil {
		return validatedCreateMessage{}, err
	}
	category := strings.ToLower(strings.TrimSpace(request.Category))
	if category == "" {
		category = "general"
	}
	if len(category) > maxCategoryBytes || !categoryPattern.MatchString(category) {
		return validatedCreateMessage{}, apperrors.NewBadRequest("Inbox category must use lowercase letters, numbers, dots, underscores, or hyphens")
	}
	priority := strings.ToLower(strings.TrimSpace(request.Priority))
	if priority == "" {
		priority = PriorityNormal
	}
	if !validPriority(priority) {
		return validatedCreateMessage{}, apperrors.NewBadRequest("Inbox priority must be low, normal, high, or urgent")
	}
	title := strings.TrimSpace(request.Title)
	if title == "" {
		return validatedCreateMessage{}, apperrors.NewBadRequest("Inbox title is required")
	}
	if len(title) > maxTitleBytes || !utf8.ValidString(title) {
		return validatedCreateMessage{}, apperrors.NewBadRequest("Inbox title must be valid UTF-8 and at most 200 bytes")
	}
	body := strings.TrimSpace(request.Body)
	if body == "" {
		return validatedCreateMessage{}, apperrors.NewBadRequest("Inbox body is required")
	}
	if len(body) > maxBodyBytes || !utf8.ValidString(body) {
		return validatedCreateMessage{}, apperrors.NewBadRequest("Inbox body must be valid UTF-8 and at most 10000 bytes")
	}
	data, err := normalizeData(request.Data)
	if err != nil {
		return validatedCreateMessage{}, err
	}
	actions, err := normalizeActions(request.Actions)
	if err != nil {
		return validatedCreateMessage{}, err
	}
	return validatedCreateMessage{
		Recipients: recipients,
		Category:   category,
		Priority:   priority,
		Title:      title,
		Body:       body,
		Data:       data,
		Actions:    actions,
	}, nil
}

func normalizeRecipients(values []string) ([]string, error) {
	if len(values) == 0 {
		return nil, apperrors.NewBadRequest("At least one Inbox recipient is required")
	}
	seen := make(map[string]struct{}, len(values))
	recipients := make([]string, 0, len(values))
	for _, value := range values {
		recipient := strings.TrimSpace(value)
		if recipient == "" {
			return nil, apperrors.NewBadRequest("Inbox recipient IDs cannot be empty")
		}
		if len(recipient) > maxRecipientBytes || !utf8.ValidString(recipient) {
			return nil, apperrors.NewBadRequest("Inbox recipient IDs must be valid UTF-8 and at most 256 bytes")
		}
		if _, exists := seen[recipient]; exists {
			continue
		}
		seen[recipient] = struct{}{}
		recipients = append(recipients, recipient)
		if len(recipients) > maxRecipients {
			return nil, apperrors.NewBadRequest("Inbox messages support at most 500 recipients per request")
		}
	}
	return recipients, nil
}

func normalizeData(raw json.RawMessage) ([]byte, error) {
	if len(bytes.TrimSpace(raw)) == 0 {
		return []byte(`{}`), nil
	}
	if len(raw) > maxDataBytes {
		return nil, apperrors.NewBadRequest("Inbox data must be at most 32000 bytes")
	}
	var object map[string]any
	if err := json.Unmarshal(raw, &object); err != nil || object == nil {
		return nil, apperrors.NewBadRequest("Inbox data must be a JSON object")
	}
	return json.Marshal(object)
}

func normalizeActions(values []Action) ([]byte, error) {
	if len(values) > maxActions {
		return nil, apperrors.NewBadRequest("Inbox messages support at most 4 actions")
	}
	seen := make(map[string]struct{}, len(values))
	actions := make([]Action, 0, len(values))
	for _, value := range values {
		action := Action{
			ID:    strings.TrimSpace(value.ID),
			Label: strings.TrimSpace(value.Label),
			URL:   strings.TrimSpace(value.URL),
			Style: strings.ToLower(strings.TrimSpace(value.Style)),
		}
		if action.ID == "" || len(action.ID) > maxActionIDBytes || !categoryPattern.MatchString(strings.ToLower(action.ID)) {
			return nil, apperrors.NewBadRequest("Inbox action IDs are required and must use letters, numbers, dots, underscores, or hyphens")
		}
		if _, exists := seen[action.ID]; exists {
			return nil, apperrors.NewBadRequest("Inbox action IDs must be unique")
		}
		seen[action.ID] = struct{}{}
		if action.Label == "" || len(action.Label) > maxActionLabel {
			return nil, apperrors.NewBadRequest("Inbox action labels are required and must be at most 120 bytes")
		}
		if action.URL == "" || len(action.URL) > maxActionURL || !safeActionURL(action.URL) {
			return nil, apperrors.NewBadRequest("Inbox action URLs must be relative paths or HTTPS URLs")
		}
		if action.Style == "" {
			action.Style = ActionStyleLink
		}
		if !validActionStyle(action.Style) {
			return nil, apperrors.NewBadRequest("Inbox action style must be primary, secondary, danger, or link")
		}
		actions = append(actions, action)
	}
	return json.Marshal(actions)
}

func safeActionURL(value string) bool {
	if strings.HasPrefix(value, "/") && !strings.HasPrefix(value, "//") {
		return true
	}
	parsed, err := url.Parse(value)
	return err == nil && parsed.Scheme == "https" && parsed.Host != "" && parsed.User == nil
}

func validPriority(value string) bool {
	switch value {
	case PriorityLow, PriorityNormal, PriorityHigh, PriorityUrgent:
		return true
	default:
		return false
	}
}

func validActionStyle(value string) bool {
	switch value {
	case ActionStylePrimary, ActionStyleSecondary, ActionStyleDanger, ActionStyleLink:
		return true
	default:
		return false
	}
}
