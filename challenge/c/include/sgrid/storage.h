/**
 * @file storage.h
 * @brief Append-only time-series result storage.
 *
 * Maintains a historical record of per-timestep processing results
 * using a linked list for flexible, unbounded storage.
 */
#ifndef SGRID_STORAGE_H
#define SGRID_STORAGE_H

#include "aggregate.h"

/** Single timestep result record. */
typedef struct sgrid_result_record sgrid_result_record_t;

struct sgrid_result_record {
    int                      timestep;
    int                      num_regions;
    int                      num_anomalies;
    sgrid_region_stats_t     global_stats;
    sgrid_region_stats_t    *region_stats;
    sgrid_result_record_t   *next;
};

/** Container for the linked list of result records. */
typedef struct {
    sgrid_result_record_t *head;
    sgrid_result_record_t *tail;
    int                    count;
} sgrid_result_store_t;

/** Initialise an empty result store. */
void sgrid_result_store_init(sgrid_result_store_t *store);

/** Append a timestep result (allocates a new record). */
void sgrid_result_store_append(sgrid_result_store_t *store, int timestep,
                               const sgrid_region_stats_t *region_stats,
                               int num_regions,
                               const sgrid_region_stats_t *global_stats,
                               int num_anomalies);

/** Print a summary of all stored results. */
void sgrid_result_store_print_summary(const sgrid_result_store_t *store);

/** Compute a deterministic checksum over all stored results. */
double sgrid_result_store_checksum(const sgrid_result_store_t *store);

/** Free all records and reset the store. */
void sgrid_result_store_destroy(sgrid_result_store_t *store);

#endif /* SGRID_STORAGE_H */
