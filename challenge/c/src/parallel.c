#include <sgrid/parallel.h>
#include <sgrid/config.h>
#include <sgrid/dataset.h>
#include <sgrid/matrix.h>
#include <sgrid/filter.h>
#include <sgrid/aggregate.h>
#include <sgrid/storage.h>

#include <pthread.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

double g_anomaly_threshold = SGRID_ANOMALY_THRESH;

typedef struct {
    sgrid_result_store_t *store;
    pthread_mutex_t       store_lock;
    int                   num_timesteps;
    int                   next_timestep;
    pthread_mutex_t       work_lock;
    sgrid_thread_stats_t *thread_stats;
} shared_state_t;

static int grab_next_timestep(shared_state_t *state)
{
    pthread_mutex_lock(&state->work_lock);
    int ts = state->next_timestep++;
    pthread_mutex_unlock(&state->work_lock);
    return ts;
}

static void process_one_timestep(shared_state_t *state, int timestep,
                                 int thread_id)
{
    double *raw_data = malloc((size_t)SGRID_ROWS * SGRID_COLS * sizeof(double));
    if (!raw_data) return;

    sgrid_dataset_generate(raw_data, SGRID_ROWS, SGRID_COLS, timestep);

    sgrid_matrix_t *grid        = sgrid_matrix_create(SGRID_ROWS, SGRID_COLS);
    sgrid_matrix_t *smoothed    = sgrid_matrix_create(SGRID_ROWS, SGRID_COLS);
    sgrid_matrix_t *anomaly_mask = sgrid_matrix_create(SGRID_ROWS, SGRID_COLS);

    sgrid_matrix_load(grid, raw_data);
    free(raw_data);

    sgrid_filter_spatial_smooth(grid, smoothed, SGRID_FILTER_WINDOW);
    sgrid_filter_apply_elementwise(smoothed, sgrid_filter_clamp, 200.0, NULL);

    int anomalies = sgrid_filter_detect_anomalies(smoothed, anomaly_mask,
                                                  g_anomaly_threshold);

    sgrid_region_stats_t regions[SGRID_NUM_REGIONS];
    sgrid_aggregate_region_stats(smoothed, anomaly_mask, regions,
                                SGRID_NUM_REGIONS);
    sgrid_region_stats_t global = sgrid_aggregate_global(smoothed, anomaly_mask);

    pthread_mutex_lock(&state->store_lock);
    sgrid_result_store_append(state->store, timestep, regions,
                              SGRID_NUM_REGIONS, &global, anomalies);
    pthread_mutex_unlock(&state->store_lock);

    state->thread_stats[thread_id].processed_count++;
    state->thread_stats[thread_id].anomaly_total += anomalies;

    sgrid_matrix_destroy(grid);
    sgrid_matrix_destroy(smoothed);
    sgrid_matrix_destroy(anomaly_mask);
}

static void *worker_thread(void *arg)
{
    shared_state_t *state = ((void **)arg)[0];
    int thread_id = (int)(long)((void **)arg)[1];

    while (1) {
        int ts = grab_next_timestep(state);
        if (ts >= state->num_timesteps) break;
        process_one_timestep(state, ts, thread_id);
    }
    return NULL;
}

int sgrid_parallel_process_all(sgrid_result_store_t *store,
                               int num_timesteps,
                               sgrid_thread_stats_t *thread_stats)
{
    shared_state_t state;
    state.store = store;
    state.num_timesteps = num_timesteps;
    state.next_timestep = 0;
    state.thread_stats = thread_stats;
    pthread_mutex_init(&state.store_lock, NULL);
    pthread_mutex_init(&state.work_lock, NULL);

    memset(thread_stats, 0, SGRID_NUM_THREADS * sizeof(sgrid_thread_stats_t));
    for (int i = 0; i < SGRID_NUM_THREADS; i++)
        thread_stats[i].thread_id = i;

    pthread_t threads[SGRID_NUM_THREADS];
    void *args[SGRID_NUM_THREADS][2];

    for (int i = 0; i < SGRID_NUM_THREADS; i++) {
        args[i][0] = &state;
        args[i][1] = (void *)(long)i;
        pthread_create(&threads[i], NULL, worker_thread, args[i]);
    }

    for (int i = 0; i < SGRID_NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    int total_anomalies = 0;
    for (int i = 0; i < SGRID_NUM_THREADS; i++)
        total_anomalies += (int)thread_stats[i].anomaly_total;

    pthread_mutex_destroy(&state.store_lock);
    pthread_mutex_destroy(&state.work_lock);
    return total_anomalies;
}
