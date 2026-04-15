/**
 * @file parallel.h
 * @brief Multi-threaded timestep processing.
 *
 * Distributes timestep processing across a pool of worker threads,
 * collecting per-thread statistics and writing results to a shared
 * result store.
 */
#ifndef SGRID_PARALLEL_H
#define SGRID_PARALLEL_H

#include "matrix.h"
#include "aggregate.h"
#include "storage.h"

/** Per-thread performance counters. */
typedef struct {
    long   processed_count;
    long   anomaly_total;
    double time_spent;
    int    thread_id;
} sgrid_thread_stats_t;

/**
 * Process all timesteps using SGRID_NUM_THREADS workers.
 *
 * @param store         Shared result store (thread-safe writes).
 * @param num_timesteps Total number of timesteps to process.
 * @param thread_stats  Array of SGRID_NUM_THREADS stat structs (output).
 * @return Total anomaly count across all timesteps.
 */
int sgrid_parallel_process_all(sgrid_result_store_t *store,
                               int num_timesteps,
                               sgrid_thread_stats_t *thread_stats);

#endif /* SGRID_PARALLEL_H */
