import { describe, expect, it } from 'vitest';
import { isSupportedUrl, pageIdentityFromUrl, pageMatches } from '../src/shared/utils';

describe('pageIdentityFromUrl', () => {
  it('extracts identity parts', () => {
    const id = pageIdentityFromUrl('https://example.com/products/123?ref=a#top');
    expect(id.hostname).toBe('example.com');
    expect(id.pathname).toBe('/products/123');
    expect(id.search).toBe('?ref=a');
    expect(id.hash).toBe('#top');
    expect(id.origin).toBe('https://example.com');
  });
});

describe('isSupportedUrl', () => {
  it('accepts http and https', () => {
    expect(isSupportedUrl('https://a.com')).toBe(true);
    expect(isSupportedUrl('http://a.com')).toBe(true);
  });
  it('rejects internal and unsupported schemes', () => {
    expect(isSupportedUrl('chrome://extensions')).toBe(false);
    expect(isSupportedUrl('about:blank')).toBe(false);
    expect(isSupportedUrl(undefined)).toBe(false);
  });
});

describe('pageMatches', () => {
  const a = pageIdentityFromUrl('https://example.com/products/123?ref=a');
  const sameNoQuery = pageIdentityFromUrl('https://example.com/products/123');
  const otherPath = pageIdentityFromUrl('https://example.com/products/999');
  const otherHost = pageIdentityFromUrl('https://shop.example.com/products/123');

  it('exact requires identical path and query', () => {
    expect(pageMatches(a, a, 'exact')).toBe(true);
    expect(pageMatches(a, sameNoQuery, 'exact')).toBe(false);
  });
  it('path ignores query but requires same path', () => {
    expect(pageMatches(a, sameNoQuery, 'path')).toBe(true);
    expect(pageMatches(a, otherPath, 'path')).toBe(false);
  });
  it('domain matches any path on same hostname', () => {
    expect(pageMatches(a, otherPath, 'domain')).toBe(true);
    expect(pageMatches(a, otherHost, 'domain')).toBe(false);
  });
});
