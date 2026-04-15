// Render counter — tracks how many times each component renders.
// Shared across all components via module-level state.

const counts = {};

export function countRender(name) {
  counts[name] = (counts[name] || 0) + 1;
}

export function getTotals() {
  return { ...counts };
}

export function getTotalRenders() {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

export function reset() {
  for (const key of Object.keys(counts)) {
    delete counts[key];
  }
}
