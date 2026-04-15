#include <sgrid/dataset.h>
#include <math.h>

void sgrid_dataset_generate(double *buf, int rows, int cols, int timestep)
{
    unsigned int seed = (unsigned int)(timestep * 7919 + 104729);
    for (int i = 0; i < rows * cols; i++) {
        seed = seed * 1664525u + 1013904223u;
        double base = (double)(seed & 0xFFFF) / 65536.0 * 100.0;

        int r = i / cols;
        int c = i % cols;
        double gradient = (double)r / rows * 20.0 + (double)c / cols * 10.0;
        buf[i] = base + gradient + sin((double)timestep * 0.1 + r * 0.01) * 5.0;

        if ((seed >> 16) % 200 == 0)
            buf[i] += 500.0;
    }
}
