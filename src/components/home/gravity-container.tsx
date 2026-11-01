
"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Matter from "matter-js";
import {
  createGravityWorld,
  disposeGravityWorld,
  gravityPieces,
  tossGravityWorld,
  type GravityWorld,
} from "@/lib/gravity";
import { ink } from "@/lib/colors";

const { Engine, Body, Constraint, Composite, Sleeping, Vector } = Matter;

type Side = "warm" | "cool";
type Mode = "down" | "up" | "float";

const MODES: { id: Mode; icon: string; label: string }[] = [
  { id: "down", icon: "↓", label: "Gravity down" },
  { id: "up", icon: "↑", label: "Gravity up" },
  { id: "float", icon: "◌", label: "Zero gravity" },
];

const DEFAULT_PALETTE = ["#ff795b", "#f6c85f", "#d7e7a9", "#9aaaf0", "#7963cf"];
const control = "grid size-9 shrink-0 place-items-center rounded-xl text-base font-medium text-ink/65 transition-all duration-200 hover:bg-ink/10 hover:text-ink active:scale-90 focus-visible:bg-ink/10 focus-visible:text-ink focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none";

type DragState = {
  index: number;
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  vx: number;
  vy: number;
};

function applyPhysics(world: GravityWorld, mode: Mode, slow: boolean) {
  world.engine.gravity.x = 0;
  world.engine.gravity.y = mode === "down" ? 1 : mode === "up" ? -1 : 0;
  world.engine.timing.timeScale = slow ? 0.4 : 1;
  world.bodies.forEach(({ body }) => Sleeping.set(body, false));
}

function PhysicsIcon({ name }: { name: "slow" | "toss" | "pause" | "play" }) {
  if (name === "slow") {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }

  if (name === "toss") {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.7 9A7 7 0 0 1 18.5 7M18.3 15A7 7 0 0 1 5.5 17" />
      </svg>
    );
  }

  if (name === "pause") {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1.5" />
        <rect x="14" y="5" width="4" height="14" rx="1.5" />
      </svg>
    );
  }

  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5a1.5 1.5 0 0 1 2.3-1.27l9 6a1.5 1.5 0 0 1 0 2.54l-9 6A1.5 1.5 0 0 1 8 17.5Z" />
    </svg>
  );
}

export default function GravityContainer({
  palette,
  side,
  onPick,
}: {
  palette: string[];
  side: Side;
  onPick: (index: number, color: string) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const worldRef = useRef<GravityWorld | null>(null);
  const constraintRef = useRef<Matter.Constraint | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const modeRef = useRef<Mode>("down");
  const slowRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<Mode>("down");
  const [slow, setSlow] = useState(false);
  const [grabbed, setGrabbed] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const p = palette.length >= 5 ? palette : DEFAULT_PALETTE;
  const colors = side === "warm" ? [p[0], p[1], "#f5b99a", "#e9957a", "#ebcc87"] : [p[4], p[3], p[2], "#a3c8b3", "#c1b3e1"];
  const colorAt = (index: number) => colors[index % colors.length];

  const sideLabel = side === "warm" ? "Warm" : "Cool";
  const currentMode = MODES.find((item) => item.id === mode)!;

  function notify(message: string, index: number | null = null) {
    setFeedback(message);
    setPicked(index);

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

    feedbackTimer.current = setTimeout(() => {
      setFeedback("");
      setPicked(null);
    }, 1600);
  }

  function detachConstraint() {
    const world = worldRef.current;

    if (world && constraintRef.current) Composite.remove(world.engine.world, constraintRef.current);

    constraintRef.current = null;
    dragRef.current = null;
  }

  function releaseDrag() {
    detachConstraint();
    setGrabbed(null);
  }

  function resume() {
    pausedRef.current = false;
    setPaused(false);
  }

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    let frame = 0;
    let lastTime = 0;
    let accumulator = 0;
    let visible = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const STEP = 1000 / 60;

    function render() {
      const world = worldRef.current;
      if (!world) return;

      world.bodies.forEach(({ body, width, height }, index) => {
        const el = elementsRef.current[index];
        if (!el) return;

        el.style.transform = `translate3d(${body.position.x - width / 2}px, ${body.position.y - height / 2}px, 0) rotate(${body.angle}rad)`;
      });
    }

    function rebuild() {
      if (!board) return;

      const width = board.clientWidth;
      const height = board.clientHeight;

      if (width <= 0 || height <= 0) return;

      const old = worldRef.current;

      if (old && Math.abs(old.width - width) < 1 && Math.abs(old.height - height) < 1) return;

      detachConstraint();

      if (old) disposeGravityWorld(old);

      const world = createGravityWorld(width, height);
      worldRef.current = world;

      applyPhysics(world, modeRef.current, slowRef.current);

      world.bodies.forEach((piece, index) => {
        const el = elementsRef.current[index];
        if (!el) return;

        el.style.width = `${piece.width}px`;
        el.style.height = `${piece.height}px`;
      });

      if (reducedMotion.matches) {
        for (let i = 0; i < 180; i++) Engine.update(world.engine, STEP);
        pausedRef.current = true;
        setPaused(true);
      }

      render();
      setReady(true);
    }

    function tick(time: number) {
      const elapsed = Math.min(50, time - (lastTime || time));
      lastTime = time;

      const world = worldRef.current;
      const active = visible && !document.hidden && (!pausedRef.current || constraintRef.current !== null);

      if (world && active) {
        accumulator += elapsed;

        let steps = 0;

        while (accumulator >= STEP && steps < 3) {
          Engine.update(world.engine, STEP);
          accumulator -= STEP;
          steps++;
        }

        render();
      } else {
        accumulator = 0;
      }

      frame = requestAnimationFrame(tick);
    }

    function onReducedMotion() {
      if (!reducedMotion.matches) return;
      pausedRef.current = true;
      setPaused(true);
    }

    const resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(board);

    const intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      lastTime = 0;
    }, { threshold: 0 });

    intersectionObserver.observe(board);
    reducedMotion.addEventListener("change", onReducedMotion);

    rebuild();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reducedMotion.removeEventListener("change", onReducedMotion);

      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

      detachConstraint();

      if (worldRef.current) disposeGravityWorld(worldRef.current);

      worldRef.current = null;
    };
  }, []);

  function pick(index: number) {
    const body = worldRef.current?.bodies[index]?.body;
    if (!body) return;

    const color = colorAt(index);

    Sleeping.set(body, false);
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: modeRef.current === "up" ? 9 : -9 });

    resume();
    onPick(side === "warm" ? 0 : 4, color);
    notify(`${color.toUpperCase()} added`, index);
  }

  function startDrag(index: number, event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || dragRef.current) return;

    const world = worldRef.current;
    const board = boardRef.current;
    const piece = world?.bodies[index];

    if (!world || !board || !piece) return;

    const rect = board.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const now = performance.now();

    Sleeping.set(piece.body, false);

    const constraint = Constraint.create({
      pointA: point,
      bodyB: piece.body,
      pointB: Vector.rotate(Vector.sub(point, piece.body.position), -piece.body.angle),
      length: 0,
      stiffness: 0.17,
      damping: 0.15,
    });

    Composite.add(world.engine.world, constraint);

    constraintRef.current = constraint;
    dragRef.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      startTime: now,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now,
      vx: 0,
      vy: 0,
    };

    setGrabbed(index);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(index: number, event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const constraint = constraintRef.current;
    const board = boardRef.current;

    if (!drag || drag.index !== index || !constraint || !board) return;

    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();
    const dt = Math.max(8, now - drag.lastTime);

    drag.vx = ((event.clientX - drag.lastX) / dt) * (1000 / 60);
    drag.vy = ((event.clientY - drag.lastY) / dt) * (1000 / 60);
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;

    constraint.pointA = {
      x: Math.max(12, Math.min(rect.width - 12, x)),
      y: Math.max(12, Math.min(rect.height - 12, y)),
    };
  }

  function endDrag(index: number, event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.index !== index) return;

    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    const duration = performance.now() - drag.startTime;
    const body = worldRef.current?.bodies[index]?.body;

    releaseDrag();

    if (distance < 8 && duration < 400) {
      pick(index);
      return;
    }

    if (body) {
      const clamp = (value: number) => Math.max(-17, Math.min(17, value));

      Sleeping.set(body, false);
      Body.setVelocity(body, { x: clamp(drag.vx), y: clamp(drag.vy) });
      resume();
    }
  }

  function cycleMode() {
    const index = MODES.findIndex((item) => item.id === modeRef.current);
    const next = MODES[(index + 1) % MODES.length];

    modeRef.current = next.id;
    setMode(next.id);

    if (worldRef.current) applyPhysics(worldRef.current, next.id, slowRef.current);

    resume();
    notify(next.label);
  }

  function toggleSlow() {
    const next = !slowRef.current;

    slowRef.current = next;
    setSlow(next);

    if (worldRef.current) applyPhysics(worldRef.current, modeRef.current, next);

    resume();
    notify(next ? "Slow motion enabled" : "Normal speed");
  }

  function toss() {
    if (worldRef.current) tossGravityWorld(worldRef.current);
    resume();
    notify("Shapes tossed!");
  }

  function togglePause() {
    const next = !pausedRef.current;

    pausedRef.current = next;
    setPaused(next);
    notify(next ? "Physics paused" : "Physics resumed");
  }

  const shown = hovered ?? picked;

  return (
    <div className={`relative h-full min-h-0 min-w-0 overflow-hidden ${side === "warm" ? "bg-[#faf1e9] dark:bg-[#29221f]" : "bg-[#efeff9] dark:bg-[#232331]"}`}>
      {/* Palette-reactive atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-55 transition-opacity duration-700 dark:opacity-20" style={{ backgroundImage: `radial-gradient(ellipse at ${side === "warm" ? "0% 10%" : "100% 12%"}, ${colors[0]}85, transparent 65%), radial-gradient(ellipse at ${side === "warm" ? "90% 100%" : "10% 95%"}, ${colors[1]}65, transparent 65%)` }} />

      {/* Extremely subtle surface texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] text-black/10 dark:text-white/10" />

      {/* Side identity */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pt-5 md:px-7 md:pt-7">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium tracking-[0.18em] text-ink/70 md:text-xs">{sideLabel}</span>

        </div>

        <div aria-hidden="true" className="flex items-center gap-1">
          {colors.slice(0, 4).map((color, index) => (
            <span key={index} className="size-2 rounded-full opacity-80 md:size-2.5" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      {/* Matter.js physics board */}
      <div ref={boardRef} className="absolute inset-x-0 top-0 bottom-17 overflow-hidden" aria-label={`${sideLabel.toLowerCase()} interactive gravity shapes`}>
        {gravityPieces.map((piece, index) => {
          const color = colorAt(index);
          const active = grabbed === index;
          const selected = picked === index;

          return (
            <button
              key={index}
              ref={(element) => { elementsRef.current[index] = element; }}
              type="button"
              aria-label={`${side} ${piece.shape} ${index + 1}, ${color}. Click to add color, drag to throw, or use arrow keys to nudge.`}
              title={color.toUpperCase()}
              className={`absolute left-0 top-0 grid touch-none place-items-center overflow-hidden select-none shadow-[inset_0_-8px_16px_#00000016,0_12px_24px_-10px_#00000050] transition-[opacity,box-shadow] duration-300 focus-visible:z-10 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_rgba(255,255,255,0.8),0_12px_24px_-10px_#00000050] ${piece.shape === "square" ? "rounded-[16px]" : "rounded-full"} ${ready ? "opacity-100" : "opacity-0"} ${active ? "z-10 cursor-grabbing shadow-[0_16px_30px_-8px_#00000055]" : "cursor-grab"} ${selected ? "brightness-110" : ""}`}
              style={{ backgroundColor: color, color: ink(color), transitionDelay: ready ? `${index * 30}ms` : "0ms" }}
              onPointerEnter={() => setHovered(index)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              onPointerDown={(event) => startDrag(index, event)}
              onPointerMove={(event) => moveDrag(index, event)}
              onPointerUp={(event) => endDrag(index, event)}
              onPointerCancel={releaseDrag}
              onLostPointerCapture={() => { if (dragRef.current?.index === index) releaseDrag(); }}
              onClick={(event) => { if (event.detail === 0) pick(index); }}
              onKeyDown={(event) => {
                const directions: Record<string, [number, number]> = {
                  ArrowLeft: [-6, 0],
                  ArrowRight: [6, 0],
                  ArrowUp: [0, -8],
                  ArrowDown: [0, 8],
                };

                const velocity = directions[event.key];
                const body = worldRef.current?.bodies[index]?.body;

                if (!velocity || !body) return;

                event.preventDefault();
                Sleeping.set(body, false);
                Body.setVelocity(body, { x: velocity[0], y: velocity[1] });
                resume();
              }}
            >
              <span className={`pointer-events-none absolute inset-0 grid place-items-center transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`}>
                <span className="absolute inset-0 bg-linear-to-br from-white/40 via-white/5 to-transparent" />

                {piece.label ? (
                  <span className={`relative font-semibold ${piece.label.length > 2 ? "text-[11px] tracking-tight" : "text-3xl"}`}>{piece.label}</span>
                ) : (
                  <span className="relative grid size-8 place-items-center rounded-full bg-current/15">
                    <span className="size-3 rounded-full bg-current/50" />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contextual color feedback */}
      <div className="pointer-events-none absolute inset-x-2 bottom-21 z-20 flex justify-center">
        <div role="status" aria-live="polite" className={`flex max-w-full items-center gap-2 rounded-full bg-page/85 px-3 py-2 text-[10px] font-medium text-ink shadow-[0_6px_22px_rgb(0_0_0/0.08)] backdrop-blur-xl transition-[opacity,transform] duration-200 md:text-xs ${shown !== null || feedback ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          {shown !== null && <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: colorAt(shown) }} />}
          <span className="truncate">{picked !== null && feedback ? feedback : shown !== null ? colorAt(shown).toUpperCase() : feedback}</span>
        </div>
      </div>

      {/* Floating physics controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-1">
        <div role="group" aria-label={`${side} physics controls`} className="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-2xl bg-page/85 p-1 text-ink shadow-[0_8px_32px_rgb(0_0_0/0.12)] backdrop-blur-xl md:gap-1 md:p-1.5">
          <button type="button" className={`${control} bg-ink/10 text-ink`} onClick={cycleMode} aria-label={`${currentMode.label}. Click to change gravity`} title={currentMode.label}>
            <span aria-hidden="true" className="text-xl leading-none">{currentMode.icon}</span>
          </button>

          <button type="button" className={`${control} ${slow ? "bg-ink/10 text-ink" : ""}`} onClick={toggleSlow} aria-label="Slow motion" aria-pressed={slow} title={slow ? "Disable slow motion" : "Enable slow motion"}>
            <PhysicsIcon name="slow" />
          </button>

          <button type="button" className={control} onClick={toss} aria-label={`Toss ${side} shapes`} title="Toss shapes">
            <PhysicsIcon name="toss" />
          </button>

          <button type="button" className={`${control} ${paused ? "bg-ink/10 text-ink" : ""}`} onClick={togglePause} aria-label={paused ? `Resume ${side} physics` : `Pause ${side} physics`} aria-pressed={paused} title={paused ? "Resume" : "Pause"}>
            <PhysicsIcon name={paused ? "play" : "pause"} />
          </button>
        </div>
      </div>
    </div>
  );
}
