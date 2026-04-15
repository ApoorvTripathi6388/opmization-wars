/**
 * @file matrix.h
 * @brief Opaque 2-D matrix abstraction for sensor grid data.
 *
 * Provides a clean interface for creating, accessing, and loading
 * double-precision grids.  The internal storage uses column-major
 * ordering for compatibility with standard linear-algebra conventions
 * (BLAS / LAPACK).
 */
#ifndef SGRID_MATRIX_H
#define SGRID_MATRIX_H

#include <stddef.h>

/** Opaque matrix handle. */
typedef struct sgrid_matrix sgrid_matrix_t;

/** Create a zero-initialised rows × cols matrix. */
sgrid_matrix_t *sgrid_matrix_create(int rows, int cols);

/** Destroy a matrix and release its memory. */
void sgrid_matrix_destroy(sgrid_matrix_t *m);

/** Set the value at (row, col). */
void sgrid_matrix_set(sgrid_matrix_t *m, int row, int col, double val);

/** Get the value at (row, col). */
double sgrid_matrix_get(const sgrid_matrix_t *m, int row, int col);

/** Return the number of rows. */
int sgrid_matrix_rows(const sgrid_matrix_t *m);

/** Return the number of columns. */
int sgrid_matrix_cols(const sgrid_matrix_t *m);

/**
 * Import a row-major buffer into the matrix, converting to the
 * internal storage layout.
 */
void sgrid_matrix_load(sgrid_matrix_t *m, const double *buf);

/** Export the matrix contents into a row-major buffer. */
void sgrid_matrix_store(const sgrid_matrix_t *m, double *buf);

/** Direct access to the underlying storage (mutable). */
double *sgrid_matrix_raw(sgrid_matrix_t *m);

/** Direct access to the underlying storage (const). */
const double *sgrid_matrix_raw_const(const sgrid_matrix_t *m);

#endif /* SGRID_MATRIX_H */
