package architecture

import (
	"bytes"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestRiverDependencyIsRemoved(t *testing.T) {
	t.Parallel()

	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("resolve architecture test path")
	}
	moduleRoot := filepath.Clean(filepath.Join(filepath.Dir(currentFile), "..", ".."))
	bannedModule := "github.com/" + "riverqueue/river"

	for _, name := range []string{"go.mod", "go.sum"} {
		content, err := os.ReadFile(filepath.Join(moduleRoot, name))
		if err != nil {
			t.Fatalf("read %s: %v", name, err)
		}
		if bytes.Contains(content, []byte(bannedModule)) {
			t.Fatalf("%s still references %s", name, bannedModule)
		}
	}

	obsoleteHelper := filepath.Join(moduleRoot, "internal", "worker", "client.go")
	if _, err := os.Stat(obsoleteHelper); err == nil {
		t.Fatalf("obsolete River helper still exists: %s", obsoleteHelper)
	} else if !os.IsNotExist(err) {
		t.Fatalf("inspect obsolete River helper: %v", err)
	}

	err := filepath.WalkDir(moduleRoot, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			name := entry.Name()
			if name == ".git" || name == "vendor" {
				return filepath.SkipDir
			}
			return nil
		}
		if filepath.Ext(path) != ".go" || path == currentFile {
			return nil
		}
		content, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		if strings.Contains(string(content), bannedModule) {
			relative, relErr := filepath.Rel(moduleRoot, path)
			if relErr != nil {
				return relErr
			}
			t.Errorf("River import remains in %s", relative)
		}
		return nil
	})
	if err != nil {
		t.Fatalf("scan Go source for River imports: %v", err)
	}
}
