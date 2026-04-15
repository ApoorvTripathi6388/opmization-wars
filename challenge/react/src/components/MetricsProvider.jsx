import React, { createContext, useState, useEffect, useRef, useMemo } from 'react';
import { countRender } from '../data/renderCounter.js';
import {
  generateEndpoints, generateEvents, generateLatencyBuckets,
  generateAlerts, applyTickUpdate, NUM_TICKS,
} from '../data/corpus.js';

// 1. Split the single God Context into granular Contexts
export const EndpointsContext = createContext(null);
export const AlertsContext = createContext(null);
export const StaticMetricsContext = createContext(null);
export const SystemContext = createContext(null);

/**
 * Provides metrics data to the dashboard via granular context.
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
    const timer = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        // Optimization: Clean up interval when simulation ends
        if (next > NUM_TICKS) {
            clearInterval(timer); 
            return t;
        }

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
    
    return () => clearInterval(timer);
  }, [events]);

  // 2. Memoize grouped values to preserve referential equality
  const staticValue = useMemo(() => ({ events, latencyBuckets }), [events, latencyBuckets]);
  const systemValue = useMemo(() => ({ tick, connected }), [tick, connected]);

  // 3. Nest the providers
  return (
    <SystemContext.Provider value={systemValue}>
      <StaticMetricsContext.Provider value={staticValue}>
        <EndpointsContext.Provider value={endpoints}>
          <AlertsContext.Provider value={alerts}>
            {children}
          </AlertsContext.Provider>
        </EndpointsContext.Provider>
      </StaticMetricsContext.Provider>
    </SystemContext.Provider>
  );
}