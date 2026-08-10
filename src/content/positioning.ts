export interface Point {
  left: number;
  top: number;
}

const GAP = 6;

/** Places the reminder just below the anchor's left edge, then applies any
 *  user drag offset, clamped so it stays within the viewport. */
export function computePosition(
  rect: DOMRect,
  size: { width: number; height: number },
  offset?: { x?: number; y?: number },
): Point {
  let left = rect.left + (offset?.x ?? 0);
  let top = rect.bottom + GAP + (offset?.y ?? 0);

  const maxLeft = Math.max(GAP, window.innerWidth - size.width - GAP);
  const maxTop = Math.max(GAP, window.innerHeight - size.height - GAP);

  left = Math.min(Math.max(GAP, left), maxLeft);
  top = Math.min(Math.max(GAP, top), maxTop);

  return { left, top };
}
