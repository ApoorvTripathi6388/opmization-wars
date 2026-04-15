import React, { useContext, useState, useEffect } from 'react';
import { countRender } from '../data/renderCounter.js';
import { MetricsContext } from './MetricsProvider.jsx';

/**
 * Summary statistics computed from the endpoint list.
 * Uses local state to cache derived totals.
 */
export default function StatsBar() {
  countRender('StatsBar');
  const { endpoints, alerts } = useContext(MetricsContext);

  const [totalRequests, setTotalRequests] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    let total = 0, errors = 0, latSum = 0;
    for (const ep of endpoints) {
      total += ep.requests;
      errors += ep.errors;
      latSum += ep.avgLatency;
    }
    setTotalRequests(total);
    setErrorRate(total > 0 ? Math.round((errors / total) * 10000) / 100 : 0);
    setAvgLatency(Math.round((latSum / endpoints.length) * 100) / 100);
    setAlertCount(alerts.filter(a => a.fired).length);
  });

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
