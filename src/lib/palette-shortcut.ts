/** Reserve unmodified Space for palette generation, except inside editing controls. */
export function handlePaletteShortcut(event: KeyboardEvent, generate: () => void) {
  if (
    (event.code !== "Space" && event.key !== " ") ||
    event.defaultPrevented ||
    event.isComposing ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.shiftKey
  ) return;

  const target = event.target as HTMLElement | null;
  if (
    target?.isContentEditable ||
    target?.closest?.(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"]',
    )
  ) return;

  // Also cancel the focused button's normal Space activation and page scrolling.
  // Keep focus where it is; Enter can still activate the button normally.
  event.preventDefault();
  if (!event.repeat) generate();
}
