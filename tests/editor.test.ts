import { describe, expect, it, vi } from 'vitest';
import { ReminderEditor } from '../src/content/editor';
import { DEFAULT_STYLE } from '../src/shared/constants';
import { EMOJI_GROUPS, PALETTES } from '../src/shared/palettes';

function mountEditor(onSave: (r: { text: string; style: typeof DEFAULT_STYLE }) => void) {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  new ReminderEditor(shadow, {
    title: 'New reminder',
    initialText: '',
    initialStyle: { ...DEFAULT_STYLE },
    position: { left: 10, top: 10 },
    showDelete: false,
    onSave,
    onCancel: () => {},
  });
  return shadow;
}

describe('ReminderEditor', () => {
  it('applies a palette and inserts an emoji into the saved reminder', () => {
    const onSave = vi.fn();
    const shadow = mountEditor(onSave);

    const swatch = shadow.querySelector<HTMLButtonElement>('.wr-palette')!;
    swatch.click(); // first palette

    const emojiBtn = shadow.querySelector<HTMLButtonElement>('.wr-emoji')!;
    const emoji = emojiBtn.textContent!;
    emojiBtn.click();

    shadow.querySelector<HTMLButtonElement>('.wr-btn-primary')!.click();

    expect(onSave).toHaveBeenCalledTimes(1);
    const result = onSave.mock.calls[0][0];
    expect(result.text).toContain(emoji);
    expect(emoji).toBe(EMOJI_GROUPS[0].emojis[0]);
    expect(result.style.color).toBe(PALETTES[0].color);
    expect(result.style.backgroundColor).toBe(PALETTES[0].backgroundColor);
  });

  it('switches emoji categories via tabs', () => {
    const onSave = vi.fn();
    const shadow = mountEditor(onSave);
    const tabs = shadow.querySelectorAll<HTMLButtonElement>('.wr-emoji-tab');
    expect(tabs.length).toBe(EMOJI_GROUPS.length);
    tabs[1].click();
    const firstEmoji = shadow.querySelector<HTMLButtonElement>('.wr-emoji')!.textContent;
    expect(firstEmoji).toBe(EMOJI_GROUPS[1].emojis[0]);
  });
});
