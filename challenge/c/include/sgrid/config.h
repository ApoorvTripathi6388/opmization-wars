/**
 * @file config.h
 * @brief Global configuration constants for the Sensor Grid Analytics Engine.
 *
 * All processing parameters are centralised here for easy tuning.
 * Changing these values automatically propagates to every module.
 */
#ifndef SGRID_CONFIG_H
#define SGRID_CONFIG_H

#include <stdint.h>
#include <stddef.h>

/** Sensor grid dimensions (rows × columns). */
#define SGRID_ROWS          1024
#define SGRID_COLS          1024

/** Number of simulation timesteps. */
#define SGRID_NUM_TIMESTEPS 100

/** Worker thread count. */
#define SGRID_NUM_THREADS   4

/** Spatial filter kernel size (must be odd). */
#define SGRID_FILTER_WINDOW 3

/** Anomaly detection threshold in standard deviations. */
#define SGRID_ANOMALY_THRESH 2.5

/** Number of statistical regions (must be a perfect square). */
#define SGRID_NUM_REGIONS   16

#endif /* SGRID_CONFIG_H */
