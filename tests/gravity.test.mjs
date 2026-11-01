import assert from 'node:assert/strict';
import { test } from 'node:test';
import Matter from 'matter-js';
import { createGravityWorld, tossGravityWorld, disposeGravityWorld } from '../src/lib/gravity.ts';

for (const [width, height] of [[300, 390], [150, 250], [720, 780]]) {
  test(`gravity drops and contains bodies in a ${width}x${height} container`, () => {
    const world = createGravityWorld(width, height);
    const initialY = world.bodies[0].body.position.y;
    for (let i = 0; i < 360; i++) Matter.Engine.update(world.engine, 1000 / 60);
    assert.ok(world.bodies[0].body.position.y > initialY + 30);
    for (const { body } of world.bodies) {
      assert.ok(body.bounds.min.x >= -3, 'escaped left wall');
      assert.ok(body.bounds.max.x <= width + 3, 'escaped right wall');
      assert.ok(body.bounds.max.y <= height + 3, 'escaped floor');
      assert.ok(Number.isFinite(body.position.x) && Number.isFinite(body.position.y));
    }
    tossGravityWorld(world);
    assert.ok(world.bodies.every(({ body }) => body.velocity.y < 0));
    for (let i = 0; i < 300; i++) Matter.Engine.update(world.engine, 1000 / 60);
    for (const { body } of world.bodies) assert.ok(body.bounds.max.y <= height + 3);
    disposeGravityWorld(world);
    assert.equal(world.engine.world.bodies.length, 0);
  });
}

test('a grabbed shape follows its constraint and falls after release', () => {
  const world = createGravityWorld(300, 390);
  for (let i = 0; i < 240; i++) Matter.Engine.update(world.engine, 1000 / 60);
  const body = world.bodies[0].body;
  Matter.Sleeping.set(body, false);
  const grip = Matter.Constraint.create({ bodyB: body, pointA: { x: 150, y: 60 }, length: 0, stiffness: 0.15, damping: 0.12 });
  Matter.Composite.add(world.engine.world, grip);
  for (let i = 0; i < 180; i++) Matter.Engine.update(world.engine, 1000 / 60);
  assert.ok(body.position.y < 100, 'constraint did not lift the body');
  Matter.Composite.remove(world.engine.world, grip);
  for (let i = 0; i < 240; i++) Matter.Engine.update(world.engine, 1000 / 60);
  assert.ok(body.position.y > 150, 'released shape did not fall');
  disposeGravityWorld(world);
});
