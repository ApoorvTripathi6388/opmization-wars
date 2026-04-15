"""
Deterministic grid and query generator for PathGrid.
Do not modify this file.
"""

import random

SEED = 42
GRID_ROWS = 90
GRID_COLS = 90
WALL_RATIO = 0.30
NUM_QUERIES = 150


def _make_grid_cell(rng):
    return 1 if rng.random() < WALL_RATIO else 0


def generate_grid():
    """
    Create a GRID_ROWS x GRID_COLS grid where each cell is 0 (open) or
    1 (wall). The corners are always open.

    Returns a list of lists of ints.
    """
    rng = random.Random(SEED)
    grid = []
    for r in range(GRID_ROWS):
        row = []
        for c in range(GRID_COLS):
            row.append(_make_grid_cell(rng))
        grid.append(row)
    # Guarantee corners are open
    grid[0][0] = 0
    grid[GRID_ROWS - 1][GRID_COLS - 1] = 0
    # Also clear a small area around corners so they're reachable
    for dr in range(3):
        for dc in range(3):
            if dr < GRID_ROWS and dc < GRID_COLS:
                grid[dr][dc] = 0
            er, ec = GRID_ROWS - 1 - dr, GRID_COLS - 1 - dc
            if er >= 0 and ec >= 0:
                grid[er][ec] = 0
    return grid


def generate_queries(grid):
    """
    Generate NUM_QUERIES (source, destination) pairs where both endpoints
    are open cells.

    Returns a list of ((r1,c1), (r2,c2)) tuples.
    """
    rng = random.Random(SEED + 1)
    open_cells = []
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == 0:
                open_cells.append((r, c))

    queries = []
    for _ in range(NUM_QUERIES):
        src = rng.choice(open_cells)
        dst = rng.choice(open_cells)
        queries.append((src, dst))
    return queries
