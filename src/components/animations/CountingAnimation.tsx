
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CountingAnimationProps {
  endValue: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

const CountingAnimation: React.FC<CountingAnimationProps> = ({
  endValue,
  duration = 2000,
  suffix = '',
  className = ''
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Memoize the animation step to prevent recreating on each render
  const animationStep = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const currentCount = Math.floor(progress * endValue);
    
    setCount(currentCount);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animationStep);
    }
  }, [endValue, duration]);

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle animation when element becomes visible
  useEffect(() => {
    if (!isVisible) return;

    // Start animation
    animationRef.current = requestAnimationFrame(animationStep);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, animationStep]);

  return (
    <span id={`counting-${endValue}`} ref={elementRef} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export default CountingAnimation;
