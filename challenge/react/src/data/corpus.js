// Deterministic data generator for the metrics dashboard.
// Uses a simple LCG PRNG so identical seeds always produce identical data.

const LCG_A = 6364136223846793005n;
const LCG_C = 1442695040888963407n;
const MOD = 1n << 64n;

function createRng(seed) {
  let state = BigInt(seed);
  return {
    next() {
      state = (state * LCG_A + LCG_C) % MOD;
      return state;
    },
    range(max) {
      this.next();
      return Number((state >> 33n) % BigInt(max));
    },
    float() {
      this.next();
      return Number(state >> 11n) / 2 ** 53;
    },
  };
}

export const NUM_ENDPOINTS = 200;
export const NUM_EVENTS = 1000;
export const NUM_LATENCY_BUCKETS = 50;
export const NUM_ALERTS = 20;
export const NUM_TICKS = 50;
export const DATA_CHANGE_TICKS = [10, 20, 30, 40];

const ENDPOINT_NAMES = Array.from({ length: NUM_ENDPOINTS }, (_, i) => `/api/v1/svc/${i}`);
const STATUS_CODES = [200, 201, 400, 404, 500];
const EVENT_TYPES = ['request', 'error', 'warning', 'info', 'debug'];
const ALERT_METRICS = ['error_rate', 'p99_latency', 'request_count'];
const EPOCH = 1700000000000; // Fixed epoch for deterministic output

export function generateEndpoints(seed = 42) {
  const rng = createRng(seed);
  return ENDPOINT_NAMES.map((name, i) => ({
    id: i,
    name,
    requests: rng.range(10000) + 100,
    errors: rng.range(500),
    avgLatency: Math.round(rng.float() * 500 * 100) / 100,
    p99Latency: Math.round(rng.float() * 2000 * 100) / 100,
    status: STATUS_CODES[rng.range(STATUS_CODES.length)],
    lastSeen: EPOCH - rng.range(3600000),
  }));
}

export function generateEvents(seed = 123) {
  const rng = createRng(seed);
  return Array.from({ length: NUM_EVENTS }, (_, i) => ({
    id: i,
    timestamp: EPOCH - (NUM_EVENTS - i) * 1000,
    endpoint: ENDPOINT_NAMES[rng.range(NUM_ENDPOINTS)],
    type: EVENT_TYPES[rng.range(EVENT_TYPES.length)],
    status: STATUS_CODES[rng.range(STATUS_CODES.length)],
    latency: Math.round(rng.float() * 500 * 100) / 100,
    message: `Event ${i}: ${EVENT_TYPES[rng.range(EVENT_TYPES.length)]} on ${ENDPOINT_NAMES[rng.range(NUM_ENDPOINTS)]}`,
  }));
}

export function generateLatencyBuckets(seed = 456) {
  const rng = createRng(seed);
  return Array.from({ length: NUM_LATENCY_BUCKETS }, (_, i) => ({
    bucket: `${i * 10}-${(i + 1) * 10}ms`,
    count: rng.range(1000),
    min: i * 10,
    max: (i + 1) * 10,
  }));
}

export function generateAlerts(seed = 789) {
  const rng = createRng(seed);
  return Array.from({ length: NUM_ALERTS }, (_, i) => ({
    id: i,
    endpoint: ENDPOINT_NAMES[rng.range(NUM_ENDPOINTS)],
    metric: ALERT_METRICS[rng.range(ALERT_METRICS.length)],
    threshold: Math.round(rng.float() * 100 * 100) / 100,
    value: Math.round(rng.float() * 150 * 100) / 100,
    fired: rng.range(2) === 1,
    severity: ['low', 'medium', 'high', 'critical'][rng.range(4)],
  }));
}

export function applyTickUpdate(tick, endpoints, events, alerts) {
  if (!DATA_CHANGE_TICKS.includes(tick)) {
    return { endpoints, events, alerts, changed: false };
  }

  const rng = createRng(tick * 1000);
  const newEndpoints = endpoints.map((ep, i) => {
    if (i % 50 === 0) {
      return {
        ...ep,
        requests: ep.requests + rng.range(100),
        errors: ep.errors + rng.range(10),
      };
    }
    return ep;
  });

  const newAlerts = alerts.map((a, i) => {
    if (i === tick / 10 - 1) {
      return {
        ...a,
        fired: !a.fired,
        value: Math.round(rng.float() * 150 * 100) / 100,
      };
    }
    return a;
  });

  return { endpoints: newEndpoints, events, alerts: newAlerts, changed: true };
}

export function computeChecksum(data) {
  const str = JSON.stringify(data, (_key, value) => {
    if (typeof value === 'number') {
      return Math.round(value * 1e6) / 1e6;
    }
    return value;
  });
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}
