package email

import "encoding/json"

// UnmarshalJSON keeps optional collection fields canonical at the API boundary.
// Go decodes omitted or explicit null slices as nil, which json.Marshal encodes
// back to null. The persistence schema requires attachments and tags to be JSON
// arrays, so normalize both forms to empty non-nil slices.
func (request *SendRequest) UnmarshalJSON(data []byte) error {
	type alias SendRequest
	if err := json.Unmarshal(data, (*alias)(request)); err != nil {
		return err
	}
	if request.Attachments == nil {
		request.Attachments = []Attachment{}
	}
	if request.Tags == nil {
		request.Tags = []Tag{}
	}
	return nil
}
