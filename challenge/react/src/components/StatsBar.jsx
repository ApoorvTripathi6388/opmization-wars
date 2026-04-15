import React, { useContext, useMemo } from 'react';
import { countRender } from '../data/renderCounter.js';
// 1. Import the specific contexts
import { EndpointsContext, AlertsContext } from './MetricsProvider.jsx';

/**
 * Summary statistics computed from the endpoint list.
 */
export default function StatsBar() {
  countRender('StatsBar');
  
  // 2. Consume the granular contexts
  const endpoints = useContext(EndpointsContext);
  const alerts = useContext(AlertsContext);

  // 3. Replace useEffect+useState with useMemo to prevent double-renders
  const { totalRequests, errorRate, avgLatency } = useMemo(() => {
    let total = 0, errors = 0, latSum = 0;
    for (const ep of endpoints) {
      total += ep.requests;
      errors += ep.errors;
      latSum += ep.avgLatency;
    }
    
    return {
      totalRequests: total,
      errorRate: total > 0 ? Math.round((errors / total) * 10000) / 100 : 0,
      avgLatency: endpoints.length > 0 ? Math.round((latSum / endpoints.length) * 100) / 100 : 0
    };
  }, [endpoints]);

  const alertCount = useMemo(() => {
    return alerts.filter(a => a.fired).length;
  }, [alerts]);

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <h3>Total Requests</h3>
        <span>{totalRequests}</span>
      </div>
      <div className="stat-card">
        <h3>Error Rate</h3>
        <span>{errorRate}%</span>
      </div>
      <div className="stat-card">
        <h3>Avg Latency</h3>
        <span>{avgLatency}ms</span>
      </div>
      <div className="stat-card">
        <h3>Active Alerts</h3>
        <span>{alertCount}</span>
      </div>
    </div>
  );
}