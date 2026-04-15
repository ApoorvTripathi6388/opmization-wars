/**
 * @file filter.h
 * @brief Spatial filtering and anomaly detection for sensor grids.
 *
 * Supports pluggable element-wise filters via function pointers for
 * extensibility, as well as fixed spatial-smoothing and anomaly-
 * detection passes.
 */
#ifndef SGRID_FILTER_H
#define SGRID_FILTER_H

#include "matrix.h"

/** Element-wise filter callback signature. */
typedef double (*sgrid_element_filter_fn)(double value, double threshold,
                                         void *ctx);

/**
 * Spatial smoothing using a window_size × window_size averaging kernel.
 * Reads from @p src, writes to @p dst.
 */
void sgrid_filter_spatial_smooth(const sgrid_matrix_t *src,
                                 sgrid_matrix_t *dst,
                                 int window_size);

/**
 * Mark cells whose values deviate from the local neighbourhood mean
 * by more than @p n_sigma standard deviations.
 *
 * @return Number of anomalies detected.
 */
int sgrid_filter_detect_anomalies(const sgrid_matrix_t *grid,
                                  sgrid_matrix_t *anomaly_mask,
                                  double n_sigma);

/** Apply @p fn to every element of the grid. */
void sgrid_filter_apply_elementwise(sgrid_matrix_t *grid,
                                    sgrid_element_filter_fn fn,
                                    double threshold, void *ctx);

/** Built-in: clamp values to [-threshold, +threshold]. */
double sgrid_filter_clamp(double value, double threshold, void *ctx);

/** Built-in: zero out values below threshold. */
double sgrid_filter_threshold_zero(double value, double threshold, void *ctx);

#endif /* SGRID_FILTER_H */
