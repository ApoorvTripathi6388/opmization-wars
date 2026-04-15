#include <sgrid/storage.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

void sgrid_result_store_init(sgrid_result_store_t *store)
{
    store->head = NULL;
    store->tail = NULL;
    store->count = 0;
}

void sgrid_result_store_append(sgrid_result_store_t *store, int timestep,
                               const sgrid_region_stats_t *region_stats,
                               int num_regions,
                               const sgrid_region_stats_t *global_stats,
                               int num_anomalies)
{
    sgrid_result_record_t *node = malloc(sizeof(*node));
    if (!node) return;

    node->timestep      = timestep;
    node->num_regions   = num_regions;
    node->num_anomalies = num_anomalies;
    node->global_stats  = *global_stats;
    node->next          = NULL;

    node->region_stats = malloc((size_t)num_regions * sizeof(sgrid_region_stats_t));
    if (node->region_stats) {
        memcpy(node->region_stats, region_stats,
               (size_t)num_regions * sizeof(sgrid_region_stats_t));
    }

    if (store->tail) {
        store->tail->next = node;
    } else {
        store->head = node;
    }
    store->tail = node;
    store->count++;

    printf("  [store] timestep %d: mean=%.2f anomalies=%d\n",
           timestep, global_stats->mean, num_anomalies);
}

void sgrid_result_store_print_summary(const sgrid_result_store_t *store)
{
    printf("\n=== Results Summary (%d timesteps) ===\n", store->count);
    for (sgrid_result_record_t *rec = store->head; rec; rec = rec->next) {
        printf("  step %3d: mean=%8.2f var=%8.2f min=%8.2f max=%8.2f "
               "anomalies=%d\n",
               rec->timestep,
               rec->global_stats.mean,
               rec->global_stats.variance,
               rec->global_stats.min,
               rec->global_stats.max,
               rec->num_anomalies);
    }
}

double sgrid_result_store_checksum(const sgrid_result_store_t *store)
{
    double checksum = 0.0;
    for (sgrid_result_record_t *rec = store->head; rec; rec = rec->next) {
        checksum += rec->global_stats.mean;
    }
    return checksum;
}

void sgrid_result_store_destroy(sgrid_result_store_t *store)
{
    sgrid_result_record_t *cur = store->head;
    while (cur) {
        sgrid_result_record_t *next = cur->next;
        free(cur->region_stats);
        free(cur);
        cur = next;
    }
    store->head = store->tail = NULL;
    store->count = 0;
}
