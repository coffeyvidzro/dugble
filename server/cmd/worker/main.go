package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	log.Println("worker started (logging every minute)")

	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	// Optional: log immediately on startup
	log.Println("working...")

	for {
		select {
		case <-ctx.Done():
			log.Println("worker stopping")
			return
		case <-ticker.C:
			log.Println("working...")
		}
	}
}
