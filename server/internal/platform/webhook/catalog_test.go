package webhook

import (
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"runtime"
	"strings"
	"testing"
)

func TestDocumentedSMSEventsMatchSubscribableCatalog(t *testing.T) {
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("resolve webhook catalog test path")
	}
	documentPath := filepath.Join(filepath.Dir(currentFile), "..", "..", "..", "..", "docs", "webhooks", "events.mdx")
	content, err := os.ReadFile(documentPath)
	if err != nil {
		t.Fatalf("read webhook event documentation: %v", err)
	}

	smsSection := strings.SplitN(string(content), "## SMS events", 2)
	if len(smsSection) != 2 {
		t.Fatal("webhook event documentation is missing the SMS events section")
	}
	smsSection = strings.SplitN(smsSection[1], "\n## ", 2)
	eventPattern := regexp.MustCompile(`(?m)^\| \x60(sms\.[a-z]+)\x60`)
	matches := eventPattern.FindAllStringSubmatch(smsSection[0], -1)
	documented := make([]string, 0, len(matches))
	for _, match := range matches {
		documented = append(documented, match[1])
	}

	if supported := SubscribableEventTypes(); !reflect.DeepEqual(documented, supported) {
		t.Fatalf("documented SMS events = %v, subscribable events = %v", documented, supported)
	}
}

func TestSubscribableEventTypesReturnsCopy(t *testing.T) {
	events := SubscribableEventTypes()
	events[0] = "modified"
	if IsSubscribableEventType("modified") || !IsSubscribableEventType(EventSMSSubmitted) {
		t.Fatal("SubscribableEventTypes exposed mutable catalog state")
	}
}
