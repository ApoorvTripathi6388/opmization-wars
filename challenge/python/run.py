"""
PathGrid runner — benchmarks the solver.

Usage:
    python3 run.py
"""

import time
from grid import generate_grid, generate_queries
from pathgrid import solve_queries


def main():
    print("PathGrid")
    print("Generating grid + queries...")

    grid = generate_grid()
    queries = generate_queries(grid)

    print("Running BFS queries...\n")

    t0 = time.perf_counter()
    results, total_explored = solve_queries(grid, queries)
    elapsed = time.perf_counter() - t0

    total = 0
    reachable = 0
    unreachable = 0
    for length in results:
        if length >= 0:
            total += length
            reachable += 1
        else:
            unreachable += 1

    print("--- Results ---")
    print(f"Time:          {elapsed:.3f} seconds")
    print(f"Reachable:     {reachable}/{len(queries)}")
    print(f"Unreachable:   {unreachable}/{len(queries)}")
    print(f"Total length:  {total}")
    print(f"Explored:      {total_explored}")


if __name__ == "__main__":
    main()
