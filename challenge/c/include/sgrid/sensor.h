/**
 * @file sensor.h
 * @brief Sensor data structures and decoding routines.
 *
 * Defines the on-wire packet format received from sensor hardware
 * and the internal representation used throughout the pipeline.
 */
#ifndef SGRID_SENSOR_H
#define SGRID_SENSOR_H

#include <stdint.h>

/**
 * Wire-format sensor packet.  Packed to match the binary protocol
 * from the sensor hardware exactly.
 */
#pragma pack(push, 1)
typedef struct {
    uint8_t  sensor_type;
    uint32_t sensor_id;
    double   timestamp;
    uint16_t flags;
    double   reading;
    uint8_t  quality;
} sgrid_sensor_packet_t;
#pragma pack(pop)

/**
 * Internal representation of a sensor reading.  Fields are grouped
 * by logical category: identification, metadata, values.
 */
typedef struct {
    char        tag;
    double      timestamp;
    char        unit[3];
    int         sensor_id;
    uint8_t     quality;
    uint16_t    flags;
    double      reading;
    uint8_t     sensor_type;
} sgrid_sensor_reading_t;

/** Decode an on-wire packet into the internal representation. */
void sgrid_sensor_decode(const sgrid_sensor_packet_t *pkt,
                         sgrid_sensor_reading_t *out);

/** Initialise a sensor reading from raw values (synthetic data path). */
void sgrid_sensor_reading_init(sgrid_sensor_reading_t *r, int id,
                               double value, double timestamp);

#endif /* SGRID_SENSOR_H */
