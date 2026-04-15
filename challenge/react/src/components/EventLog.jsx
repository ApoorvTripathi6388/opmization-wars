import React, { useContext, memo } from 'react';
import { countRender } from '../data/renderCounter.js';
// 1. Import the new, specific context
import { StaticMetricsContext } from './MetricsProvider.jsx';

/**
 * Displays a single event entry.
 * 2. Wrap the component in React.memo to prevent unnecessary re-renders
 */
const LogEntry = memo(function LogEntry({ event }) {
  countRender('LogEntry');

  return (
    <div className="log-entry">
      <span className="log-time">{new Date(event.timestamp).toISOString()}</span>
      <span className="log-type"> [{event.type}] </span>
      <span className="log-endpoint">{event.endpoint}</span>
      <span className="log-status"> {event.status}</span>
      <span className="log-latency"> {event.latency}ms</span>
      <span className="log-message"> — {event.message}</span>
    </div>
  );
});

/**
 * Scrollable event log showing recent system events.
 */
export default function EventLog() {
  countRender('EventLog');
  
  // 3. Consume from the new StaticMetricsContext
  const { events } = useContext(StaticMetricsContext);

  return (
    <div className="event-log" style={{ maxHeight: '400px', overflow: 'auto' }}>
      <h2>Event Log ({events.length} entries)</h2>
      {events.map(event => (
        <LogEntry key={event.id} event={event} />
      ))}
    </div>
  );
}