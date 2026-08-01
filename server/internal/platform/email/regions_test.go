package email

import (
	"slices"
	"testing"
)

func TestNormalizeSESRegion(t *testing.T) {
	region, ok := NormalizeSESRegion(" EU-NORTH-1 ")
	if !ok || region != "eu-north-1" {
		t.Fatalf("NormalizeSESRegion() = %q, %v", region, ok)
	}
	if region, ok := NormalizeSESRegion("eu-west-1"); ok || region != "eu-west-1" {
		t.Fatalf("unsupported region = %q, %v", region, ok)
	}
}

func TestSupportedSESRegionsReturnsSortedCopy(t *testing.T) {
	regions := SupportedSESRegions()
	if !slices.IsSorted(regions) || !slices.Contains(regions, "eu-north-1") {
		t.Fatalf("regions = %v", regions)
	}
	regions[0] = "modified"
	if slices.Contains(SupportedSESRegions(), "modified") {
		t.Fatal("caller mutated shared supported region policy")
	}
}
