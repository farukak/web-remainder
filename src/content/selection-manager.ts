import { buildAnchorFromElement, buildAnchorFromRange } from './anchor-resolver';
import type { Anchor } from '../shared/types';
import { throttle } from '../shared/utils';

export interface PickResult {
  anchor: Anchor;
  rect: DOMRect;
  text: string;
}

export class SelectionManager {
  private active = false;
  private highlight: HTMLDivElement | null = null;
  private hint: HTMLDivElement | null = null;
  private onPicked: ((result: PickResult) => void) | null = null;
  private onCancel: (() => void) | null = null;

  constructor(
    private root: ShadowRoot,
    private overlay: HTMLElement,
  ) {}

  get isActive(): boolean {
    return this.active;
  }

  start(onPicked: (result: PickResult) => void, onCancel: () => void): void {
    if (this.active) return;
    this.active = true;
    this.onPicked = onPicked;
    this.onCancel = onCancel;

    this.highlight = document.createElement('div');
    this.highlight.className = 'wr-pick-highlight';
    this.highlight.style.display = 'none';

    this.hint = document.createElement('div');
    this.hint.className = 'wr-pick-hint wr-surface';
    this.hint.textContent = 'Select text or click an element — Esc to cancel';

    this.overlay.append(this.highlight, this.hint);

    document.addEventListener('mousemove', this.handleMove, true);
    document.addEventListener('mouseup', this.handleUp, true);
    document.addEventListener('keydown', this.handleKey, true);
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    this.onPicked = null;
    this.onCancel = null;
    document.removeEventListener('mousemove', this.handleMove, true);
    document.removeEventListener('mouseup', this.handleUp, true);
    document.removeEventListener('keydown', this.handleKey, true);
    this.highlight?.remove();
    this.hint?.remove();
    this.highlight = null;
    this.hint = null;
  }

  private isOwnNode(node: EventTarget | null): boolean {
    return node instanceof Node && this.root.host.contains(node as Node);
  }

  private handleMove = throttle((event: MouseEvent) => {
    if (!this.highlight) return;
    const target = event.target as Element | null;
    if (!target || this.isOwnNode(target) || target === document.documentElement) {
      this.highlight.style.display = 'none';
      return;
    }
    const rect = target.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this.highlight.style.display = 'none';
      return;
    }
    Object.assign(this.highlight.style, {
      display: 'block',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }, 30);

  private handleUp = (event: MouseEvent) => {
    if (this.isOwnNode(event.target)) return;

    const selection = window.getSelection();
    const hasText =
      selection && !selection.isCollapsed && selection.toString().trim().length > 0;

    if (hasText && selection) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const anchor = buildAnchorFromRange(range);
      this.finish({ anchor, rect, text: '' });
      return;
    }

    const target = event.target as Element | null;
    if (!target || target === document.body || target === document.documentElement) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.blockNextClick();
    const anchor = buildAnchorFromElement(target);
    this.finish({ anchor, rect: target.getBoundingClientRect(), text: '' });
  };

  private blockNextClick(): void {
    const blocker = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      document.removeEventListener('click', blocker, true);
    };
    document.addEventListener('click', blocker, true);
    setTimeout(() => document.removeEventListener('click', blocker, true), 300);
  }

  private handleKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      const cancel = this.onCancel;
      this.stop();
      cancel?.();
    }
  };

  private finish(result: PickResult): void {
    const picked = this.onPicked;
    this.stop();
    picked?.(result);
  }
}
