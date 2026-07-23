package senderid

import "testing"

func TestValidateCreateNormalizesSenderID(t *testing.T) {
	provider := "  internal  "
	name, countryCode, purpose, normalizedProvider, err := validateCreate(CreateRequest{
		Name:        "  Dugble  ",
		CountryCode: " gh ",
		Purpose:     " Transactional alerts ",
		Provider:    &provider,
	})
	if err != nil {
		t.Fatalf("validateCreate returned error: %v", err)
	}
	if name != "Dugble" {
		t.Fatalf("name = %q, want Dugble", name)
	}
	if countryCode != "GH" {
		t.Fatalf("countryCode = %q, want GH", countryCode)
	}
	if purpose != "Transactional alerts" {
		t.Fatalf("purpose = %q, want Transactional alerts", purpose)
	}
	if normalizedProvider == nil || *normalizedProvider != "internal" {
		t.Fatalf("provider = %v, want internal", normalizedProvider)
	}
}

func TestValidateCreateRejectsInvalidSenderID(t *testing.T) {
	_, _, _, _, err := validateCreate(CreateRequest{
		Name:        "sender-name-too-long",
		CountryCode: "US",
		Purpose:     "Transactional alerts",
	})
	if err == nil {
		t.Fatal("validateCreate returned nil error for long sender ID")
	}
}

func TestValidateCreateRejectsInvalidCountryCode(t *testing.T) {
	_, _, _, _, err := validateCreate(CreateRequest{
		Name:        "Dugble",
		CountryCode: "USA",
		Purpose:     "Transactional alerts",
	})
	if err == nil {
		t.Fatal("validateCreate returned nil error for invalid country code")
	}
}

func TestValidateBulkCreateNormalizesSharedFields(t *testing.T) {
	provider := "  Arkesel  "
	requests, err := validateBulkCreate(BulkCreateRequest{
		SenderIDs:   []string{" Dugble ", "DugPay"},
		CountryCode: " gh ",
		Purpose:     " OTP and transaction alerts ",
		Provider:    &provider,
	})
	if err != nil {
		t.Fatalf("validateBulkCreate returned error: %v", err)
	}
	if len(requests) != 2 {
		t.Fatalf("len(requests) = %d, want 2", len(requests))
	}
	if requests[0].Name != "Dugble" || requests[1].Name != "DugPay" {
		t.Fatalf("unexpected normalized names: %#v", requests)
	}
	if requests[0].CountryCode != "GH" || requests[0].Purpose != "OTP and transaction alerts" {
		t.Fatalf("unexpected normalized shared fields: %#v", requests[0])
	}
	if requests[0].Provider == nil || *requests[0].Provider != "Arkesel" {
		t.Fatalf("provider = %v, want Arkesel", requests[0].Provider)
	}
}

func TestValidateBulkCreateRejectsCaseInsensitiveDuplicates(t *testing.T) {
	_, err := validateBulkCreate(BulkCreateRequest{
		SenderIDs:   []string{"Dugble", "dugble"},
		CountryCode: "GH",
		Purpose:     "Transactional alerts",
	})
	if err == nil {
		t.Fatal("validateBulkCreate returned nil error for duplicate sender IDs")
	}
}

func TestValidateBulkCreateRejectsMoreThanMaximum(t *testing.T) {
	senderIDs := make([]string, maxBulkSenderIDs+1)
	for index := range senderIDs {
		senderIDs[index] = "Dugble"
	}
	_, err := validateBulkCreate(BulkCreateRequest{
		SenderIDs:   senderIDs,
		CountryCode: "GH",
		Purpose:     "Transactional alerts",
	})
	if err == nil {
		t.Fatal("validateBulkCreate returned nil error for oversized request")
	}
}
