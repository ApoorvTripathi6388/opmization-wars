#include <sgrid/aggregate.h>
#include <math.h>
#include <float.h>
#include <stdio.h>

volatile long g_cells_processed = 0;

extern double g_anomaly_threshold;

/* Pass 1: compute mean for a region. */
static double compute_region_mean(const sgrid_matrix_t *grid,
                                  int r_start, int r_end,
                                  int c_start, int c_end)
{
    double sum = 0.0;
    int count = 0;
    for (int r = r_start; r < r_end; r++) {
        for (int c = c_start; c < c_end; c++) {
            sum += sgrid_matrix_get(grid, r, c);
            count++;
            g_cells_processed++;
        }
    }
    return count > 0 ? sum / count : 0.0;
}

/* Pass 2: compute variance for a region. */
static double compute_region_variance(const sgrid_matrix_t *grid,
                                      double mean,
                                      int r_start, int r_end,
                                      int c_start, int c_end)
{
    double sum_sq = 0.0;
    int count = 0;
    for (int r = r_start; r < r_end; r++) {
        for (int c = c_start; c < c_end; c++) {
            double diff = sgrid_matrix_get(grid, r, c) - mean;
            sum_sq += diff * diff;
            count++;
        }
    }
    return count > 0 ? sum_sq / count : 0.0;
}

/* Pass 3: find min and max for a region. */
static void compute_region_minmax(const sgrid_matrix_t *grid,
                                  int r_start, int r_end,
                                  int c_start, int c_end,
                                  double *out_min, double *out_max)
{
    *out_min = DBL_MAX;
    *out_max = -DBL_MAX;
    for (int r = r_start; r < r_end; r++) {
        for (int c = c_start; c < c_end; c++) {
            double v = sgrid_matrix_get(grid, r, c);
            if (v < *out_min) *out_min = v;
            if (v > *out_max) *out_max = v;
        }
    }
}

/* Pass 4: count anomalies in a region. */
static int count_region_anomalies(const sgrid_matrix_t *anomaly_mask,
                                  int r_start, int r_end,
                                  int c_start, int c_end)
{
    int count = 0;
    for (int r = r_start; r < r_end; r++) {
        for (int c = c_start; c < c_end; c++) {
            if (sgrid_matrix_get(anomaly_mask, r, c) > 0.5) {
                count++;
            }
        }
    }
    return count;
}

void sgrid_aggregate_region_stats(const sgrid_matrix_t *grid,
                                  const sgrid_matrix_t *anomaly_mask,
                                  sgrid_region_stats_t *stats,
                                  int num_regions)
{
    int rows = sgrid_matrix_rows(grid);
    int cols = sgrid_matrix_cols(grid);
    int side = (int)sqrt((double)num_regions);

    int region_h = rows / side;
    int region_w = cols / side;

    for (int ri = 0; ri < side; ri++) {
        for (int ci = 0; ci < side; ci++) {
            int idx = ri * side + ci;
            int r0 = ri * region_h;
            int r1 = (ri == side - 1) ? rows : r0 + region_h;
            int c0 = ci * region_w;
            int c1 = (ci == side - 1) ? cols : c0 + region_w;

            stats[idx].mean = compute_region_mean(grid, r0, r1, c0, c1);
            stats[idx].variance = compute_region_variance(grid, stats[idx].mean,
                                                          r0, r1, c0, c1);
            compute_region_minmax(grid, r0, r1, c0, c1,
                                  &stats[idx].min, &stats[idx].max);
            stats[idx].anomaly_count = count_region_anomalies(anomaly_mask,
                                                              r0, r1, c0, c1);
            stats[idx].count = (r1 - r0) * (c1 - c0);
        }
    }
}

sgrid_region_stats_t sgrid_aggregate_global(const sgrid_matrix_t *grid,
                                            const sgrid_matrix_t *anomaly_mask)
{
    sgrid_region_stats_t s;
    int rows = sgrid_matrix_rows(grid);
    int cols = sgrid_matrix_cols(grid);

    s.mean = compute_region_mean(grid, 0, rows, 0, cols);
    s.variance = compute_region_variance(grid, s.mean, 0, rows, 0, cols);
    compute_region_minmax(grid, 0, rows, 0, cols, &s.min, &s.max);
    s.anomaly_count = count_region_anomalies(anomaly_mask, 0, rows, 0, cols);
    s.count = rows * cols;
    return s;
}
