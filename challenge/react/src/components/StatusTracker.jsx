import React, { useEffect, useRef } from 'react';
import { countRender } from '../data/renderCounter.js';

/**
 * Tracks simulated interaction metrics (mouse position, movement count)
 * for analytics purposes. Wraps the dashboard content.
 */
export default function StatusTracker({ children }) {
  countRender('StatusTracker');

  // 1. Swap useState for useRef. This holds the data without triggering re-renders!
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const moveCount = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      // 2. Mutate the .current property directly
      moveCount.current += 1;
      mouseX.current = (mouseX.current + 7) % 1920;
      mouseY.current = (mouseY.current + 3) % 1080;
    }, 10);
    
    return () => clearInterval(id);
  }, []);

  // We can completely remove the second useEffect that just called 'void'

  return <div className="status-tracker">{children}</div>;
}