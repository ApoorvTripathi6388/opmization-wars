/**
 * @file aggregate.h
 * @brief Regional and global statistical aggregation.
 *
 * Computes per-region and whole-grid statistics (mean, variance,
 * min/max, anomaly count) over processed sensor grids.
 */
#ifndef SGRID_AGGREGATE_H
#define SGRID_AGGREGATE_H

#include "matrix.h"

/** Summary statistics for one region of the grid. */
typedef struct {
    double mean;
    double variance;
    double min;
    double max;
    int    count;
    int    anomaly_count;
} sgrid_region_stats_t;

/**
 * Compute per-region statistics.  The grid is divided into a
 * sqrt(num_regions) × sqrt(num_regions) tile grid.
 */
void sgrid_aggregate_region_stats(const sgrid_matrix_t *grid,
                                  const sgrid_matrix_t *anomaly_mask,
                                  sgrid_region_stats_t *stats,
                                  int num_regions);

/** Compute a single global summary over the entire grid. */
sgrid_region_stats_t sgrid_aggregate_global(const sgrid_matrix_t *grid,
                                            const sgrid_matrix_t *anomaly_mask);

#endif /* SGRID_AGGREGATE_H */
