import React, { useState, useEffect } from 'react';
import { countRender } from '../data/renderCounter.js';

/**
 * Tracks simulated interaction metrics (mouse position, movement count)
 * for analytics purposes. Wraps the dashboard content.
 */
export default function StatusTracker({ children }) {
  countRender('StatusTracker');

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMoveCount(c => c + 1);
      setMouseX(prev => (prev + 7) % 1920);
      setMouseY(prev => (prev + 3) % 1080);
    }, 10);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void (mouseX + mouseY + moveCount);
  }, [mouseX, mouseY, moveCount]);

  return <div className="status-tracker">{children}</div>;
}
