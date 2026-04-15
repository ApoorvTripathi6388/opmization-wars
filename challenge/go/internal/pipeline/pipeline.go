package pipeline

import (
	"logwatch/internal/types"
)

// RunPipeline executes the complete log analytics pipeline.
//
// Each stage completes before the next begins, ensuring clear data
// boundaries between processing steps.
func RunPipeline(
	records []types.LogRecord,
	rules []types.AlertRule,
) *types.PipelineResult {
	// Stage 1: Ingest (enrich records)
	processed := IngestRecords(records)

	// Stage 2: Index
	byEndpoint, _, _ := BuildIndex(processed)

	// Stage 3: Aggregate
	stats := ComputeAggregates(byEndpoint)

	// Stage 4: Evaluate alerts
	alerts := EvaluateAlerts(rules, stats)

	// Stage 5: Dedup
	duplicates := DetectDuplicates(processed)

	// Stage 6: Report
	report := GenerateReport(processed, stats, alerts, duplicates)

	return &types.PipelineResult{
		Records:    processed,
		Stats:      stats,
		Alerts:     alerts,
		Duplicates: duplicates,
		Report:     report,
	}
}
