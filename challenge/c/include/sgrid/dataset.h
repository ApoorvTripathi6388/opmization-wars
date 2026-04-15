/**
 * @file dataset.h
 * @brief Deterministic synthetic sensor data generator.
 *
 * Generates reproducible sensor readings for any given timestep so
 * that results are fully deterministic regardless of thread scheduling.
 */
#ifndef SGRID_DATASET_H
#define SGRID_DATASET_H

#include "config.h"

/**
 * Fill @p buf with synthetic sensor readings for @p timestep.
 *
 * @param buf       Output buffer of size rows × cols.
 * @param rows      Number of rows.
 * @param cols      Number of columns.
 * @param timestep  Simulation step (seed input).
 */
void sgrid_dataset_generate(double *buf, int rows, int cols, int timestep);

#endif /* SGRID_DATASET_H */
