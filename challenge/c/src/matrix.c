#include <sgrid/matrix.h>
#include <stdlib.h>
#include <string.h>

struct sgrid_matrix {
    int     rows;
    int     cols;
    double *data;
};

sgrid_matrix_t *sgrid_matrix_create(int rows, int cols)
{
    sgrid_matrix_t *m = malloc(sizeof(*m));
    if (!m) return NULL;
    m->rows = rows;
    m->cols = cols;
    m->data = malloc((size_t)rows * cols * sizeof(double));
    if (!m->data) { free(m); return NULL; }
    memset(m->data, 0, (size_t)rows * cols * sizeof(double));
    return m;
}

void sgrid_matrix_destroy(sgrid_matrix_t *m)
{
    if (m) {
        free(m->data);
        free(m);
    }
}

void sgrid_matrix_set(sgrid_matrix_t *m, int row, int col, double val)
{
    m->data[col * m->rows + row] = val;
}

double sgrid_matrix_get(const sgrid_matrix_t *m, int row, int col)
{
    return m->data[col * m->rows + row];
}

int sgrid_matrix_rows(const sgrid_matrix_t *m) { return m->rows; }
int sgrid_matrix_cols(const sgrid_matrix_t *m) { return m->cols; }

void sgrid_matrix_load(sgrid_matrix_t *m, const double *buf)
{
    for (int r = 0; r < m->rows; r++) {
        for (int c = 0; c < m->cols; c++) {
            m->data[c * m->rows + r] = buf[r * m->cols + c];
        }
    }
}

void sgrid_matrix_store(const sgrid_matrix_t *m, double *buf)
{
    for (int r = 0; r < m->rows; r++) {
        for (int c = 0; c < m->cols; c++) {
            buf[r * m->cols + c] = m->data[c * m->rows + r];
        }
    }
}

double *sgrid_matrix_raw(sgrid_matrix_t *m) { return m->data; }
const double *sgrid_matrix_raw_const(const sgrid_matrix_t *m) { return m->data; }
