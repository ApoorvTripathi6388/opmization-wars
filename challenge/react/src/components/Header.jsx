import React, { useContext } from 'react';
import { countRender } from '../data/renderCounter.js';
// 1. Import the specific SystemContext
import { SystemContext } from './MetricsProvider.jsx';

/**
 * Displays connection status and current tick.
 */
export default function Header() {
  countRender('Header');
  
  // 2. Consume the SystemContext
  const { connected, tick } = useContext(SystemContext);

  return (
    <div className="header">
      <h1>MetriView Dashboard</h1>
      <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? `Connected (tick ${tick})` : 'Disconnected'}
      </span>
    </div>
  );
}