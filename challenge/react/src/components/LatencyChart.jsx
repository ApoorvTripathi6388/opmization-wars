import React, { useContext } from 'react';
import { countRender } from '../data/renderCounter.js';
import { MetricsContext } from './MetricsProvider.jsx';

/**
 * Bar chart showing latency distribution across buckets.
 */
export default function LatencyChart() {
  countRender('LatencyChart');
  const { latencyBuckets, endpoints } = useContext(MetricsContext);

  const sortedBuckets = [...latencyBuckets].sort((a, b) => b.count - a.count);
  const totalCount = sortedBuckets.reduce((sum, b) => sum + b.count, 0);
  const maxCount = Math.max(...sortedBuckets.map(b => b.count));

  const endpointLatencies = endpoints.map(ep => ({
    name: ep.name,
    bucket: Math.floor(ep.avgLatency / 10),
    latency: ep.avgLatency,
  }));
  const hotBuckets = endpointLatencies.reduce((acc, el) => {
    acc[el.bucket] = (acc[el.bucket] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="latency-chart">
      <h2>Latency Distribution</h2>
      <div className="chart-info">
        <span>Total: {totalCount}</span>
        <span> | Buckets: {sortedBuckets.length}</span>
        <span> | Hot buckets: {Object.keys(hotBuckets).length}</span>
      </div>
      <div className="bars">
        {sortedBuckets.map((bucket, i) => (
          <div
            key={i}
            className="bar"
            style={{
              width: `${Math.round((bucket.count / maxCount) * 100)}%`,
              height: '12px',
              backgroundColor: bucket.count > totalCount / sortedBuckets.length ? '#e74c3c' : '#3498db',
              marginBottom: '2px',
            }}
            title={`${bucket.bucket}: ${bucket.count}`}
          />
        ))}
      </div>
    </div>
  );
}
