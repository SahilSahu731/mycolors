"use client";

import { useEffect, useRef, useState } from "react";
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

type Mode = "down" | "up" | "float";
const MODES: { id: Mode; icon: string; label: string }[] = [
  { id: "down", icon: "↓", label: "Gravity down" },
  { id: "up", icon: "↑", label: "Gravity up" },
  { id: "float", icon: "◌", label: "Zero gravity" },
];

function applyPhysics(world: GravityWorld, mode: Mode, slow: boolean) {
  world.engine.gravity.y = mode === "down" ? 1 : mode === "up" ? -1 : 0;
  world.engine.timing.timeScale = slow ? 0.35 : 1;
  world.bodies.forEach(({ body }) => Sleeping.set(body, false));
}

const ctl =
  "grid size-8 place-items-center rounded-lg text-sm text-muted transition-colors hover:bg-black/5 hover:text-ink aria-pressed:bg-black/10 aria-pressed:text-ink dark:hover:bg-white/10 dark:aria-pressed:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink";

export default function GravityContainer({
  palette,
  side,
  onPick,
}: {
  palette: string[];
  side: "warm" | "cool";
  onPick: (index: number, color: string) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const elements = useRef<(HTMLButtonElement | null)[]>([]);
  const worldRef = useRef<GravityWorld | null>(null);
  const constraintRef = useRef<Matter.Constraint | null>(null);
  const selectedRef = useRef<number | null>(null);
  const downRef = useRef({ x: 0, y: 0, t: 0 });
  const pausedRef = useRef(false);
  const modeRef = useRef<Mode>("down");
  const slowRef = useRef(false);
  const pickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("down");
  const [slow, setSlow] = useState(false);
  const [grabbed, setGrabbed] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [message, setMessage] = useState("Drag to throw. Click to pick a color.");

  const colors =
    side === "warm"
      ? [palette[0], palette[1], "#f5b99a", "#e9957a", "#ebcc87"]
      : [palette[4], palette[3], palette[2], "#a3c8b3", "#c1b3e1"];
  const colorAt = (i: number) => colors[i % colors.length];

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let raf = 0,
      lastTime = 0,
      accumulator = 0,
      visible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function render() {
      worldRef.current?.bodies.forEach(({ body, width, height }, i) => {
        const el = elements.current[i];
        if (el)
          el.style.transform = `translate(${body.position.x - width / 2}px, ${body.position.y - height / 2}px) rotate(${body.angle}rad)`;
      });
    }
    function rebuild() {
      if (!board) return;
      const width = board.clientWidth,
        height = board.clientHeight;
      if (width < 1 || height < 1) return;
      if (
        worldRef.current &&
        Math.abs(worldRef.current.width - width) < 1 &&
        Math.abs(worldRef.current.height - height) < 1
      )
        return;
      if (worldRef.current) disposeGravityWorld(worldRef.current);
      constraintRef.current = null;
      selectedRef.current = null;
      const world = createGravityWorld(width, height);
      worldRef.current = world;
      applyPhysics(world, modeRef.current, slowRef.current);
      world.bodies.forEach(({ width, height }, i) => {
        const el = elements.current[i];
        if (el) {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        }
      });
      if (reducedMotion.matches)
        for (let i = 0; i < 240; i++) Engine.update(world.engine, 1000 / 60);
      render();
      setReady(true);
    }
    function tick(time: number) {
      const world = worldRef.current;
      const elapsed = Math.min(50, time - (lastTime || time));
      lastTime = time;
      if (
        world &&
        visible &&
        !document.hidden &&
        (!pausedRef.current || constraintRef.current)
      ) {
        accumulator += elapsed;
        while (accumulator >= 1000 / 60) {
          Engine.update(world.engine, 1000 / 60);
          accumulator -= 1000 / 60;
        }
        render();
      } else accumulator = 0;
      raf = requestAnimationFrame(tick);
    }
    const resize = new ResizeObserver(rebuild);
    resize.observe(board);
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    });
    observer.observe(board);
    rebuild();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
      clearTimeout(pickTimer.current);
      if (worldRef.current) disposeGravityWorld(worldRef.current);
      worldRef.current = null;
    };
  }, []);

  function release() {
    if (worldRef.current && constraintRef.current)
      Composite.remove(worldRef.current.engine.world, constraintRef.current);
    constraintRef.current = null;
    selectedRef.current = null;
    setGrabbed(null);
  }

  function resume() {
    pausedRef.current = false;
    setPaused(false);
  }

  function pick(i: number) {
    const world = worldRef.current;
    if (!world) return;
    const body = world.bodies[i].body;
    Sleeping.set(body, false);
    Body.setVelocity(body, {
      // eslint-disable-next-line react-hooks/purity
      x: (Math.random() - 0.5) * 4,
      y: modeRef.current === "up" ? 10 : -10,
    });
    resume();
    onPick(side === "warm" ? 0 : 4, colorAt(i));
    setPicked(i);
    setMessage(`Added ${colorAt(i).toUpperCase()} to your palette`);
    clearTimeout(pickTimer.current);
    pickTimer.current = setTimeout(() => {
      setPicked(null);
      setMessage("Drag to throw. Click to pick a color.");
    }, 1600);
  }

  function cycleMode() {
    const next = MODES[(MODES.findIndex((m) => m.id === mode) + 1) % MODES.length];
    modeRef.current = next.id;
    setMode(next.id);
    if (worldRef.current) applyPhysics(worldRef.current, next.id, slowRef.current);
    resume();
    setMessage(next.label);
  }

  function toggleSlow() {
    slowRef.current = !slow;
    setSlow(!slow);
    if (worldRef.current) applyPhysics(worldRef.current, modeRef.current, slowRef.current);
    setMessage(!slow ? "Slow motion on" : "Slow motion off");
  }

  const shown = hover ?? picked;
  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div
      className={`relative h-full min-h-0 min-w-0 overflow-hidden ${side === "warm" ? "border-r border-orange-200/40 bg-[#f7f0e8] dark:border-white/5 dark:bg-[#2b2520]" : "bg-[#eeedf6] dark:bg-[#252331]"}`}
    >
      {/* soft color glow from the palette + dotted grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          backgroundImage: `radial-gradient(75% 50% at 20% 0%, ${colors[0]}55, transparent 70%), radial-gradient(60% 45% at 90% 100%, ${colors[1]}40, transparent 70%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-black/10 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-size-[22px_22px] dark:text-white/10"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-4 pt-5 md:px-8">
        <span className="text-xs font-semibold tracking-tight text-ink md:text-sm">
          {side === "warm" ? "Warm side" : "Cool side"}
        </span>
        <span className="flex -space-x-1" aria-hidden="true">
          {colors.map((c, i) => (
            <i
              key={i}
              style={{ background: c }}
              className="size-3.5 rounded-full border-2 border-white/80 dark:border-black/40"
            />
          ))}
        </span>
      </div>

      <div
        ref={boardRef}
        className="absolute inset-x-0 top-0 bottom-16 overflow-hidden"
        aria-label={`${side === "warm" ? "Left warm" : "Right cool"} gravity container`}
      >
        {gravityPieces.map((piece, i) => (
          <button
            key={i}
            ref={(el) => {
              elements.current[i] = el;
            }}
            aria-label={`${side} ${piece.shape} ${i + 1}, ${colorAt(i)}: drag to throw, press Enter to pick, arrow keys to nudge`}
            className={`absolute left-0 top-0 grid touch-none place-items-center overflow-hidden font-semibold shadow-[inset_0_-6px_0_#00000012,0_10px_18px_-8px_#00000040] transition-opacity duration-500 select-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${piece.shape === "square" ? "rounded-[10px]" : "rounded-full"} ${ready ? "opacity-100" : "opacity-0"} ${picked === i ? "ring-[6px] ring-white/80 dark:ring-white/40" : ""} ${grabbed === i ? "cursor-grabbing" : "cursor-grab"}`}
            style={{
              background: colorAt(i),
              color: ink(colorAt(i)),
              transitionDelay: ready ? `${i * 45}ms` : "0ms",
            }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onPointerDown={(event) => {
              if (event.button !== 0 || selectedRef.current !== null) return;
              const world = worldRef.current,
                board = boardRef.current;
              if (!world || !board) return;
              const rect = board.getBoundingClientRect();
              const point = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
              };
              downRef.current = { x: event.clientX, y: event.clientY, t: Date.now() };
              const body = world.bodies[i].body;
              Sleeping.set(body, false);
              constraintRef.current = Constraint.create({
                pointA: point,
                bodyB: body,
                pointB: Vector.rotate(Vector.sub(point, body.position), -body.angle),
                length: 0,
                stiffness: 0.15,
                damping: 0.12,
              });
              Composite.add(world.engine.world, constraintRef.current);
              selectedRef.current = i;
              setGrabbed(i);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (selectedRef.current !== i || !constraintRef.current || !boardRef.current)
                return;
              const rect = boardRef.current.getBoundingClientRect();
              constraintRef.current.pointA = {
                x: Math.max(15, Math.min(rect.width - 15, event.clientX - rect.left)),
                y: Math.max(15, Math.min(rect.height - 15, event.clientY - rect.top)),
              };
            }}
            onPointerUp={(event) => {
              if (selectedRef.current !== i) return;
              const d = downRef.current;
              const moved = Math.hypot(event.clientX - d.x, event.clientY - d.y);
              const quick = Date.now() - d.t < 350;
              release();
              // A short, still press is a click: pick the color.
              if (moved < 6 && quick) pick(i);
              else setMessage("Let it fall.");
            }}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onClick={(event) => {
              if (event.detail === 0) pick(i); // keyboard Enter / Space
            }}
            onKeyDown={(event) => {
              const nudge: Record<string, [number, number]> = {
                ArrowLeft: [-6, 0],
                ArrowRight: [6, 0],
                ArrowUp: [0, -8],
                ArrowDown: [0, 6],
              };
              const v = nudge[event.key];
              if (!v || !worldRef.current) return;
              event.preventDefault();
              const body = worldRef.current.bodies[i].body;
              Sleeping.set(body, false);
              Body.setVelocity(body, { x: v[0], y: v[1] });
              resume();
            }}
          >
            <span
              className={`pointer-events-none absolute inset-0 grid place-items-center transition-transform duration-150 ${grabbed === i ? "scale-110" : ""}`}
            >
              <span className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent" />
              <span
                className={`relative ${piece.label.length > 2 ? "text-[11px] tracking-tight" : "text-3xl"}`}
              >
                {piece.label}
              </span>
              {piece.label === "" && (
                <span className="relative size-5 rounded-full border-[5px] border-current opacity-40" />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* live status: hovered / picked color or last action */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[72px] z-10 flex justify-center px-3">
        <span
          role="status"
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-[10px] text-ink shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/30 md:text-xs"
        >
          {shown !== null && (
            <i
              style={{ background: colorAt(shown) }}
              className="size-3 shrink-0 rounded-full border border-black/10"
            />
          )}
          <span className="truncate">
            {hover !== null ? colorAt(hover).toUpperCase() : message}
          </span>
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex h-16 items-center justify-between gap-2 border-t border-black/5 bg-white/30 px-3 backdrop-blur-sm dark:border-white/5 dark:bg-black/15 md:px-6">
        <span className="hidden text-xs text-muted sm:block">{current.label}</span>
        <div className="ml-auto flex gap-0.5">
          <button
            className={ctl}
            title={current.label}
            aria-label={`${current.label}. Change gravity`}
            onClick={cycleMode}
          >
            {current.icon}
          </button>
          <button
            className={ctl}
            aria-pressed={slow}
            title="Slow motion"
            aria-label="Slow motion"
            onClick={toggleSlow}
          >
            ◔
          </button>
          <button
            className={ctl}
            title="Toss shapes"
            aria-label={`Toss ${side} shapes`}
            onClick={() => {
              if (worldRef.current) tossGravityWorld(worldRef.current);
              resume();
              setMessage("A fresh little tumble.");
            }}
          >
            ↻
          </button>
          <button
            className={ctl}
            aria-pressed={paused}
            title={paused ? "Resume" : "Pause"}
            aria-label={`${paused ? "Resume" : "Pause"} ${side} physics`}
            onClick={() => {
              pausedRef.current = !paused;
              setPaused(!paused);
            }}
          >
            {paused ? "▶" : "❚❚"}
          </button>
        </div>
      </div>
    </div>
  );
}