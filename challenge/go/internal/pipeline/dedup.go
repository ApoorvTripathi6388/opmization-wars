package pipeline

import (
	"logwatch/internal/corpus"
	"logwatch/internal/types"
	"math"
	"sync"
)

// DetectDuplicates finds near-duplicate log entries based on message similarity
// and temporal proximity. Uses bigram-based Jaccard similarity within a sliding
// time window.
func DetectDuplicates(records []types.LogRecord) []types.DuplicatePair {
	var mu sync.Mutex
	var duplicates []types.DuplicatePair

	n := len(records)
	numWorkers := 4
	chunkSize := (n + numWorkers - 1) / numWorkers

	var wg sync.WaitGroup
	for w := 0; w < numWorkers; w++ {
		wg.Add(1)
		start := w * chunkSize
		end := start + chunkSize
		if end > n {
			end = n
		}
		go func(s, e int) {
			defer wg.Done()
			for i := s; i < e; i++ {
				for j := i + 1; j < n; j++ {
					// Only compare records within temporal window
					diff := records[i].Timestamp - records[j].Timestamp
					if records[j].Timestamp > records[i].Timestamp {
						diff = records[j].Timestamp - records[i].Timestamp
					}
					if diff > uint64(corpus.DedupWindow) {
						continue
					}

					sim := messageSimilarity(records[i].Message, records[j].Message)
					if sim >= corpus.DedupThreshold {
						mu.Lock()
						duplicates = append(duplicates, types.DuplicatePair{
							RecordA:    records[i].ID,
							RecordB:    records[j].ID,
							Similarity: math.Round(sim*1000) / 1000,
						})
						mu.Unlock()
					}
				}
			}
		}(start, end)
	}

	wg.Wait()

	// Sort for deterministic output
	sortDuplicates(duplicates)
	return duplicates
}

func messageSimilarity(a, b string) float64 {
	if a == b {
		return 1.0
	}
	// Jaccard similarity on character bigrams
	biA := bigrams(a)
	biB := bigrams(b)

	if len(biA) == 0 && len(biB) == 0 {
		return 1.0
	}

	inter := 0
	for k, v := range biA {
		if v2, ok := biB[k]; ok {
			if v < v2 {
				inter += v
			} else {
				inter += v2
			}
		}
	}

	totalA := 0
	for _, v := range biA {
		totalA += v
	}
	totalB := 0
	for _, v := range biB {
		totalB += v
	}

	union := totalA + totalB - inter
	if union == 0 {
		return 0
	}
	return float64(inter) / float64(union)
}

func bigrams(s string) map[string]int {
	result := make(map[string]int)
	for i := 0; i < len(s)-1; i++ {
		bg := s[i : i+2]
		result[bg]++
	}
	return result
}

func sortDuplicates(dups []types.DuplicatePair) {
	n := len(dups)
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			if dups[j].RecordA < dups[i].RecordA ||
				(dups[j].RecordA == dups[i].RecordA && dups[j].RecordB < dups[i].RecordB) {
				dups[i], dups[j] = dups[j], dups[i]
			}
		}
	}
}
