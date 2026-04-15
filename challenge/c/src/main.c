/**
 * @file main.c
 * @brief Sensor Grid Analytics Engine — entry point.
 *
 * Processes synthetic sensor data over multiple timesteps using
 * multi-threaded workers, then reports timing and summary statistics.
 */
#define _GNU_SOURCE

#include <sgrid/config.h>
#include <sgrid/parallel.h>
#include <sgrid/storage.h>

#include <stdio.h>
#include <time.h>

extern volatile long g_cells_processed;

int main(void)
{
    printf("Sensor Grid Analytics Engine\n");
    printf("Grid: %d x %d, Timesteps: %d, Threads: %d\n\n",
           SGRID_ROWS, SGRID_COLS, SGRID_NUM_TIMESTEPS, SGRID_NUM_THREADS);

    sgrid_result_store_t store;
    sgrid_result_store_init(&store);

    sgrid_thread_stats_t thread_stats[SGRID_NUM_THREADS];

    struct timespec t0, t1;
    clock_gettime(CLOCK_MONOTONIC, &t0);

    int total_anomalies = sgrid_parallel_process_all(&store,
                                                     SGRID_NUM_TIMESTEPS,
                                                     thread_stats);

    clock_gettime(CLOCK_MONOTONIC, &t1);
    double elapsed = (t1.tv_sec - t0.tv_sec) +
                     (t1.tv_nsec - t0.tv_nsec) / 1e9;

    printf("\n--- Timing ---\n");
    printf("Total time:      %.3f seconds\n", elapsed);
    printf("Total anomalies: %d\n", total_anomalies);
    printf("Cells processed: %ld\n", g_cells_processed);
    printf("Checksum:        %.6f\n", sgrid_result_store_checksum(&store));

    printf("\nPer-thread stats:\n");
    for (int i = 0; i < SGRID_NUM_THREADS; i++) {
        printf("  Thread %d: processed=%ld anomalies=%ld\n",
               i, thread_stats[i].processed_count,
               thread_stats[i].anomaly_total);
    }

    sgrid_result_store_destroy(&store);
    return 0;
}
