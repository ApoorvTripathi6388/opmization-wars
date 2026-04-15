package pipeline

import (
	"logwatch/internal/types"
)

// EvaluateAlerts checks each alert rule against the computed aggregates.
func EvaluateAlerts(
	rules []types.AlertRule,
	stats map[string]*types.EndpointStats,
) []types.AlertResult {
	results := make([]types.AlertResult, 0, len(rules))

	for _, rule := range rules {
		st, ok := stats[rule.Endpoint]
		if !ok {
			results = append(results, types.AlertResult{
				RuleID:   rule.ID,
				Endpoint: rule.Endpoint,
				Metric:   rule.Metric,
				Value:    0,
				Fired:    false,
			})
			continue
		}

		var value float64
		switch rule.Metric {
		case "error_rate":
			if st.Count > 0 {
				value = float64(st.ErrorCount) / float64(st.Count)
			}
		case "p99_latency":
			value = Percentile(st.Latencies, 99)
		case "count":
			value = float64(st.Count)
		}

		fired := value > rule.Threshold

		results = append(results, types.AlertResult{
			RuleID:   rule.ID,
			Endpoint: rule.Endpoint,
			Metric:   rule.Metric,
			Value:    value,
			Fired:    fired,
		})
	}

	return results
}
