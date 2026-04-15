// Log Watch — Log Analytics Pipeline
package main

import (
	"fmt"
	"logwatch/internal/corpus"
	"logwatch/internal/pipeline"
	"time"
)

func main() {
	fmt.Println("Log Watch — Log Analytics Pipeline")
	fmt.Printf("Records: %d, Endpoints: %d, Alert Rules: %d\n\n",
		corpus.NumRecords, corpus.NumEndpoints, corpus.NumAlertRules)

	t0 := time.Now()

	records := corpus.GenerateRecords()
	rules := corpus.GenerateAlertRules()
	tGen := time.Since(t0)
	fmt.Printf("Data generated in %.3fs\n", tGen.Seconds())

	result := pipeline.RunPipeline(records, rules)
	tTotal := time.Since(t0)

	fmt.Println("\n--- Timing ---")
	fmt.Printf("Total time:        %.3f seconds\n", tTotal.Seconds())
	fmt.Printf("Records ingested:  %d\n", result.Report.TotalRecords)
	fmt.Printf("Endpoints:         %d\n", result.Report.TotalEndpoints)
	fmt.Printf("Errors:            %d\n", result.Report.TotalErrors)
	fmt.Printf("Avg latency:       %.6f\n", result.Report.AvgLatency)
	fmt.Printf("Alerts fired:      %d\n", result.Report.AlertsFired)
	fmt.Printf("Duplicates found:  %d\n", result.Report.DuplicatesFound)
	fmt.Printf("Checksum:          %.6f\n", result.Report.Checksum)
}
