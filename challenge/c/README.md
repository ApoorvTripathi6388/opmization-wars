# Optimization Wars — C Challenge

## The Problem

You have been handed the source code for **sgrid** — a multi-threaded Sensor Grid
Analytics Engine written in C. It processes a 1024×1024 sensor grid over 100 timesteps:
ingesting data, applying spatial filters, detecting anomalies, computing regional
statistics, and storing results.

The code compiles cleanly, runs correctly, and produces deterministic output.

**It is also painfully slow.**

The codebase contains multiple hardware-level performance anti-patterns hidden behind
clean abstractions and reasonable-looking design decisions. Your job is to find them
and fix them.

---

## What You're Given

```
challenge/c/
├── include/sgrid/     # Public API headers
│   ├── config.h       # Grid dimensions, thread count, thresholds
│   ├── dataset.h      # Synthetic data generator
│   ├── matrix.h       # 2-D matrix abstraction
│   ├── sensor.h       # Sensor data structures
│   ├── filter.h       # Spatial filtering & anomaly detection
│   ├── aggregate.h    # Regional statistics
│   ├── storage.h      # Time-series result storage
│   └── parallel.h     # Multi-threaded processing
├── src/               # Implementation files
├── Makefile           # Build system
└── README.md          # This file
```

---

## Build & Run

```bash
make clean && make all
./bin/sgrid
```

The output ends with:
```
--- Timing ---
Total time:      X.XXX seconds
Total anomalies: 16047
Checksum:        6738.149468
```

Note the **checksum** and **anomaly count** — your optimized version must match these
exactly.

---

## Rules

1. **Correctness is mandatory.** Your optimized version must produce:
   - `Checksum: 6738.149468`
   - `Total anomalies: 16047`

   If either value differs, your submission scores **zero** regardless of speedup.

2. **You may restructure anything.** Rewrite files, change data structures, alter
   memory layouts, fuse passes, remove abstractions — anything goes as long as the
   output matches.

3. **You may NOT change these things:**
   - The values in `config.h` (grid size, timestep count, thread count, thresholds)
   - The dataset generator (`dataset.c`) — input data must be identical
   - The output format (the `--- Timing ---` block must be parseable)

4. **External libraries are not allowed.** No SIMD intrinsics libraries, no OpenMP,
   no BLAS/LAPACK. You may use compiler built-ins and standard C library only.

5. **The compiler flags stay the same:** `-std=c11 -O2 -Wall -Wextra`. No `-O3`,
   no `-march=native`, no `-ffast-math`. Your improvements must come from better code,
   not better flags.

---

## Grading

Grading is based on speedup over the unoptimised baseline — **faster is
better**. Tier thresholds and point values are not disclosed.

---

## Hints

There are no hints. Use profiling tools.

```bash
# Useful starting points:
perf stat ./bin/sgrid
perf record -g ./bin/sgrid && perf report
valgrind --tool=cachegrind ./bin/sgrid
```

---

## Submission

Submit your modified `challenge/c/` directory. Include:
- All source files (modified headers and/or source)
- Your Makefile (may be modified if you restructured files)
- Optionally: a `REPORT.md` explaining your findings

Good luck.
