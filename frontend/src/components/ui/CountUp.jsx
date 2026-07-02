import React, { useEffect, useState } from 'react';

export default function CountUp({ target, className }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(target, 10);
    if (isNaN(end) || end === 0) {
      setCount(target || 0);
      return;
    }
    
    let start = 0;
    const duration = 800; // ms
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    const delay = Math.max(stepTime, 16); // cap at ~60fps requestAnimationFrame rate
    
    const timer = setInterval(() => {
      current += increment;
      setCount(current);
      if (current === end) {
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [target]);

  return <span className={className}>{count}</span>;
}
