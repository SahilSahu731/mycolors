"use client";
import { useEffect, useRef } from "react";

/** Animate within normal document scrolling; no wheel interception or scroll lock. */
export function useScrollExpansion() {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const start = window.innerHeight * 0.72;
      const progress = Math.max(
        0,
        Math.min(1, (start - stage.getBoundingClientRect().top) / start),
      );
      stage.style.setProperty(
        "--expand",
        String(motion.matches ? (progress > 0.5 ? 1 : 0) : progress),
      );
      stage.dataset.expanded = String(progress > 0.9);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);
  return stageRef;
}
