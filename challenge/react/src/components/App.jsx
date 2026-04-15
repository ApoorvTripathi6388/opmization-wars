import React from 'react';
import { countRender } from '../data/renderCounter.js';
import MetricsProvider from './MetricsProvider.jsx';
import Header from './Header.jsx';
import StatsBar from './StatsBar.jsx';
import EndpointTable from './EndpointTable.jsx';
import LatencyChart from './LatencyChart.jsx';
import AlertPanel from './AlertPanel.jsx';
import EventLog from './EventLog.jsx';
import StatusTracker from './StatusTracker.jsx';

/**
 * Root component — orchestrates the dashboard layout.
 */
export default function App({ onTick }) {
  countRender('App');

  return (
    <MetricsProvider onTick={onTick}>
      <StatusTracker>
        <div className="dashboard">
          <Header />
          <StatsBar />
          <EndpointTable />
          <LatencyChart />
          <AlertPanel />
          <EventLog />
        </div>
      </StatusTracker>
    </MetricsProvider>
  );
}
