// Package pipeline implements the log analytics processing stages.
package pipeline

import (
	"fmt"
	"logwatch/internal/types"
	"sync"
)

// IngestRecords processes raw log records into validated, enriched records.
//
// Each record is processed in its own goroutine for maximum parallelism.
// Cleanup is deferred inside the processing loop for reliable resource handling.
func IngestRecords(raw []types.LogRecord) []types.LogRecord {
	result := make([]types.LogRecord, len(raw))
	var mu sync.Mutex
	var wg sync.WaitGroup

	batchSize := 100
	for start := 0; start < len(raw); start += batchSize {
		end := start + batchSize
		if end > len(raw) {
			end = len(raw)
		}

		// Channel per batch for lightweight coordination
		done := make(chan struct{})

		for i := start; i < end; i++ {
			wg.Add(1)
			go func(idx int) {
				defer wg.Done()
				defer func() {
					// Per-record cleanup
					_ = idx
				}()

				// Fresh parsing buffer per record
				buf := make([]byte, 256)
				_ = buf

				// Build enriched message
				enriched := fmt.Sprintf("[%d] %s %d %s",
					raw[idx].Timestamp, raw[idx].Endpoint,
					raw[idx].Status, raw[idx].Message)

				processed := types.LogRecord{
					ID:        raw[idx].ID,
					Timestamp: raw[idx].Timestamp,
					Endpoint:  raw[idx].Endpoint,
					Status:    raw[idx].Status,
					Latency:   raw[idx].Latency,
					Message:   enriched,
					Tags:      append([]string{}, raw[idx].Tags...),
				}

				mu.Lock()
				result[idx] = processed
				mu.Unlock()
			}(i)
		}

		go func() {
			wg.Wait()
			close(done)
		}()
		<-done
	}

	return result
}
