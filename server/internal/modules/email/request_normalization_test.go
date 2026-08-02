package email

import (
	"encoding/json"
	"testing"
)

func TestSendRequestNormalizesOmittedCollections(t *testing.T) {
	var request SendRequest
	if err := json.Unmarshal([]byte(`{
		"to":"recipient@example.com",
		"subject":"Hello",
		"text":"Hello"
	}`), &request); err != nil {
		t.Fatalf("decode request: %v", err)
	}

	assertCanonicalCollections(t, request)
}

func TestSendRequestNormalizesNullCollections(t *testing.T) {
	var request SendRequest
	if err := json.Unmarshal([]byte(`{
		"to":"recipient@example.com",
		"subject":"Hello",
		"text":"Hello",
		"attachments":null,
		"tags":null
	}`), &request); err != nil {
		t.Fatalf("decode request: %v", err)
	}

	assertCanonicalCollections(t, request)
}

func TestSendRequestPreservesPopulatedCollections(t *testing.T) {
	var request SendRequest
	if err := json.Unmarshal([]byte(`{
		"to":"recipient@example.com",
		"subject":"Hello",
		"text":"Hello",
		"attachments":[{"filename":"hello.txt","content":"aGVsbG8="}],
		"tags":[{"name":"test","value":"email"}]
	}`), &request); err != nil {
		t.Fatalf("decode request: %v", err)
	}

	if len(request.Attachments) != 1 || request.Attachments[0].Filename != "hello.txt" {
		t.Fatalf("attachments were not preserved: %#v", request.Attachments)
	}
	if len(request.Tags) != 1 || request.Tags[0].Name != "test" {
		t.Fatalf("tags were not preserved: %#v", request.Tags)
	}
}

func assertCanonicalCollections(t *testing.T, request SendRequest) {
	t.Helper()

	if request.Attachments == nil {
		t.Fatal("attachments must be a non-nil empty slice")
	}
	if request.Tags == nil {
		t.Fatal("tags must be a non-nil empty slice")
	}

	attachments, err := json.Marshal(request.Attachments)
	if err != nil {
		t.Fatalf("marshal attachments: %v", err)
	}
	if string(attachments) != "[]" {
		t.Fatalf("attachments JSON = %s, want []", attachments)
	}

	tags, err := json.Marshal(request.Tags)
	if err != nil {
		t.Fatalf("marshal tags: %v", err)
	}
	if string(tags) != "[]" {
		t.Fatalf("tags JSON = %s, want []", tags)
	}
}
