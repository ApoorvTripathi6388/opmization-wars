import React, { useContext, useMemo } from 'react';
import { countRender } from '../data/renderCounter.js';
// 1. Import the specific contexts
import { StaticMetricsContext, EndpointsContext } from './MetricsProvider.jsx';

/**
 * Bar chart showing latency distribution across buckets.
 */
export default function LatencyChart() {
  countRender('LatencyChart');
  
  // 2. Consume the granular contexts
  const { latencyBuckets } = useContext(StaticMetricsContext);
  const endpoints = useContext(EndpointsContext);

  // 3. Memoize the static bucket calculations so they only run once
  const { sortedBuckets, totalCount, maxCount } = useMemo(() => {
    const sorted = [...latencyBuckets].sort((a, b) => b.count - a.count);
    const total = sorted.reduce((sum, b) => sum + b.count, 0);
    const max = Math.max(...sorted.map(b => b.count));
    
    return { sortedBuckets: sorted, totalCount: total, maxCount: max };
  }, [latencyBuckets]);

  // 4. Memoize the dynamic endpoint calculations so they only run when endpoints update
  const hotBucketsCount = useMemo(() => {
    const endpointLatencies = endpoints.map(ep => ({
      bucket: Math.floor(ep.avgLatency / 10),
    }));
    
    const hotBuckets = endpointLatencies.reduce((acc, el) => {
      acc[el.bucket] = (acc[el.bucket] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(hotBuckets).length;
  }, [endpoints]);

  return (
    <div className="latency-chart">
      <h2>Latency Distribution</h2>
      <div className="chart-info">
        <span>Total: {totalCount}</span>
        <span> | Buckets: {sortedBuckets.length}</span>
        <span> | Hot buckets: {hotBucketsCount}</span>
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