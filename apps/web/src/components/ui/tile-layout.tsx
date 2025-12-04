"use client";
import { useEffect, useRef, useState } from "react";

export function TileLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  
  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  // --- 1. SETUP TRANSITIONS ---
  useEffect(() => {
    const refs = [r1, r2, r3];
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        ref.current.style.willChange = "left, top, width, height, opacity, transform"; 
      }
    });
  }, []); 

  // --- 2. MAIN LAYOUT LOGIC ---
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const gap = 16; 

      // Dimensions
      const fullW = width;
      const fullH = height;
      const halfW = (width - gap) / 2;
      const halfH = (height - gap) / 2;

      // Coordinates
      const leftX = 0;
      const rightX = halfW + gap;
      const topY = 0;
      const bottomY = halfH + gap;

      const set = (
        el: HTMLDivElement | null,
        x: number,
        y: number,
        w: number,
        h: number,
        visible: boolean,
        active: boolean
      ) => {
        if (!el) return;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        
        el.style.opacity = visible ? "1" : "0";
        el.style.transform = visible ? "scale(1)" : "scale(0.9)"; 
        el.style.zIndex = active ? "20" : "10";
        
        el.className = `absolute flex items-center justify-center text-4xl font-bold rounded-xl transition-colors ${
          active 
            ? "border-4 border-primary bg-primary/10 text-primary shadow-2xl" 
            : "border-2 border-primary/20 bg-background text-primary/20"
        }`;
      };

      if (phase === 0) {
        // PHASE 0: Empty / Init (Matches Scroller P0)
        set(r1.current, 0, 0, fullW, fullH, false, false);
        set(r2.current, rightX, 0, halfW, fullH, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } 
      else if (phase === 1) {
        // PHASE 1: Spawn 1 (Full Screen)
        set(r1.current, 0, 0, fullW, fullH, true, true);
        set(r2.current, rightX, 0, halfW, fullH, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } 
      else if (phase === 2) {
        // PHASE 2: Spawn 2 (Split Left/Right)
        set(r1.current, leftX, 0, halfW, fullH, true, false); 
        set(r2.current, rightX, 0, halfW, fullH, true, true);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } 
      else if (phase === 3) {
        // PHASE 3: Spawn 3 (Grid)
        set(r1.current, leftX, 0, halfW, fullH, true, false);
        set(r2.current, rightX, 0, halfW, halfH, true, false);
        set(r3.current, rightX, bottomY, halfW, halfH, true, true);
      }
      else if (phase === 4) {
        // PHASE 4: SWAP (3 Hero, 1 Grid)
        set(r1.current, rightX, bottomY, halfW, halfH, true, false);
        set(r2.current, rightX, 0, halfW, halfH, true, false);
        set(r3.current, leftX, 0, halfW, fullH, true, true);
      }
      else if (phase === 5) {
        // PHASE 5: RE-SWAP (1 Hero, 3 Grid)
        set(r1.current, leftX, 0, halfW, fullH, true, true);
        set(r2.current, rightX, 0, halfW, halfH, true, false);
        set(r3.current, rightX, bottomY, halfW, halfH, true, false);
      }
      else if (phase === 6) {
        // PHASE 6: DESPAWN 3 (2 expands)
        set(r1.current, leftX, 0, halfW, fullH, true, true);
        set(r2.current, rightX, 0, halfW, fullH, true, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      }
      else if (phase === 7) {
        // PHASE 7: DESPAWN 2 (1 expands to full)
        set(r1.current, 0, 0, fullW, fullH, true, true);
        set(r2.current, rightX, 0, halfW, fullH, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      }
      else if (phase === 8) {
        // PHASE 8: DESPAWN 1 (All gone)
        set(r1.current, 0, 0, fullW, fullH, false, false);
        set(r2.current, rightX, 0, halfW, fullH, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current as Element);
    return () => ro.disconnect();
  }, [phase]);

  // --- 3. ANIMATION LOOP (EXACT SYNC) ---
  useEffect(() => {
    // Identical timings to ScrollerLayout
    const timings = [
      { phase: 0, delay: 0 },
      { phase: 1, delay: 500 },     // Spawn 1
      { phase: 2, delay: 1500 },    // Spawn 2
      { phase: 3, delay: 2500 },    // Spawn 3
      { phase: 4, delay: 3500 },    // Swap
      { phase: 5, delay: 5000 },    // Re-Swap / Expand
      { phase: 6, delay: 6500 },    // Despawn 3
      { phase: 7, delay: 7500 },    // Despawn 2
      { phase: 8, delay: 8500 },    // Despawn 1
    ];
    
    const totalDuration = 9500; 
    const timeouts: NodeJS.Timeout[] = [];

    timings.forEach(({ phase, delay }) => {
      const t = setTimeout(() => {
        setPhase(phase);
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
      className="relative w-full aspect-[3/2] overflow-hidden p-4"
    >
        <div ref={r1}>1</div>
        <div ref={r2}>2</div>
        <div ref={r3}>3</div>
    </div>
  );
}
