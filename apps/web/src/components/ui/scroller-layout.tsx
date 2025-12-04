"use client";
import { useEffect, useRef, useState } from "react";

export function ScrollerLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);   // Window 1
  const centerRef = useRef<HTMLDivElement>(null); // Window 2
  const rightRef = useRef<HTMLDivElement>(null);  // Window 3
  
  const [animationPhase, setAnimationPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  // --- 1. SETUP TRANSITIONS ---
  useEffect(() => {
    const refs = [leftRef, centerRef, rightRef];
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        ref.current.style.willChange = "left, top, width, height, opacity, transform"; 
      }
    });
  }, []);

  // --- 2. MAIN LOGIC ---
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const halfScreen = 50;
      const phase = animationPhase;

      // Track Width Logic
      const isExpandedTrack = phase >= 3 && phase <= 5;
      const requiredTrackWidth = isExpandedTrack ? width * 1.5 : width;
      
      track.style.width = requiredTrackWidth + "px";
      track.style.height = height + "px";
      track.style.position = "relative";
      track.style.transition = "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

      const set = (
        el: HTMLDivElement | null,
        xPercent: number,
        widthPercent: number,
        visible: boolean = true,
        active: boolean = false
      ) => {
        if (!el) return;
        const actualWidth = (width * widthPercent) / 100;
        const actualX = (width * xPercent) / 100;

        // Positioning
        el.style.position = "absolute";
        el.style.left = actualX + "px";
        el.style.top = "10px";
        el.style.width = actualWidth - 20 + "px";
        el.style.height = height - 20 + "px";
        
        // Visibility
        el.style.opacity = visible ? "1" : "0";
        el.style.transform = visible ? "scale(1)" : "scale(0.9)";
        
        // Z-Index for overlapping swaps
        el.style.zIndex = active ? "20" : "10";

        // UI Styling (Matching Tiling Layout)
        el.className = `absolute flex items-center justify-center text-4xl font-bold rounded-xl transition-colors ${
          active 
            ? "border-4 border-primary bg-primary/10 text-primary shadow-2xl" 
            : "border-2 border-primary/20 bg-background text-primary/20"
        }`;
      };

      if (phase === 0) {
        // Initial
        set(leftRef.current, 0, halfScreen, false, false);
        set(centerRef.current, 100, halfScreen, false, false);
        set(rightRef.current, 200, halfScreen, false, false);
        container.scrollLeft = 0;
      } else if (phase === 1) {
        // Spawn 1 (Left)
        set(leftRef.current, 25, halfScreen, true, true);
        set(centerRef.current, 100, halfScreen, false, false);
        set(rightRef.current, 200, halfScreen, false, false);
        container.scrollLeft = 0;
      } else if (phase === 2) {
        // Spawn 2 (Center)
        set(leftRef.current, 0, halfScreen, true, false);
        set(centerRef.current, halfScreen, halfScreen, true, true);
        set(rightRef.current, 200, halfScreen, false, false);
        container.scrollLeft = 0;
      } else if (phase === 3) {
        // Spawn 3 (Right) - Scroll triggers
        set(leftRef.current, 0, halfScreen, true, false);
        set(centerRef.current, halfScreen, halfScreen, true, false);
        set(rightRef.current, 100, halfScreen, true, true);

        setTimeout(() => {
          if (container) container.scrollTo({ left: (halfScreen * width) / 100, behavior: 'smooth' });
        }, 100);
      } else if (phase === 4) {
        // Swap 2 & 3
        set(leftRef.current, 0, halfScreen, true, false);
        set(centerRef.current, 100, halfScreen, true, false); 
        set(rightRef.current, halfScreen, halfScreen, true, true); // Active window slides on top

        if (container) container.scrollTo({ left: (halfScreen * width) / 100, behavior: 'smooth' });
      } else if (phase === 5) {
        // Expand 3
        set(rightRef.current, 50, 100, true, true);
        set(centerRef.current, 150, halfScreen, true, false);
        set(leftRef.current, -50, halfScreen, true, false);

        if (container) container.scrollTo({ left: (halfScreen * width) / 100, behavior: 'smooth' });
      } else if (phase === 6) {
        // Despawn 3 -> Restore 1 & 2
        set(rightRef.current, 50, halfScreen, false, false);
        set(centerRef.current, 50, halfScreen, true, true); // Focus goes back to center
        set(leftRef.current, 0, halfScreen, true, false);

        if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (phase === 7) {
        // Despawn 2 -> Center 1
        set(leftRef.current, 25, halfScreen, true, true); // Focus goes back to left
        set(centerRef.current, 50, halfScreen, false, false);
        set(rightRef.current, 50, halfScreen, false, false);
        
        if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (phase === 8) {
        // Despawn 1
        set(leftRef.current, 25, halfScreen, false, false);
        set(centerRef.current, 50, halfScreen, false, false);
        set(rightRef.current, 50, halfScreen, false, false);
        
        if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current as Element);
    return () => ro.disconnect();
  }, [animationPhase]);

  // --- 3. LOOP TIMING ---
  useEffect(() => {
    const timings = [
      { phase: 0, delay: 0 },
      { phase: 1, delay: 500 },     // Spawn 1
      { phase: 2, delay: 1500 },    // Spawn 2
      { phase: 3, delay: 2500 },    // Spawn 3
      { phase: 4, delay: 3500 },    // Swap
      { phase: 5, delay: 5000 },    // Expand
      { phase: 6, delay: 6500 },    // Remove 3rd
      { phase: 7, delay: 7500 },    // Remove 2nd
      { phase: 8, delay: 8500 },    // Remove 1st
    ];
    
    const totalDuration = 9500; 
    const timeouts: NodeJS.Timeout[] = [];

    timings.forEach(({ phase, delay }) => {
      const t = setTimeout(() => {
        setAnimationPhase(phase);
      }, delay);
      timeouts.push(t);
    });

    const loopTimeout = setTimeout(() => {
      setLoopKey(prev => prev + 1);
    }, totalDuration);
    timeouts.push(loopTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [loopKey]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/2] overflow-x-scroll overflow-y-hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div ref={trackRef}>
        <div ref={leftRef}>1</div>
        <div ref={centerRef}>2</div>
        <div ref={rightRef}>3</div>
      </div>
    </div>
  );
}
