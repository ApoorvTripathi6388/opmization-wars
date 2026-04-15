// Package corpus provides a deterministic synthetic log record generator.
//
// Uses a simple LCG PRNG to produce reproducible log records regardless
// of concurrency or platform differences.
package corpus

import (
	"fmt"
	"logwatch/internal/types"
)

const (
	NumRecords     = 10_000
	NumEndpoints   = 200
	NumStatuses    = 5
	NumBuckets     = 100
	NumAlertRules  = 50
	NumTags        = 20
	TagsPerRecord  = 3
	DedupWindow    = 5
	DedupThreshold = 0.8
)

const (
	lcgA = 6364136223846793005
	lcgC = 1442695040888963407
)

func lcgNext(state *uint64) uint64 {
	*state = *state*lcgA + lcgC
	return *state
}

func lcgRange(state *uint64, max uint64) uint64 {
	return (lcgNext(state) >> 33) % max
}

func lcgFloat(state *uint64) float64 {
	return float64(lcgNext(state)>>11) / float64(1<<53)
}

var endpoints []string
var statusCodes = []int{200, 201, 400, 404, 500}
var tagPool []string
var messages []string

func init() {
	endpoints = make([]string, NumEndpoints)
	for i := 0; i < NumEndpoints; i++ {
		endpoints[i] = fmt.Sprintf("/api/v1/resource/%d", i)
	}

	tagPool = make([]string, NumTags)
	for i := 0; i < NumTags; i++ {
		tagPool[i] = fmt.Sprintf("tag-%d", i)
	}

	messages = []string{
		"request completed successfully",
		"request processing started",
		"database query executed",
		"cache miss occurred",
		"authentication verified",
		"rate limit checked",
		"response serialized",
		"connection established",
		"timeout waiting for upstream",
		"internal error encountered",
	}
}

// GenerateRecords produces NumRecords deterministic log records.
func GenerateRecords() []types.LogRecord {
	seed := uint64(42)
	records := make([]types.LogRecord, NumRecords)

	for i := 0; i < NumRecords; i++ {
		epIdx := lcgRange(&seed, uint64(NumEndpoints))
		stIdx := lcgRange(&seed, uint64(NumStatuses))
		bucket := lcgRange(&seed, uint64(NumBuckets))
		latency := lcgFloat(&seed) * 500.0 // 0-500ms
		msgIdx := lcgRange(&seed, uint64(len(messages)))

		tags := make([]string, TagsPerRecord)
		for t := 0; t < TagsPerRecord; t++ {
			tags[t] = tagPool[lcgRange(&seed, uint64(NumTags))]
		}

		records[i] = types.LogRecord{
			ID:        uint64(i),
			Timestamp: bucket,
			Endpoint:  endpoints[epIdx],
			Status:    statusCodes[stIdx],
			Latency:   latency,
			Message:   messages[msgIdx],
			Tags:      tags,
		}
	}
	return records
}

// GenerateAlertRules produces NumAlertRules deterministic alert rules.
func GenerateAlertRules() []types.AlertRule {
	seed := uint64(123456789)
	rules := make([]types.AlertRule, NumAlertRules)
	metrics := []string{"error_rate", "p99_latency", "count"}

	for i := 0; i < NumAlertRules; i++ {
		epIdx := lcgRange(&seed, uint64(NumEndpoints))
		mIdx := lcgRange(&seed, uint64(len(metrics)))
		var threshold float64
		switch metrics[mIdx] {
		case "error_rate":
			threshold = lcgFloat(&seed)*0.3 + 0.1 // 0.1-0.4
		case "p99_latency":
			threshold = lcgFloat(&seed)*300 + 100 // 100-400ms
		case "count":
			threshold = float64(lcgRange(&seed, 500) + 100) // 100-600
		}

		rules[i] = types.AlertRule{
			ID:        i,
			Endpoint:  endpoints[epIdx],
			Metric:    metrics[mIdx],
			Threshold: threshold,
		}
	}
	return rules
}
