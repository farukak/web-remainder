import type { Anchor } from '../shared/types';

export interface ResolvedAnchor {
  element: Element | null;
  rect: DOMRect | null;
  range: Range | null;
  confidence: number;
  method: string;
}

const QUOTE_CONTEXT = 40;

function isRenderable(el: Element | null): el is Element {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
}

/** Builds a unique-ish CSS selector by walking up to the nearest id-bearing
 *  ancestor and recording nth-of-type steps. */
function cssSelectorFor(el: Element): string | undefined {
  if (el.id && document.querySelectorAll(`#${cssEscape(el.id)}`).length === 1) {
    return `#${cssEscape(el.id)}`;
  }
  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;
  while (node && node.nodeType === Node.ELEMENT_NODE && depth < 8) {
    if (node.id && document.querySelectorAll(`#${cssEscape(node.id)}`).length === 1) {
      parts.unshift(`#${cssEscape(node.id)}`);
      break;
    }
    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const siblings = Array.from(parent.children).filter(
      (c) => c.tagName === node!.tagName,
    );
    const step =
      siblings.length > 1
        ? `${tag}:nth-of-type(${siblings.indexOf(node) + 1})`
        : tag;
    parts.unshift(step);
    node = parent;
    depth += 1;
  }
  const selector = parts.join(' > ');
  try {
    if (selector && document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  } catch {
    return undefined;
  }
  return selector || undefined;
}

function xpathFor(el: Element): string {
  const segments: string[] = [];
  let node: Element | null = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = node.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === node.tagName) index += 1;
      sibling = sibling.previousElementSibling;
    }
    segments.unshift(`${node.tagName.toLowerCase()}[${index}]`);
    node = node.parentElement;
  }
  return `/${segments.join('/')}`;
}

function elementByXPath(xpath: string): Element | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    return result.singleNodeValue as Element | null;
  } catch {
    return null;
  }
}

function fingerprintFor(el: Element): NonNullable<Anchor['elementFingerprint']> {
  const attributes: Record<string, string> = {};
  for (const name of ['role', 'aria-label', 'name', 'type', 'href', 'title']) {
    const value = el.getAttribute(name);
    if (value) attributes[name] = value;
  }
  return {
    tagName: el.tagName.toLowerCase(),
    id: el.id || undefined,
    classNames: el.classList.length ? Array.from(el.classList) : undefined,
    attributes: Object.keys(attributes).length ? attributes : undefined,
  };
}

function elementByFingerprint(
  fp: NonNullable<Anchor['elementFingerprint']>,
): Element | null {
  const candidates = Array.from(document.getElementsByTagName(fp.tagName ?? '*'));
  let best: { el: Element; score: number } | null = null;
  for (const el of candidates) {
    let score = 0;
    if (fp.id && el.id === fp.id) score += 3;
    if (fp.classNames?.length) {
      const shared = fp.classNames.filter((c) => el.classList.contains(c)).length;
      score += shared / fp.classNames.length;
    }
    if (fp.attributes) {
      for (const [k, v] of Object.entries(fp.attributes)) {
        if (el.getAttribute(k) === v) score += 0.5;
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { el, score };
  }
  return best?.el ?? null;
}

/** Locates a text span within the document, using surrounding context to
 *  disambiguate repeated occurrences, and returns its Range. */
function findTextRange(quote: NonNullable<Anchor['textQuote']>): Range | null {
  const { exact, prefix = '', suffix = '' } = quote;
  if (!exact) return null;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement && node.textContent?.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  const chunks: { node: Text; start: number }[] = [];
  let full = '';
  let current = walker.nextNode() as Text | null;
  while (current) {
    chunks.push({ node: current, start: full.length });
    full += current.textContent ?? '';
    current = walker.nextNode() as Text | null;
  }

  const needle = prefix + exact + suffix;
  let matchIndex = full.indexOf(needle);
  let quoteStart: number;
  if (matchIndex !== -1) {
    quoteStart = matchIndex + prefix.length;
  } else {
    matchIndex = full.indexOf(exact);
    if (matchIndex === -1) return null;
    quoteStart = matchIndex;
  }
  const quoteEnd = quoteStart + exact.length;

  const locate = (offset: number): { node: Text; offset: number } | null => {
    for (const chunk of chunks) {
      const len = chunk.node.textContent?.length ?? 0;
      if (offset >= chunk.start && offset <= chunk.start + len) {
        return { node: chunk.node, offset: offset - chunk.start };
      }
    }
    return null;
  };

  const startPos = locate(quoteStart);
  const endPos = locate(quoteEnd);
  if (!startPos || !endPos) return null;

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  return range;
}

export function buildAnchorFromRange(range: Range): Anchor {
  const container =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as Element)
      : range.commonAncestorContainer.parentElement;

  const exact = range.toString();
  const bodyText = document.body.textContent ?? '';
  const start = bodyText.indexOf(exact);

  const anchor: Anchor = {
    type: 'text',
    textQuote: {
      exact,
      prefix: sliceContext(bodyText, start, 'before'),
      suffix: sliceContext(bodyText, start + exact.length, 'after'),
    },
  };
  if (start !== -1) {
    anchor.textPosition = { start, end: start + exact.length };
  }
  if (container) {
    anchor.selector = cssSelectorFor(container);
    anchor.xpath = xpathFor(container);
    anchor.elementFingerprint = fingerprintFor(container);
  }
  return anchor;
}

function sliceContext(text: string, index: number, side: 'before' | 'after'): string {
  if (index < 0) return '';
  return side === 'before'
    ? text.slice(Math.max(0, index - QUOTE_CONTEXT), index)
    : text.slice(index, index + QUOTE_CONTEXT);
}

export function buildAnchorFromElement(el: Element): Anchor {
  return {
    type: 'element',
    selector: cssSelectorFor(el),
    xpath: xpathFor(el),
    elementFingerprint: fingerprintFor(el),
  };
}

export function resolveAnchor(anchor: Anchor): ResolvedAnchor {
  // 1. Text-quote match gives the most precise rect for text anchors.
  if (anchor.type === 'text' && anchor.textQuote) {
    const range = findTextRange(anchor.textQuote);
    if (range) {
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return {
          element: range.startContainer.parentElement,
          rect,
          range,
          confidence: 0.85,
          method: 'textQuote',
        };
      }
    }
  }

  // 2. Stable selector.
  if (anchor.selector) {
    try {
      const el = document.querySelector(anchor.selector);
      if (isRenderable(el)) {
        return {
          element: el,
          rect: el.getBoundingClientRect(),
          range: null,
          confidence: 1,
          method: 'selector',
        };
      }
    } catch {
      // invalid selector, fall through
    }
  }

  // 3. XPath.
  if (anchor.xpath) {
    const el = elementByXPath(anchor.xpath);
    if (isRenderable(el)) {
      return {
        element: el,
        rect: el.getBoundingClientRect(),
        range: null,
        confidence: 0.9,
        method: 'xpath',
      };
    }
  }

  // 4. Element fingerprint.
  if (anchor.elementFingerprint) {
    const el = elementByFingerprint(anchor.elementFingerprint);
    if (isRenderable(el)) {
      return {
        element: el,
        rect: el.getBoundingClientRect(),
        range: null,
        confidence: 0.7,
        method: 'fingerprint',
      };
    }
  }

  return { element: null, rect: null, range: null, confidence: 0, method: 'none' };
}
