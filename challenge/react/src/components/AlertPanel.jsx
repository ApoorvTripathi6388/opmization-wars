import React, { useContext } from 'react';
import { countRender } from '../data/renderCounter.js';
import { MetricsContext } from './MetricsProvider.jsx';

/**
 * Displays a single alert.
 */
function AlertCard({ alert }) {
  countRender('AlertCard');

  return (
    <div className={`alert-card ${alert.fired ? 'fired' : 'ok'}`}>
      <strong>Alert #{alert.id}</strong>
      <span>{alert.endpoint}</span>
      <span>{alert.metric}: {alert.value} (threshold: {alert.threshold})</span>
      <span>[{alert.severity}]</span>
      <span>{alert.fired ? '🔴 FIRING' : '✅ OK'}</span>
    </div>
  );
}

/**
 * Alert overview panel — shows all configured alerts with
 * current status and threshold details.
 */
export default function AlertPanel() {
  countRender('AlertPanel');
  const { alerts } = useContext(MetricsContext);

  const processedAlerts = alerts.map(a => ({
    ...a,
    displayValue: `${a.metric}: ${a.value}`,
    isAboveThreshold: a.value > a.threshold,
  }));

  const firedCount = processedAlerts.filter(a => a.fired).length;

  return (
    <div className="alert-panel">
      <h2>Alerts ({firedCount} firing)</h2>
      <div className="alert-list">
        {processedAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
