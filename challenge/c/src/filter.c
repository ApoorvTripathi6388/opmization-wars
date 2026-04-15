#include <sgrid/filter.h>
#include <sgrid/config.h>
#include <math.h>
#include <stdlib.h>

void sgrid_filter_spatial_smooth(const sgrid_matrix_t *src,
                                 sgrid_matrix_t *dst,
                                 int window_size)
{
    int rows = sgrid_matrix_rows(src);
    int cols = sgrid_matrix_cols(src);
    int half = window_size / 2;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            double sum = 0.0;
            int count = 0;
            for (int dr = -half; dr <= half; dr++) {
                for (int dc = -half; dc <= half; dc++) {
                    int nr = r + dr;
                    int nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        sum += sgrid_matrix_get(src, nr, nc);
                        count++;
                    }
                }
            }
            sgrid_matrix_set(dst, r, c, sum / count);
        }
    }
}

int sgrid_filter_detect_anomalies(const sgrid_matrix_t *grid,
                                  sgrid_matrix_t *anomaly_mask,
                                  double n_sigma)
{
    int rows = sgrid_matrix_rows(grid);
    int cols = sgrid_matrix_cols(grid);
    int anomaly_count = 0;
    int half = SGRID_FILTER_WINDOW / 2;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            double sum = 0.0, sum_sq = 0.0;
            int count = 0;
            for (int dr = -half; dr <= half; dr++) {
                for (int dc = -half; dc <= half; dc++) {
                    int nr = r + dr;
                    int nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        double v = sgrid_matrix_get(grid, nr, nc);
                        sum += v;
                        sum_sq += v * v;
                        count++;
                    }
                }
            }
            double mean = sum / count;
            double variance = (sum_sq / count) - (mean * mean);
            double stddev = sqrt(fabs(variance));

            double val = sgrid_matrix_get(grid, r, c);

            if (fabs(val - mean) > n_sigma * stddev) {
                sgrid_matrix_set(anomaly_mask, r, c, 1.0);
                anomaly_count++;
            } else {
                sgrid_matrix_set(anomaly_mask, r, c, 0.0);
            }
        }
    }
    return anomaly_count;
}

void sgrid_filter_apply_elementwise(sgrid_matrix_t *grid,
                                    sgrid_element_filter_fn fn,
                                    double threshold, void *ctx)
{
    int rows = sgrid_matrix_rows(grid);
    int cols = sgrid_matrix_cols(grid);

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            double val = sgrid_matrix_get(grid, r, c);
            double result = fn(val, threshold, ctx);
            sgrid_matrix_set(grid, r, c, result);
        }
    }
}

double sgrid_filter_clamp(double value, double threshold, void *ctx)
{
    (void)ctx;
    if (value > threshold) return threshold;
    if (value < -threshold) return -threshold;
    return value;
}

double sgrid_filter_threshold_zero(double value, double threshold, void *ctx)
{
    (void)ctx;
    if (value < threshold) return 0.0;
    return value;
}
