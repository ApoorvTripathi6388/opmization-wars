# Optimization Wars — Rust Challenge

## The Problem

You have been handed the source code for **texrank** — a text ranking engine written
in Rust. It indexes 2,000 synthetic documents, computes TF-IDF scores, runs 100 ranked
queries, detects near-duplicate documents via Jaccard similarity, and produces a
summary report.

The code compiles cleanly, runs correctly, and produces deterministic output.

**It is also painfully slow.**

The codebase contains multiple algorithmic and parallelization anti-patterns hidden
behind clean abstractions and reasonable-looking design decisions. Your job is to find
them and fix them.

---

## What You're Given

```
challenge/rust/
├── Cargo.toml
├── src/
│   ├── main.rs        # Entry point, timing, checksum
│   ├── lib.rs         # Module declarations
│   ├── types.rs       # Data structures
│   ├── corpus.rs      # Deterministic data generator
│   ├── index.rs       # Inverted index construction
│   ├── score.rs       # TF-IDF scoring
│   ├── query.rs       # Query processing
│   ├── dedup.rs       # Near-duplicate detection
│   ├── pipeline.rs    # Stage orchestration
│   └── report.rs      # Summary aggregation
└── README.md          # This file
```

---

## Build & Run

```bash
cargo build --release
./target/release/texrank
```

The output ends with:
```
--- Timing ---
Total time:      X.XXX seconds
Total documents: 2000
Total terms:     400000
Avg doc length:  200.0
Queries run:     100
Avg query score: 0.036758
Duplicates:      0
Checksum:        36.758097
```

Note the **checksum** — your optimized version must match it exactly.

---

## Rules

1. **Correctness is mandatory.** Your optimized version must produce:
   - `Checksum: 36.758097`
   - `Avg query score: 0.036758`

   If either value differs, your submission scores **zero** regardless of speedup.

2. **You may restructure anything.** Rewrite modules, change data structures, alter
   algorithms, add parallelism, fuse stages — anything goes as long as the output
   matches.

3. **You may NOT change these things:**
   - The constants in `corpus.rs` (document count, vocabulary size, query count, etc.)
   - The corpus/query generators — input data must be identical
   - The output format (the `--- Timing ---` block must be parseable)

4. **The `rayon` crate is already available** in `Cargo.toml`. You may use it. You may
   NOT add other external crates.

5. **The release profile stays the same:** `opt-level = 2`. No `opt-level = 3`, no
   `target-cpu=native`, no `lto = true`. Your improvements must come from better
   algorithms and better use of parallelism, not better compiler settings.

---

## Grading

Grading is based on speedup over the unoptimised baseline — **faster is
better**. Tier thresholds and point values are not disclosed.

---

## Hints

There are no hints. Use profiling tools.

```bash
# Useful starting points:
cargo build --release
perf stat ./target/release/texrank
perf record -g ./target/release/texrank && perf report
cargo install flamegraph && cargo flamegraph
```

---

## Submission

Submit your modified `challenge/rust/` directory. Include:
- All source files
- Your `Cargo.toml` (may be modified only to add build settings within the rules)
- Optionally: a `REPORT.md` explaining your findings

Good luck.
