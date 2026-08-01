package config

import "testing"

func TestFailoverRegionMustBeConfigured(t *testing.T) {
	config := &Config{AWS: AWSConfig{
		Region: "us-east-1", Regions: []string{" US-EAST-1 ", "eu-north-1", "us-east-1"}, FailoverRegion: " EU-NORTH-1 ",
	}}
	config.normalize()
	if err := config.validate(); err != nil {
		t.Fatalf("validate configured failover: %v", err)
	}
	if len(config.AWS.Regions) != 2 || config.AWS.Regions[0] != "us-east-1" || config.AWS.Regions[1] != "eu-north-1" {
		t.Fatalf("normalized regions = %v", config.AWS.Regions)
	}
}

func TestFailoverRegionRejectsUnknownRegion(t *testing.T) {
	config := &Config{AWS: AWSConfig{
		Region: "us-east-1", Regions: []string{"us-east-1", "eu-north-1"}, FailoverRegion: "ap-south-1",
	}}
	config.normalize()
	if err := config.validate(); err == nil {
		t.Fatal("expected unknown failover region to be rejected")
	}
}
