"""
PathGrid — BFS shortest-path solver.

This module finds shortest paths on a 2D grid using breadth-first search.
Each query returns the minimum number of steps from a source cell to a
destination cell, or -1 if no path exists. Explored cells are recorded
in the grid for coverage analysis.
"""

import copy


def get_neighbors(grid, row, col):
    """Return walkable (non-wall) neighbors of the given cell."""
    neighbors = []
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nr, nc = row + dr, col + dc
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):
            if grid[nr][nc] == 0:
                neighbors.append((nr, nc))
    return neighbors


def bfs(grid, source, destination):
    """
    BFS shortest path from source to destination on the grid.
    Returns the path length (number of steps), or -1 if unreachable.

    All cells visited during the search are marked on the grid
    (value set to 2) for downstream coverage tracking.
    """
    if source == destination:
        grid[source[0]][source[1]] = 2
        return 0

    queue = [source]
    visited = [source]
    distances = {source: 0}

    while queue:
        current = queue.pop(0)
        curr_dist = distances[current]

        for neighbor in get_neighbors(grid, current[0], current[1]):
            if neighbor not in visited:
                visited.append(neighbor)
                distances[neighbor] = curr_dist + 1
                if neighbor == destination:
                    for cell in visited:
                        grid[cell[0]][cell[1]] = 2
                    grid[neighbor[0]][neighbor[1]] = 2
                    return curr_dist + 1
                queue.append(neighbor)

    for cell in visited:
        grid[cell[0]][cell[1]] = 2
    return -1


def solve_queries(grid, queries):
    """
    Run BFS for each query and return results and total exploration count.

    A fresh copy of the grid is used for each query to avoid
    cross-contamination between searches, since BFS marks explored
    cells on the grid.
    """
    results = []
    total_explored = 0
    for source, destination in queries:
        grid_copy = copy.deepcopy(grid)
        length = bfs(grid_copy, source, destination)
        results.append(length)
        for row in grid_copy:
            for cell in row:
                if cell == 2:
                    total_explored += 1
    return results, total_explored
