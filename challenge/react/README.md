# MetriView — React Performance Challenge

You are given **MetriView**, a real-time infrastructure monitoring dashboard built with React 19.
It works correctly and renders a live-updating dashboard with endpoints, latency charts, alerts,
and an event log.

**The problem:** the dashboard is slow. Components re-render far more often than necessary,
causing hundreds of thousands of wasted renders during a 50-tick simulation.

**Your job:** optimize the React code to minimize wasted renders — without breaking
correctness. The displayed data and final checksum must remain identical.

---

## Quick Start

```bash
npm install
npm start
```

Open **http://localhost:5173** in your browser. After the 50-tick simulation completes,
a results overlay will show your checksum and total render count.

## How It Works

1. **MetricsProvider** generates deterministic data and simulates 50 polling ticks at 10ms intervals
2. Data changes occur at ticks 10, 20, 30, and 40
3. After tick 50, a results overlay appears showing:
   - **Checksum** — must match the expected value (correctness)
   - **Total renders** — lower is better (performance)

## Grading

Grading is based on total render count — **lower is better**. Exact tier thresholds
are not disclosed. Your submission will be verified automatically to ensure correctness
and that all dashboard sections are present and populated.

## Rules

1. **Do NOT modify** `src/data/corpus.js`, `src/data/renderCounter.js`, or `src/main.jsx`
2. **Do NOT remove** `countRender()` calls — they are the measurement mechanism
3. The checksum after tick 50 **must remain identical** — any change is an automatic fail
4. You may restructure components, add hooks, split or merge files — as long as the
   rendered output and checksum are preserved
5. The dashboard must remain **visually functional** in the browser

## Project Structure

```
src/
├── main.jsx              # Entry point (do not modify)
├── styles.css            # Dashboard styles
├── data/
│   ├── corpus.js         # Deterministic data generator (do not modify)
│   └── renderCounter.js  # Render tracking (do not modify)
└── components/
    ├── App.jsx           # Root component
    ├── MetricsProvider.jsx # Context provider + polling
    ├── Header.jsx        # Status display
    ├── StatsBar.jsx      # Summary statistics
    ├── EndpointTable.jsx # Sortable endpoint list
    ├── LatencyChart.jsx  # Latency distribution bars
    ├── AlertPanel.jsx    # Alert cards
    ├── EventLog.jsx      # Event list
    └── StatusTracker.jsx # Analytics tracker wrapper
```

## Tips

- Use the browser dev server (`npm start`) to see the dashboard live
- The results overlay shows a per-component render breakdown
- Focus on *why* components re-render, not just *which* ones
- React DevTools Profiler can help identify unnecessary renders
