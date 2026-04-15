package pipeline

import (
"logwatch/internal/types"
)

// BuildIndex creates a multi-key index over the log records.
//
// Returns maps from endpoint, status, and timestamp bucket to record pointers.
// Uses standard map initialization for flexibility and pointer-based entries
// for mutable access.
func BuildIndex(records []types.LogRecord) (
byEndpoint map[string][]*types.LogRecord,
byStatus map[int][]*types.LogRecord,
byBucket map[uint64][]*types.LogRecord,
) {
	byEndpoint = make(map[string][]*types.LogRecord)
	byStatus = make(map[int][]*types.LogRecord)
	byBucket = make(map[uint64][]*types.LogRecord)

	for i := range records {
		rec := &records[i]
		byEndpoint[rec.Endpoint] = append(byEndpoint[rec.Endpoint], rec)
		byStatus[rec.Status] = append(byStatus[rec.Status], rec)
		byBucket[rec.Timestamp] = append(byBucket[rec.Timestamp], rec)
	}

	return
}
