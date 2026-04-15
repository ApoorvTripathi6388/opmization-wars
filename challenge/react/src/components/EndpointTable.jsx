import React, { useContext, useState } from 'react';
import { countRender } from '../data/renderCounter.js';
import { MetricsContext } from './MetricsProvider.jsx';

/**
 * Individual endpoint row.
 */
function EndpointRow({ endpoint, rank }) {
  countRender('EndpointRow');

  return (
    <tr>
      <td>{rank}</td>
      <td>{endpoint.name}</td>
      <td>{endpoint.requests}</td>
      <td>{endpoint.errors}</td>
      <td>{endpoint.avgLatency}ms</td>
      <td>{endpoint.p99Latency}ms</td>
      <td>{endpoint.status}</td>
    </tr>
  );
}

/**
 * Sortable table showing all monitored endpoints.
 */
export default function EndpointTable() {
  countRender('EndpointTable');
  const { endpoints } = useContext(MetricsContext);
  const [sortField, setSortField] = useState('requests');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = [...endpoints].sort((a, b) => {
    const va = a[sortField];
    const vb = b[sortField];
    if (typeof va === 'number') {
      return sortDir === 'desc' ? vb - va : va - vb;
    }
    return sortDir === 'desc'
      ? String(vb).localeCompare(String(va))
      : String(va).localeCompare(String(vb));
  });

  return (
    <div className="endpoint-table">
      <h2>Endpoints</h2>
      <div>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          style={{ padding: '4px', marginRight: '8px' }}
        >
          {['name', 'requests', 'errors', 'avgLatency', 'p99Latency'].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          style={{ padding: '4px 8px' }}
        >
          {sortDir === 'desc' ? '↓' : '↑'}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Endpoint</th><th>Requests</th><th>Errors</th>
            <th>Avg Lat</th><th>P99 Lat</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((ep, i) => (
            <EndpointRow key={ep.id} endpoint={ep} rank={i + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
