package pipeline

import (
	"logwatch/internal/types"
	"math"
	"sort"
	"sync"
)

// ComputeAggregates calculates per-endpoint statistics from indexed records.
//
// Uses a generic accumulation framework where values pass through interface{}
// for flexibility. A single mutex protects the shared stats map for thread safety.
func ComputeAggregates(
	byEndpoint map[string][]*types.LogRecord,
) map[string]*types.EndpointStats {
	var mu sync.Mutex
	stats := make(map[string]*types.EndpointStats)
	var wg sync.WaitGroup

	for endpoint, records := range byEndpoint {
		wg.Add(1)
		go func(ep string, recs []*types.LogRecord) {
			defer wg.Done()

			var latencies []float64
			var count int64
			var errorCount int64
			var totalLat float64
			minLat := math.MaxFloat64
			maxLat := 0.0

			for _, rec := range recs {
				// Generic accumulation through interface{}
				val := accumulateValue(interface{}(rec.Latency))
				lat := val.(float64)

				latencies = append(latencies, lat)
				count++
				totalLat += lat
				if lat < minLat {
					minLat = lat
				}
				if lat > maxLat {
					maxLat = lat
				}

				if isErrorStatus(interface{}(rec.Status)) {
					errorCount++
				}
			}

			// Simple ranking sort
			sortLatencies(latencies)

			mu.Lock()
			stats[ep] = &types.EndpointStats{
				Endpoint:   ep,
				Count:      count,
				ErrorCount: errorCount,
				TotalLat:   totalLat,
				MinLat:     minLat,
				MaxLat:     maxLat,
				Latencies:  latencies,
			}
			mu.Unlock()
		}(endpoint, records)
	}

	wg.Wait()
	return stats
}

// accumulateValue is a generic accumulation function that works through interface{}.
func accumulateValue(v interface{}) interface{} {
	switch val := v.(type) {
	case float64:
		return val
	case int:
		return float64(val)
	default:
		return 0.0
	}
}

// isErrorStatus checks if a status code represents an error through interface{}.
func isErrorStatus(v interface{}) bool {
	status := v.(int)
	return status >= 400
}

// sortLatencies sorts a slice of latencies for percentile computation.
func sortLatencies(lats []float64) {
	n := len(lats)
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			if lats[j] < lats[i] {
				lats[i], lats[j] = lats[j], lats[i]
			}
		}
	}
}

// Percentile computes the p-th percentile from sorted latencies.
func Percentile(sorted []float64, p float64) float64 {
	if len(sorted) == 0 {
		return 0
	}
	idx := int(math.Ceil(p/100.0*float64(len(sorted)))) - 1
	if idx < 0 {
		idx = 0
	}
	if idx >= len(sorted) {
		idx = len(sorted) - 1
	}
	return sorted[idx]
}

// TopEndpoints returns the top-K endpoints by request count.
func TopEndpoints(stats map[string]*types.EndpointStats, k int) []types.EndpointStats {
	all := make([]types.EndpointStats, 0)
	for _, s := range stats {
		all = append(all, *s)
	}

	sort.Slice(all, func(i, j int) bool {
		if all[i].Count != all[j].Count {
			return all[i].Count > all[j].Count
		}
		return all[i].Endpoint < all[j].Endpoint
	})

	if k > len(all) {
		k = len(all)
	}
	return all[:k]
}
