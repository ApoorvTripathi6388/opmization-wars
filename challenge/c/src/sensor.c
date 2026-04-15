#include <sgrid/sensor.h>
#include <string.h>

void sgrid_sensor_decode(const sgrid_sensor_packet_t *pkt,
                         sgrid_sensor_reading_t *out)
{
    memset(out, 0, sizeof(*out));
    out->sensor_id   = pkt->sensor_id;
    out->sensor_type = pkt->sensor_type;
    out->timestamp   = pkt->timestamp;
    out->reading     = pkt->reading;
    out->quality     = pkt->quality;
    out->flags       = pkt->flags;
    out->tag         = 'S';
    out->unit[0]     = 'C';
    out->unit[1]     = '\0';
}

void sgrid_sensor_reading_init(sgrid_sensor_reading_t *r, int id,
                               double value, double timestamp)
{
    memset(r, 0, sizeof(*r));
    r->sensor_id   = id;
    r->reading     = value;
    r->timestamp   = timestamp;
    r->quality     = 100;
    r->flags       = 0;
    r->tag         = 'S';
    r->unit[0]     = 'C';
    r->unit[1]     = '\0';
    r->sensor_type = 1;
}
