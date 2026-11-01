import Matter from "matter-js";

const { Engine, Bodies, Body, Composite, Sleeping } = Matter;

export const gravityPieces = [
  { shape: "circle", size: 68, label: "✳" },
  { shape: "square", size: 72, label: "Aa" },
  { shape: "pill", size: 76, label: "hello" },
  { shape: "circle", size: 52, label: "" },
  { shape: "square", size: 54, label: "+" },
  { shape: "pill", size: 86, label: "color" },
  { shape: "circle", size: 63, label: "☺" },
  { shape: "square", size: 62, label: "m" },
] as const;

/** Independent bounded world for each hero container. Positions are CSS pixels. */
export function createGravityWorld(width: number, height: number) {
  const engine = Engine.create({
    enableSleeping: true,
    positionIterations: 8,
    velocityIterations: 8,
  });
  engine.gravity.y = 1.25;
  const scale = Math.min(1.6, width / 265);
  const bodies = gravityPieces.map((piece, index) => {
    const w = piece.size * scale;
    const h = piece.shape === "pill" ? w * 0.55 : w;
    const x = Math.min(
      width - w / 2 - 4,
      22 + w / 2 + ((index % 3) * (width - w - 44)) / 2,
    );
    const y = 35 + Math.floor(index / 3) * 76 * scale;
    const options = {
      restitution: 0.36,
      friction: 0.5,
      frictionStatic: 0.85,
      frictionAir: 0.012,
      angle: (index % 2 ? 1 : -1) * 0.12 * (index + 1),
      sleepThreshold: 60,
    };
    const body =
      piece.shape === "circle"
        ? Bodies.circle(x, y, w / 2, options)
        : Bodies.rectangle(x, y, w, h, {
            ...options,
            chamfer: { radius: piece.shape === "pill" ? h / 2 - 1 : 9 * scale },
          });
    return { body, width: w, height: h };
  });
  const wall = { isStatic: true, restitution: 0.3, friction: 0.5 };
  Composite.add(engine.world, [
    Bodies.rectangle(width / 2, height + 25, width + 100, 50, wall),
    Bodies.rectangle(-25, height / 2, 50, height + 100, wall),
    Bodies.rectangle(width + 25, height / 2, 50, height + 100, wall),
    Bodies.rectangle(width / 2, -45, width + 100, 50, wall),
    ...bodies.map((item) => item.body),
  ]);
  return { engine, bodies, width, height };
}

export type GravityWorld = ReturnType<typeof createGravityWorld>;

export function tossGravityWorld(world: GravityWorld) {
  world.bodies.forEach(({ body }, index) => {
    Sleeping.set(body, false);
    Body.setVelocity(body, {
      x: (index % 2 ? 1 : -1) * (2 + (index % 3)),
      y: -8 - (index % 4),
    });
    Body.setAngularVelocity(body, (index % 2 ? 1 : -1) * 0.09);
  });
}

export function disposeGravityWorld(world: GravityWorld) {
  Composite.clear(world.engine.world, false);
  Engine.clear(world.engine);
}
