import React, { useContext } from 'react';
import { countRender } from '../data/renderCounter.js';
import { MetricsContext } from './MetricsProvider.jsx';

/**
 * Displays connection status and current tick.
 */
export default function Header() {
  countRender('Header');
  const { connected, tick } = useContext(MetricsContext);

  return (
    <div className="header">
      <h1>MetriView Dashboard</h1>
      <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? `Connected (tick ${tick})` : 'Disconnected'}
      </span>
    </div>
  );
}
