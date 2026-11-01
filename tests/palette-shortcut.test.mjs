import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handlePaletteShortcut } from '../src/lib/palette-shortcut.ts';

function keyboardEvent(overrides = {}) {
  return {
    code: 'Space', key: ' ', defaultPrevented: false, isComposing: false,
    ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, repeat: false,
    target: { isContentEditable: false, closest: () => null },
    preventDefault() { this.defaultPrevented = true; },
    ...overrides,
  };
}

test('Space generates after a button retains focus and cancels native activation', () => {
  let generations = 0;
  const event = keyboardEvent({ target: { tagName: 'BUTTON', closest: () => null } });
  handlePaletteShortcut(event, () => generations++);
  assert.equal(generations, 1);
  assert.equal(event.defaultPrevented, true);
});

test('Space also works from the page, links and nested button icons', () => {
  for (const tagName of ['BODY', 'A', 'SVG', 'SPAN']) {
    let generations = 0;
    const event = keyboardEvent({ target: { tagName, closest: () => null } });
    handlePaletteShortcut(event, () => generations++);
    assert.equal(generations, 1, tagName);
    assert.equal(event.defaultPrevented, true);
  }
});

test('editing controls retain normal Space behavior', () => {
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    const control = { tagName, closest: () => control };
    const event = keyboardEvent({ target: control });
    handlePaletteShortcut(event, () => assert.fail('Generated inside an input'));
    assert.equal(event.defaultPrevented, false);
  }
  const event = keyboardEvent({ target: { isContentEditable: true } });
  handlePaletteShortcut(event, () => assert.fail('Generated inside an editor'));
  assert.equal(event.defaultPrevented, false);
});

test('Enter, modifiers, composition and already-handled events are left alone', () => {
  for (const override of [{ code: 'Enter', key: 'Enter' }, { ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }, { isComposing: true }, { defaultPrevented: true }]) {
    const event = keyboardEvent(override);
    handlePaletteShortcut(event, () => assert.fail('Unexpected generation'));
    assert.equal(event.defaultPrevented, Boolean(override.defaultPrevented));
  }
});

test('holding Space does not repeatedly generate or reactivate the button', () => {
  const event = keyboardEvent({ repeat: true });
  handlePaletteShortcut(event, () => assert.fail('Repeated generation'));
  assert.equal(event.defaultPrevented, true);
});
