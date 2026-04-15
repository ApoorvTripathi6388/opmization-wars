# PathGrid — Python Performance Challenge

## Overview

**PathGrid** is a BFS shortest-path solver that operates on a 90×90 grid. It
generates a grid with ~30% walls, then runs 150 random source→destination
queries. For each query, BFS finds the shortest path (or reports unreachable).

The code is correct — every query returns the right answer. But it's **slow**.
Your job is to find and fix the performance bottlenecks without changing the
results.

---

## Getting Started

```bash
python3 run.py
```

Expected baseline output (timing varies by machine):

```
--- Results ---
Time:          ~34 seconds
Reachable:     144/150
Unreachable:   6/150
Total length:  9234
```

Your goal: make it as fast as possible while keeping `Total length: 9234`.

---

## Rules

1. **Correctness first.** The total path length must remain `9234`. If it
   changes, your submission is invalid.
2. **You may only edit `pathgrid.py`.** Do not modify `grid.py` or `run.py`.
3. **Standard library only.** No `pip install`. You can use anything in
   Python's standard library (e.g. `collections`, `heapq`, etc.).
4. **No changing the algorithm.** The solution must still use BFS (not
   Dijkstra, A*, etc.). The bottlenecks are all about data structure choices,
   not algorithm choice.

---

## Grading

Grading is based on speedup over the unoptimised baseline — **faster is
better**. Tier thresholds and point values are not disclosed.

---

## Files

```
challenge/python/
├── grid.py         # Grid & query generator (do not modify)
├── pathgrid.py     # Solver — THIS IS WHAT YOU OPTIMISE
├── run.py          # Runner & benchmark (do not modify)
└── README.md       # This file
```

---

## Profiling Tips

```bash
# See which functions are slow
python3 -m cProfile -s cumulative run.py

# See total time
time python3 run.py
```

Good luck!
