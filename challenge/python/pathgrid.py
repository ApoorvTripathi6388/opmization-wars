from collections import deque

def solve_queries(grid, queries):
    rows, cols = len(grid), len(grid[0])
    size = rows * cols
    
    # 1. Pre-calculate adjacency (The "Static" Graph)
    adj = [[] for _ in range(size)]
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 0: continue
            idx = r * cols + c
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                    adj[idx].append(nr * cols + nc)

    # 2. Reusable metadata arrays (Avoids re-allocation)
    # Using 0 for unvisited, positive for 'from source', negative for 'from dest'
    visited = [0] * size
    results = []
    total_explored_overall = 0

    for q_id, (source, dest) in enumerate(queries, 1):
        s_idx = source[0] * cols + source[1]
        d_idx = dest[0] * cols + dest[1]

        if s_idx == d_idx:
            results.append(0)
            total_explored_overall += 1
            continue

        # Each query gets a unique ID to avoid clearing the visited array
        # We use q_id * 1 for source-side and q_id * -1 for dest-side
        src_id, dst_id = q_id, -q_id
        
        q_src = deque([(s_idx, 0)])
        q_dst = deque([(d_idx, 0)])
        
        visited[s_idx] = src_id
        visited[d_idx] = dst_id
        
        dist_src = {s_idx: 0}
        dist_dst = {d_idx: 0}
        
        found_dist = -1
        q_explored = 2 # Start with source and destination
        
        while q_src and q_dst:
            # Expand the smaller frontier for efficiency
            if len(q_src) <= len(q_dst):
                curr, d = q_src.popleft()
                for n in adj[curr]:
                    if visited[n] == dst_id: # Collision! Path found.
                        found_dist = d + 1 + dist_dst[n]
                        break
                    if visited[n] != src_id:
                        visited[n] = src_id
                        dist_src[n] = d + 1
                        q_src.append((n, d + 1))
                        q_explored += 1
            else:
                curr, d = q_dst.popleft()
                for n in adj[curr]:
                    if visited[n] == src_id: # Collision! Path found.
                        found_dist = d + 1 + dist_src[n]
                        break
                    if visited[n] != dst_id:
                        visited[n] = dst_id
                        dist_dst[n] = d + 1
                        q_dst.append((n, d + 1))
                        q_explored += 1
            
            if found_dist != -1: break
            
        results.append(found_dist)
        total_explored_overall += q_explored

    return results, total_explored_overall