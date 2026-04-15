// Package types defines shared data structures for the log analytics pipeline.
package types

// LogRecord represents a single structured log entry.
type LogRecord struct {
	ID        uint64
	Timestamp uint64
	Endpoint  string
	Status    int
	Latency   float64
	Message   string
	Tags      []string
}

// EndpointStats holds aggregated metrics for a single endpoint.
type EndpointStats struct {
	Endpoint   string
	Count      int64
	ErrorCount int64
	TotalLat   float64
	MinLat     float64
	MaxLat     float64
	Latencies  []float64
}

// AlertRule defines a threshold-based alert condition.
type AlertRule struct {
	ID        int
	Endpoint  string
	Metric    string
	Threshold float64
}

// AlertResult records whether an alert rule fired.
type AlertResult struct {
	RuleID   int
	Endpoint string
	Metric   string
	Value    float64
	Fired    bool
}

// DuplicatePair records two near-duplicate log entries.
type DuplicatePair struct {
	RecordA    uint64
	RecordB    uint64
	Similarity float64
}

// ReportStats holds the final summary.
type ReportStats struct {
	TotalRecords    int
	TotalEndpoints  int
	TotalErrors     int64
	AvgLatency      float64
	AlertsFired     int
	DuplicatesFound int
	Checksum        float64
}

// PipelineResult holds all outputs from the pipeline.
type PipelineResult struct {
	Records    []LogRecord
	Index      map[string][]int
	Stats      map[string]*EndpointStats
	Alerts     []AlertResult
	Duplicates []DuplicatePair
	Report     ReportStats
}
