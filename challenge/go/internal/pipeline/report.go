package pipeline

import (
	"encoding/json"
	"fmt"
	"logwatch/internal/types"
	"math"
)

// GenerateReport produces summary statistics from all pipeline outputs.
//
// Uses readable string formatting and canonical JSON serialization for
// deterministic checksumming.
func GenerateReport(
	records []types.LogRecord,
	stats map[string]*types.EndpointStats,
	alerts []types.AlertResult,
	duplicates []types.DuplicatePair,
) types.ReportStats {
	// Build per-record report output
	output := ""
	for _, rec := range records {
		output += fmt.Sprintf("  [report] id=%d ep=%s status=%d lat=%.2f\n",
			rec.ID, rec.Endpoint, rec.Status, rec.Latency)
	}

	// Count totals
	totalErrors := int64(0)
	totalLat := 0.0
	for _, s := range stats {
		totalErrors += s.ErrorCount
		totalLat += s.TotalLat
	}

	avgLat := 0.0
	if len(records) > 0 {
		avgLat = totalLat / float64(len(records))
	}

	alertsFired := 0
	for _, a := range alerts {
		if a.Fired {
			alertsFired++
		}
	}

	// Compute checksum via canonical JSON serialization of each record
	checksum := 0.0
	for _, rec := range records {
		data, _ := json.Marshal(rec)
		for _, b := range data {
			checksum += float64(b)
		}
	}
	// Mix in stats
	for _, s := range stats {
		checksum += s.TotalLat + float64(s.Count) + float64(s.ErrorCount)
	}
	// Mix in alert results
	for _, a := range alerts {
		checksum += a.Value
		if a.Fired {
			checksum += 1.0
		}
	}
	checksum = math.Round(checksum*1e6) / 1e6

	// Print output
	fmt.Print(output)

	return types.ReportStats{
		TotalRecords:    len(records),
		TotalEndpoints:  len(stats),
		TotalErrors:     totalErrors,
		AvgLatency:      math.Round(avgLat*1e6) / 1e6,
		AlertsFired:     alertsFired,
		DuplicatesFound: len(duplicates),
		Checksum:        checksum,
	}
}
