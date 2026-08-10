import { describe, expect, it } from 'vitest';
import { EMOJI_GROUPS, PALETTES } from '../src/shared/palettes';

describe('palettes', () => {
  it('exposes at least a handful of palettes', () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(8);
  });

  it('every palette has valid hex colors', () => {
    const hex = /^#[0-9a-f]{6}$/i;
    for (const p of PALETTES) {
      expect(p.color, p.name).toMatch(hex);
      expect(p.backgroundColor, p.name).toMatch(hex);
    }
  });

  it('palette names are unique', () => {
    const names = PALETTES.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('emoji groups', () => {
  it('each group has a label and non-empty emoji list', () => {
    expect(EMOJI_GROUPS.length).toBeGreaterThan(0);
    for (const group of EMOJI_GROUPS) {
      expect(group.label.length).toBeGreaterThan(0);
      expect(group.emojis.length).toBeGreaterThan(0);
    }
  });
});
