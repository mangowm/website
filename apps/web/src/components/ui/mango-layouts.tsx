"use client";
import { useEffect, useRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for cleaner classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// 1. TILING LAYOUT
// ============================================================================
function TileLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  
  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    [r1, r2, r3].forEach(ref => {
      if (ref.current) {
        ref.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        ref.current.style.willChange = "left, top, width, height, opacity, transform"; 
      }
    });
  }, []); 

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const gap = 16; 
      
      const halfW = (width - gap) / 2;
      const halfH = (height - gap) / 2;
      const rightX = halfW + gap;
      const bottomY = halfH + gap;

      const set = (el: HTMLDivElement | null, x: number, y: number, w: number, h: number, visible: boolean, active: boolean) => {
        if (!el) return;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.opacity = visible ? "1" : "0";
        el.style.transform = visible ? "scale(1)" : "scale(0.9)"; 
        el.style.zIndex = active ? "20" : "10";
        el.className = cn(
          "absolute flex items-center justify-center text-4xl font-bold rounded-xl transition-colors",
          active ? "border-4 border-primary bg-primary/10 text-primary shadow-2xl" : "border-2 border-primary/20 bg-background text-primary/20"
        );
      };

      if (phase === 0) { // Init
        set(r1.current, 0, 0, width, height, false, false);
        set(r2.current, rightX, 0, halfW, height, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } else if (phase === 1) { // Spawn 1
        set(r1.current, 0, 0, width, height, true, true);
        set(r2.current, rightX, 0, halfW, height, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } else if (phase === 2) { // Spawn 2
        set(r1.current, 0, 0, halfW, height, true, false); 
        set(r2.current, rightX, 0, halfW, height, true, true);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } else if (phase === 3) { // Spawn 3
        set(r1.current, 0, 0, halfW, height, true, false);
        set(r2.current, rightX, 0, halfW, halfH, true, false);
        set(r3.current, rightX, bottomY, halfW, halfH, true, true);
      } else if (phase === 4) { // Swap
        set(r1.current, rightX, bottomY, halfW, halfH, true, false);
        set(r2.current, rightX, 0, halfW, halfH, true, false);
        set(r3.current, 0, 0, halfW, height, true, true);
      } else if (phase === 5) { // Re-Swap
        set(r1.current, 0, 0, halfW, height, true, true);
        set(r2.current, rightX, 0, halfW, halfH, true, false);
        set(r3.current, rightX, bottomY, halfW, halfH, true, false);
      } else if (phase === 6) { // Despawn 3
        set(r1.current, 0, 0, halfW, height, true, true);
        set(r2.current, rightX, 0, halfW, height, true, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } else if (phase === 7) { // Despawn 2
        set(r1.current, 0, 0, width, height, true, true);
        set(r2.current, rightX, 0, halfW, height, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      } else if (phase === 8) { // Despawn 1
        set(r1.current, 0, 0, width, height, false, false);
        set(r2.current, rightX, 0, halfW, height, false, false);
        set(r3.current, rightX, bottomY, halfW, halfH, false, false);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current as Element);
    return () => ro.disconnect();
  }, [phase]);

  useEffect(() => {
    const timings = [
      { phase: 0, delay: 0 }, { phase: 1, delay: 500 }, { phase: 2, delay: 1500 },
      { phase: 3, delay: 2500 }, { phase: 4, delay: 3500 }, { phase: 5, delay: 5000 },
      { phase: 6, delay: 6500 }, { phase: 7, delay: 7500 }, { phase: 8, delay: 8500 }
    ];
    const totalDuration = 9500;
    
    const timeouts = timings.map(t => setTimeout(() => setPhase(t.phase), t.delay));
    const loop = setTimeout(() => setLoopKey(k => k + 1), totalDuration);
    
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [loopKey]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden p-4">
      <div ref={r1}>1</div>
      <div ref={r2}>2</div>
      <div ref={r3}>3</div>
    </div>
  );
}

// ============================================================================
// 2. SCROLLER LAYOUT
// ============================================================================
 
function ScrollerLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null); // Window 1
  const centerRef = useRef<HTMLDivElement>(null); // Window 2
  const rightRef = useRef<HTMLDivElement>(null); // Window 3
 
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
      // Scale GAP for tiny widths (optional: makes it robust <80px)
      const GAP = Math.min(20, width * 0.05); // 5% of width, max 20px
      const halfScreen = 50;
      const phase = animationPhase;
      // --- Track Width Logic ---
      const isExpandedTrack = phase >= 3 && phase <= 5;
      const trackMultiplier = isExpandedTrack ? 1.5 : 1.0;
     
      track.style.width = (width * trackMultiplier) + "px";
      track.style.height = "100%";
      track.style.position = "relative";
      // Helper to set window state
      const set = (
        el: HTMLDivElement | null,
        xPercent: number,
        widthPercent: number,
        scrollTargetPercent: number,
        visible: boolean = true,
        active: boolean = false
      ) => {
        if (!el) return;
        // 1. Calculate Raw Positions
        const rawX = (width * xPercent) / 100;
        const rawW = (width * widthPercent) / 100;
        // 2. INTELLIGENT GAPS (Horizontal Only)
        const isVisuallyFirst = xPercent === scrollTargetPercent;
        const isVisuallyLast = (xPercent + widthPercent) === (scrollTargetPercent + 100);
        // Apply Horizontal Gap Logic:
        const actualX = isVisuallyFirst ? rawX : rawX + (GAP / 2);
       
        let actualWidth = rawW;
        if (!isVisuallyFirst) actualWidth -= (GAP / 2);
        if (!isVisuallyLast) actualWidth -= (GAP / 2);
        // Clamp to prevent negatives on tiny widths
        actualWidth = Math.max(actualWidth, 10); // Min 10px for visibility
        // Positioning
        el.style.position = "absolute";
        el.style.left = actualX + "px";
        el.style.top = "0px";
        el.style.width = actualWidth + "px";
        el.style.height = "100%";
       
        // Visibility
        el.style.opacity = visible ? "1" : "0";
        el.style.transform = visible ? "scale(1)" : "scale(0.9)";
       
        // Z-Index
        el.style.zIndex = active ? "20" : "10";
        // UI Styling
        el.className = `absolute flex items-center justify-center text-4xl font-bold rounded-xl transition-colors ${
          active
            ? "border-4 border-primary bg-primary/10 text-primary shadow-2xl"
            : "border-2 border-primary/20 bg-background text-primary/20"
        }`;
      };
      // --- PHASE DEFINITIONS --- (unchanged)
      if (phase === 0) {
        set(leftRef.current, 0, halfScreen, 0, false, false);
        set(centerRef.current, 100, halfScreen, 0, false, false);
        set(rightRef.current, 200, halfScreen, 0, false, false);
        container.scrollLeft = 0;
      } else if (phase === 1) {
        set(leftRef.current, 25, halfScreen, 0, true, true);
        set(centerRef.current, 100, halfScreen, 0, false, false);
        set(rightRef.current, 200, halfScreen, 0, false, false);
        container.scrollLeft = 0;
      } else if (phase === 2) {
        set(leftRef.current, 0, halfScreen, 0, true, false);
        set(centerRef.current, 50, halfScreen, 0, true, true);
        set(rightRef.current, 200, halfScreen, 0, false, false);
        container.scrollLeft = 0;
      } else if (phase === 3) {
        const scrollTarget = 50;
        set(leftRef.current, 0, halfScreen, scrollTarget, true, false);
        set(centerRef.current, 50, halfScreen, scrollTarget, true, false);
        set(rightRef.current, 100, halfScreen, scrollTarget, true, true);
        setTimeout(() => {
          if (container) container.scrollTo({ left: (scrollTarget * width) / 100, behavior: 'smooth' });
        }, 50);
      } else if (phase === 4) {
        const scrollTarget = 50;
        set(leftRef.current, 0, halfScreen, scrollTarget, true, false);
        set(centerRef.current, 100, halfScreen, scrollTarget, true, false);
        set(rightRef.current, 50, halfScreen, scrollTarget, true, true);
        if (container) container.scrollTo({ left: (scrollTarget * width) / 100, behavior: 'smooth' });
      } else if (phase === 5) {
        const scrollTarget = 50;
        set(rightRef.current, 50, 100, scrollTarget, true, true);
        set(centerRef.current, 150, halfScreen, scrollTarget, true, false);
        set(leftRef.current, -50, halfScreen, scrollTarget, true, false);
        if (container) container.scrollTo({ left: (scrollTarget * width) / 100, behavior: 'smooth' });
      } else if (phase === 6) {
        set(rightRef.current, 50, halfScreen, 0, false, false);
        set(centerRef.current, 50, halfScreen, 0, true, true);
        set(leftRef.current, 0, halfScreen, 0, true, false);
        if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (phase === 7) {
        set(leftRef.current, 25, halfScreen, 0, true, true);
        set(centerRef.current, 50, halfScreen, 0, false, false);
        set(rightRef.current, 50, halfScreen, 0, false, false);
       
        if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (phase === 8) {
        set(leftRef.current, 25, halfScreen, 0, false, false);
        set(centerRef.current, 50, halfScreen, 0, false, false);
        set(rightRef.current, 50, halfScreen, 0, false, false);
       
        if (container) container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current as Element);
    return () => ro.disconnect();
  }, [animationPhase]);
  // --- 3. LOOP TIMING --- (unchanged)
  useEffect(() => {
    const timings = [
      { phase: 0, delay: 0 },
      { phase: 1, delay: 500 },
      { phase: 2, delay: 1500 },
      { phase: 3, delay: 2500 },
      { phase: 4, delay: 3500 },
      { phase: 5, delay: 5000 },
      { phase: 6, delay: 6500 },
      { phase: 7, delay: 7500 },
      { phase: 8, delay: 8500 },
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
    <>
      <style jsx>{`
        /* Hide scrollbar in WebKit (Chrome/Safari) */
        div[ref="containerRef"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-x-scroll overflow-y-hidden"  // CHANGED: h-full instead of aspect-[3/2]
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div ref={trackRef}>
          <div ref={leftRef}>1</div>
          <div ref={centerRef}>2</div>
          <div ref={rightRef}>3</div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// 3. MAIN COMPONENT (With Toggle Widget)
// ============================================================================
export function MangoLayouts() {
  const [activeLayout, setActiveLayout] = useState<'tiling' | 'scroller'>('tiling');

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-end">
        <div className="inline-flex rounded-full bg-muted p-1 border border-border">
          <button
            onClick={() => setActiveLayout('tiling')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
              activeLayout === 'tiling' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tiling
          </button>
          <button
            onClick={() => setActiveLayout('scroller')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
              activeLayout === 'scroller' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Scroller
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[3/2] overflow-hidden rounded-xl border border-border bg-background/50 shadow-sm">
        {activeLayout === 'tiling' && <TileLayout />}
        {activeLayout === 'scroller' && <ScrollerLayout />}
      </div>
    </div>
  );
}
