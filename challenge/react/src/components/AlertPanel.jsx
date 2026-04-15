import React, { useContext, memo, useMemo } from 'react';
import { countRender } from '../data/renderCounter.js';
// 1. Import the specific context
import { AlertsContext } from './MetricsProvider.jsx';

/**
 * Displays a single alert.
 * 2. Wrap in React.memo so the card only re-renders if the alert data actually changes
 */
const AlertCard = memo(function AlertCard({ alert }) {
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
});

/**
 * Alert overview panel — shows all configured alerts with
 * current status and threshold details.
 */
export default function AlertPanel() {
  countRender('AlertPanel');
  
  // 3. Consume the new AlertsContext directly
  const alerts = useContext(AlertsContext);

  // 4. Calculate the fired count without destroying the referential equality of the alert objects
  const firedCount = useMemo(() => {
    return alerts.filter(a => a.fired).length;
  }, [alerts]);

  return (
    <div className="alert-panel">
      <h2>Alerts ({firedCount} firing)</h2>
      <div className="alert-list">
        {/* Pass the raw alert objects directly so React.memo can do its job */}
        {alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}