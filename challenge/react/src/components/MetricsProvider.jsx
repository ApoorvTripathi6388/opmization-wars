import React, { createContext, useState, useEffect, useRef } from 'react';
import { countRender } from '../data/renderCounter.js';
import {
  generateEndpoints, generateEvents, generateLatencyBuckets,
  generateAlerts, applyTickUpdate, NUM_TICKS,
} from '../data/corpus.js';

export const MetricsContext = createContext(null);

/**
 * Provides metrics data to the dashboard via context.
 * Polls for new data on a fixed interval.
 */
export default function MetricsProvider({ children, onTick }) {
  countRender('MetricsProvider');

  const [endpoints, setEndpoints] = useState(() => generateEndpoints());
  const [events] = useState(() => generateEvents());
  const [latencyBuckets] = useState(() => generateLatencyBuckets());
  const [alerts, setAlerts] = useState(() => generateAlerts());
  const [tick, setTick] = useState(0);
  const [connected, setConnected] = useState(true);

  const endpointsRef = useRef(endpoints);
  const alertsRef = useRef(alerts);
  const onTickRef = useRef(onTick);
  endpointsRef.current = endpoints;
  alertsRef.current = alerts;
  onTickRef.current = onTick;

  useEffect(() => {
    setInterval(() => {
      setTick(t => {
        const next = t + 1;
        if (next > NUM_TICKS) return t;

        const result = applyTickUpdate(next, endpointsRef.current, events, alertsRef.current);
        if (result.changed) {
          setEndpoints(result.endpoints);
          setAlerts(result.alerts);
        }
        setConnected(next % 2 === 0);
        if (onTickRef.current) onTickRef.current(next);
        return next;
      });
    }, 10);
  }, []);

  return (
    <MetricsContext.Provider value={{ endpoints, events, latencyBuckets, alerts, tick, connected }}>
      {children}
    </MetricsContext.Provider>
  );
}
