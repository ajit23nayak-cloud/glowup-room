"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  onFirstEngage?: () => void;
  className?: string;
};

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  onFirstEngage,
  className = "",
}: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const [engaged, setEngaged] = useState(false);
  const [demoRan, setDemoRan] = useState(false);
  const draggingRef = useRef(false);

  const setPosition = (next: number) => setPct(Math.max(0, Math.min(100, next)));
  const getPercent = (clientX: number) => {
    const rect = sliderRef.current!.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      setPosition(getPercent(x));
    };
    const onEnd = () => {
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  useEffect(() => {
    if (demoRan || !sliderRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDemoRan(true);
          obs.disconnect();
          let p = 50;
          let dir = 1;
          let cycles = 0;
          const timer = setInterval(() => {
            p += dir * 1.8;
            if (p >= 78) dir = -1;
            if (p <= 22) {
              dir = 1;
              cycles++;
            }
            if (cycles >= 1 && p >= 50) {
              clearInterval(timer);
              setPct(50);
            } else {
              setPct(p);
            }
          }, 25);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(sliderRef.current);
    return () => obs.disconnect();
  }, [demoRan]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    draggingRef.current = true;
    if (!engaged) {
      setEngaged(true);
      onFirstEngage?.();
    }
    const x = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setPosition(getPercent(x));
  };

  return (
    <div
      ref={sliderRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className={`relative mx-auto aspect-[4/3] w-full max-w-[760px] overflow-hidden rounded-2xl bg-black shadow-[0_8px_32px_rgba(26,26,26,0.12)] cursor-ew-resize select-none touch-none ${className}`}
      role="img"
      aria-label="Drag to compare before and after"
    >
      <img
        src={beforeSrc}
        alt={beforeAlt}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      />
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-white z-[3] shadow-[0_0_10px_rgba(0,0,0,0.4)] pointer-events-none"
        style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
      />
      <div
        className="absolute top-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center text-lg font-bold text-accent shadow-[0_6px_16px_rgba(0,0,0,0.25)] pointer-events-none z-[4]"
        style={{ left: `${pct}%`, transform: "translate(-50%,-50%)" }}
        aria-hidden="true"
      >
        ⇆
      </div>
      <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] text-white bg-ink/90 z-[5] pointer-events-none">
        BEFORE
      </span>
      <span className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] text-white bg-accent z-[5] pointer-events-none">
        AFTER
      </span>
    </div>
  );
}
