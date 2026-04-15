# LogWatch — Go Performance Challenge

## Overview

**LogWatch** is a log analytics pipeline written in Go. It ingests 10,000
synthetic structured log records, builds multi-key indexes, computes
per-endpoint aggregates (error rates, percentile latencies), evaluates 50
alert rules, detects near-duplicate log entries via bigram Jaccard similarity,
and produces a summary report.

The code compiles cleanly, runs correctly, and produces deterministic output.
But it's **slow**. Your job is to find and fix the performance bottlenecks
without changing the results.

---

## Getting Started

```bash
go build -o logwatch . && ./logwatch
```

Expected baseline output (timing varies by machine):

```
--- Timing ---
Total time:        ~30+ seconds
Records ingested:  10000
Endpoints:         200
Errors:            6054
Avg latency:       248.285837
Alerts fired:      29
Duplicates found:  122031
Checksum:          155793695.654716
```

Your goal: make it as fast as possible while keeping all output values
identical — especially `Checksum: 155793695.654716`.

---

## Rules

1. **Correctness first.** All output values (including the checksum) must
   remain identical. If any value changes, your submission is invalid.
2. **You may edit anything in `internal/pipeline/`.** Rewrite functions, change
   data structures, alter algorithms, add concurrency — anything goes as long
   as the output matches.
3. **Do not modify `main.go` or `corpus/corpus.go`.** Input generation and
   output format must stay the same.
4. **Standard library only.** No third-party packages.
5. **No compiler tricks.** No `-gcflags`, no assembly, no `unsafe`.

---

## Grading

Grading is based on speedup over the unoptimised baseline — **faster is
better**. Tier thresholds and point values are not disclosed.

---

## Files

```
challenge/go/
├── go.mod
├── main.go                       # Entry point (do not modify)
├── internal/
│   ├── types/
│   │   └── types.go              # Data structures
│   ├── corpus/
│   │   └── corpus.go             # Data generator (do not modify)
│   └── pipeline/
│       ├── ingest.go             # Record ingestion and enrichment
│       ├── index.go              # Multi-key index construction
│       ├── aggregate.go          # Per-endpoint statistics
│       ├── alert.go              # Alert rule evaluation
│       ├── dedup.go              # Near-duplicate detection
│       ├── pipeline.go           # Stage orchestration
│       └── report.go             # Summary and checksum generation
└── README.md                     # This file
```

---

## Profiling Tips

```bash
# Build and run with GC tracing
GODEBUG=gctrace=1 ./logwatch

# CPU profile (add a benchmark test, then):
go test -bench=. -cpuprofile=cpu.prof
go tool pprof -http=:8080 cpu.prof

# Memory profile
go test -bench=. -memprofile=mem.prof
go tool pprof -http=:8080 mem.prof

# See which functions are slowest
go tool pprof -top cpu.prof
```

Good luck!
