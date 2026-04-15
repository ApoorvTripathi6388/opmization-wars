import React from 'react';
import { createRoot } from 'react-dom/client';
import { reset, getTotals, getTotalRenders } from './data/renderCounter.js';
import {
  generateEndpoints, generateEvents, generateLatencyBuckets,
  generateAlerts, applyTickUpdate, computeChecksum,
  NUM_TICKS,
} from './data/corpus.js';
import App from './components/App.jsx';

function computeExpectedChecksum() {
  let endpoints = generateEndpoints();
  const events = generateEvents();
  const latencyBuckets = generateLatencyBuckets();
  let alerts = generateAlerts();

  for (let t = 1; t <= NUM_TICKS; t++) {
    const result = applyTickUpdate(t, endpoints, events, alerts);
    if (result.changed) {
      endpoints = result.endpoints;
      alerts = result.alerts;
    }
  }

  return computeChecksum({
    endpoints,
    events,
    latencyBuckets,
    alerts,
    tick: NUM_TICKS,
    connected: NUM_TICKS % 2 === 0,
  });
}

function showResults(checksum, renderCount, totals) {
  const expected = computeExpectedChecksum();
  const pass = checksum === expected;

  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'results';
  resultsDiv.setAttribute('data-checksum', String(checksum));
  resultsDiv.setAttribute('data-expected', String(expected));
  resultsDiv.setAttribute('data-renders', String(renderCount));
  resultsDiv.setAttribute('data-pass', String(pass));

  const breakdown = Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => `<tr><td>${name}</td><td>${count.toLocaleString()}</td></tr>`)
    .join('');

  resultsDiv.innerHTML = `
    <div class="results-panel">
      <h2>MetriView — Results</h2>
      <table class="results-table">
        <tr><td>Checksum</td><td id="res-checksum">${checksum}</td></tr>
        <tr><td>Expected</td><td id="res-expected">${expected}</td></tr>
        <tr><td>Match</td><td id="res-pass" class="${pass ? 'pass' : 'fail'}">${pass ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Total Renders</td><td id="res-renders">${renderCount.toLocaleString()}</td></tr>
      </table>
      <h3>Render Breakdown</h3>
      <table class="breakdown-table">
        <tr><th>Component</th><th>Renders</th></tr>
        ${breakdown}
      </table>
    </div>
  `;

  document.body.appendChild(resultsDiv);
}

reset();

let done = false;

function handleTick(tick) {
  if (tick >= NUM_TICKS && !done) {
    done = true;
    requestAnimationFrame(() => {
      let endpoints = generateEndpoints();
      const events = generateEvents();
      const latencyBuckets = generateLatencyBuckets();
      let alerts = generateAlerts();

      for (let t = 1; t <= NUM_TICKS; t++) {
        const result = applyTickUpdate(t, endpoints, events, alerts);
        if (result.changed) {
          endpoints = result.endpoints;
          alerts = result.alerts;
        }
      }

      const checksum = computeChecksum({
        endpoints,
        events,
        latencyBuckets,
        alerts,
        tick: NUM_TICKS,
        connected: NUM_TICKS % 2 === 0,
      });

      const renderCount = getTotalRenders();
      const totals = getTotals();
      showResults(checksum, renderCount, totals);
    });
  }
}

const root = createRoot(document.getElementById('root'));
root.render(<App onTick={handleTick} />);
