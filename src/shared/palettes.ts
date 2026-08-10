export interface Palette {
  name: string;
  color: string;
  backgroundColor: string;
}

/** Cute, readable text/background presets across a range of moods. */
export const PALETTES: Palette[] = [
  { name: 'Sunset', color: '#7c2d12', backgroundColor: '#ffedd5' },
  { name: 'Peach', color: '#9f1239', backgroundColor: '#ffe4e6' },
  { name: 'Mint', color: '#14532d', backgroundColor: '#dcfce7' },
  { name: 'Sky', color: '#0c4a6e', backgroundColor: '#e0f2fe' },
  { name: 'Lavender', color: '#4c1d95', backgroundColor: '#ede9fe' },
  { name: 'Rose', color: '#831843', backgroundColor: '#fce7f3' },
  { name: 'Lemon', color: '#713f12', backgroundColor: '#fef9c3' },
  { name: 'Sand', color: '#292524', backgroundColor: '#f5f5f4' },
  { name: 'Ocean', color: '#e0f2fe', backgroundColor: '#0c4a6e' },
  { name: 'Forest', color: '#dcfce7', backgroundColor: '#14532d' },
  { name: 'Grape', color: '#ede9fe', backgroundColor: '#4c1d95' },
  { name: 'Midnight', color: '#e2e8f0', backgroundColor: '#1e293b' },
];

export interface EmojiGroup {
  label: string;
  emojis: string[];
}

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    label: 'Tasks',
    emojis: [
      '📌', '📎', '✅', '☑️', '⚠️', '❗', '❓', '🔥', '💡', '📅', '🕒', '⏰',
      '🚀', '🐛', '🔧', '📝', '✏️', '📖', '🔗', '💰', '📈', '📉',
    ],
  },
  {
    label: 'Faces',
    emojis: [
      '😀', '😉', '😍', '🤔', '😅', '😴', '🤯', '🥳', '😎', '🙌', '👍', '👎',
      '🙏', '💪', '👀', '🫡',
    ],
  },
  {
    label: 'Hearts',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '⭐', '✨', '🌟', '💥', '✔️',
      '✖️', '➡️', '⬅️', '🔁',
    ],
  },
  {
    label: 'Life',
    emojis: [
      '🌸', '🌿', '🍀', '🌈', '☀️', '🌙', '☕', '🍎', '🍕', '🎉', '🎯', '🏆',
      '🎁', '🐱', '🐶', '🌊',
    ],
  },
];
