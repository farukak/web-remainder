import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildAnchorFromElement,
  buildAnchorFromRange,
} from '../src/content/anchor-resolver';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('buildAnchorFromElement', () => {
  it('prefers a unique id selector', () => {
    document.body.innerHTML = '<div id="target">hi</div>';
    const el = document.getElementById('target')!;
    const anchor = buildAnchorFromElement(el);
    expect(anchor.type).toBe('element');
    expect(anchor.selector).toBe('#target');
    expect(document.querySelector(anchor.selector!)).toBe(el);
  });

  it('builds an nth-of-type path when no id exists', () => {
    document.body.innerHTML =
      '<section><p>one</p><p>two</p><p>three</p></section>';
    const el = document.querySelectorAll('p')[1]!;
    const anchor = buildAnchorFromElement(el);
    expect(anchor.selector).toBeDefined();
    expect(document.querySelector(anchor.selector!)).toBe(el);
    expect(anchor.elementFingerprint?.tagName).toBe('p');
  });
});

describe('buildAnchorFromRange', () => {
  it('captures the selected text as an exact quote', () => {
    document.body.innerHTML = '<p id="p">Migrate this service to Node 22 soon</p>';
    const textNode = document.getElementById('p')!.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 8); // "this service..."
    range.setEnd(textNode, 20); // "...to"
    const anchor = buildAnchorFromRange(range);
    expect(anchor.type).toBe('text');
    expect(anchor.textQuote?.exact).toBe(range.toString());
    expect(anchor.textQuote?.exact.length).toBeGreaterThan(0);
    expect(anchor.selector).toBeDefined();
  });
});
