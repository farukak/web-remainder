import { FONT_FAMILIES, FONT_SIZES, FONT_WEIGHTS } from '../shared/constants';
import { EMOJI_GROUPS, PALETTES, SHAPES, TEMPLATES } from '../shared/palettes';
import type { ReminderStyle } from '../shared/types';
import type { Point } from './positioning';

interface EditorOptions {
  title: string;
  initialText: string;
  initialStyle: ReminderStyle;
  position: Point;
  showDelete: boolean;
  onSave: (result: { text: string; style: ReminderStyle }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of children) {
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function selectField(
  label: string,
  options: readonly (string | number)[],
  value: string | number,
): { field: HTMLElement; select: HTMLSelectElement } {
  const select = el('select');
  for (const opt of options) {
    const optionEl = el('option', { value: String(opt), textContent: String(opt) });
    if (String(opt) === String(value)) optionEl.selected = true;
    select.append(optionEl);
  }
  const field = el('div', { className: 'wr-field' }, [
    el('label', { textContent: label }),
    select,
  ]);
  return { field, select };
}

function colorField(
  label: string,
  value: string,
): { field: HTMLElement; input: HTMLInputElement } {
  const input = el('input', { type: 'color', value });
  const field = el('div', { className: 'wr-field' }, [
    el('label', { textContent: label }),
    input,
  ]);
  return { field, input };
}

export class ReminderEditor {
  private container: HTMLDivElement;

  constructor(
    private root: ShadowRoot,
    private options: EditorOptions,
  ) {
    this.container = this.build();
    this.root.append(this.container);
    this.clampToViewport();
    const textarea = this.container.querySelector('textarea');
    textarea?.focus();
  }

  /** Ensures the whole editor (including its action buttons) stays within the
   *  viewport after it renders at its natural height. */
  private clampToViewport(): void {
    const rect = this.container.getBoundingClientRect();
    const gap = 12;
    let top = parseFloat(this.container.style.top) || gap;
    let left = parseFloat(this.container.style.left) || gap;
    const maxTop = window.innerHeight - rect.height - gap;
    const maxLeft = window.innerWidth - rect.width - gap;
    top = Math.max(gap, Math.min(top, maxTop));
    left = Math.max(gap, Math.min(left, maxLeft));
    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
  }

  private build(): HTMLDivElement {
    const { initialStyle, initialText, position, title, showDelete } = this.options;

    const textarea = el('textarea', {
      value: initialText,
      placeholder: 'Write your reminder…',
      ariaLabel: 'Reminder text',
    });

    const font = selectField('Font', FONT_FAMILIES, initialStyle.fontFamily);
    const size = selectField('Size', FONT_SIZES, initialStyle.fontSize);
    const weight = selectField('Weight', FONT_WEIGHTS, initialStyle.fontWeight);
    const color = colorField('Text', initialStyle.color);
    const bg = colorField('Background', initialStyle.backgroundColor);
    let currentShape = initialStyle.shape;

    const opacity = el('input', {
      type: 'number',
      min: '0.2',
      max: '1',
      step: '0.1',
      value: String(initialStyle.opacity),
    });
    const opacityField = el('div', { className: 'wr-field' }, [
      el('label', { textContent: 'Opacity' }),
      opacity,
    ]);

    const radius = el('input', {
      type: 'number',
      min: '0',
      max: '24',
      step: '1',
      value: String(initialStyle.borderRadius),
    });
    const radiusField = el('div', { className: 'wr-field' }, [
      el('label', { textContent: 'Radius' }),
      radius,
    ]);

    const applyPreview = () => {
      Object.assign(textarea.style, {
        fontFamily: font.select.value,
        fontSize: `${size.select.value}px`,
        fontWeight: weight.select.value,
        color: color.input.value,
        backgroundColor: bg.input.value,
        borderRadius: `${radius.value}px`,
      });
    };

    for (const control of [font.select, size.select, weight.select]) {
      control.addEventListener('change', applyPreview);
    }
    for (const control of [color.input, bg.input, radius]) {
      control.addEventListener('input', applyPreview);
    }

    // Emoji picker with category tabs.
    const emojiGrid = el('div', { className: 'wr-emoji-strip' });
    const renderEmojis = (groupIndex: number) => {
      emojiGrid.replaceChildren();
      for (const emoji of EMOJI_GROUPS[groupIndex].emojis) {
        const btn = el('button', {
          className: 'wr-emoji',
          type: 'button',
          textContent: emoji,
          title: emoji,
        });
        btn.addEventListener('click', () => this.insertEmoji(textarea, emoji, applyPreview));
        emojiGrid.append(btn);
      }
    };
    const tabs = el('div', { className: 'wr-emoji-tabs' });
    EMOJI_GROUPS.forEach((group, index) => {
      const tab = el('button', {
        className: `wr-emoji-tab${index === 0 ? ' active' : ''}`,
        type: 'button',
        textContent: group.label,
      });
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.wr-emoji-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderEmojis(index);
      });
      tabs.append(tab);
    });
    renderEmojis(0);
    const emojiSection = el('div', { className: 'wr-section' }, [
      el('label', { className: 'wr-section-label', textContent: 'Emoji' }),
      tabs,
      emojiGrid,
    ]);

    // Palette swatches.
    const paletteRow = el('div', { className: 'wr-palette-row' });
    for (const palette of PALETTES) {
      const swatch = el('button', {
        className: 'wr-palette',
        type: 'button',
        title: palette.name,
        textContent: 'Aa',
      });
      swatch.style.backgroundColor = palette.backgroundColor;
      swatch.style.color = palette.color;
      swatch.dataset.name = palette.name;
      swatch.addEventListener('click', () => {
        color.input.value = palette.color;
        bg.input.value = palette.backgroundColor;
        applyPreview();
      });
      paletteRow.append(swatch);
    }
    const paletteSection = el('div', { className: 'wr-section' }, [
      el('label', { className: 'wr-section-label', textContent: 'Palettes' }),
      paletteRow,
    ]);

    // Shape picker.
    const shapeRow = el('div', { className: 'wr-shape-row' });
    const syncShapeButtons = () => {
      shapeRow.querySelectorAll('.wr-shape-btn').forEach((b) => {
        b.classList.toggle('active', (b as HTMLElement).dataset.shape === currentShape);
      });
    };
    for (const shape of SHAPES) {
      const btn = el('button', {
        className: 'wr-shape-btn',
        type: 'button',
        title: shape.label,
        textContent: shape.glyph,
      });
      btn.dataset.shape = shape.id;
      btn.addEventListener('click', () => {
        currentShape = shape.id;
        syncShapeButtons();
      });
      shapeRow.append(btn);
    }
    syncShapeButtons();
    const shapeSection = el('div', { className: 'wr-section' }, [
      el('label', { className: 'wr-section-label', textContent: 'Shape' }),
      shapeRow,
    ]);

    // One-tap templates (shape + palette).
    const templateRow = el('div', { className: 'wr-template-row' });
    for (const tpl of TEMPLATES) {
      const btn = el('button', {
        className: 'wr-template',
        type: 'button',
        title: tpl.name,
        textContent: tpl.name,
      });
      btn.style.backgroundColor = tpl.backgroundColor;
      btn.style.color = tpl.color;
      btn.addEventListener('click', () => {
        currentShape = tpl.shape;
        color.input.value = tpl.color;
        bg.input.value = tpl.backgroundColor;
        syncShapeButtons();
        applyPreview();
      });
      templateRow.append(btn);
    }
    const templateSection = el('div', { className: 'wr-section' }, [
      el('label', { className: 'wr-section-label', textContent: 'Templates' }),
      templateRow,
    ]);

    const controls = el('div', { className: 'wr-controls' }, [
      font.field,
      size.field,
      weight.field,
      opacityField,
      color.field,
      bg.field,
      radiusField,
    ]);

    const saveBtn = el('button', {
      className: 'wr-btn wr-btn-primary',
      textContent: 'Save',
      type: 'button',
    });
    saveBtn.addEventListener('click', () => {
      const style: ReminderStyle = {
        ...initialStyle,
        fontFamily: font.select.value,
        fontSize: Number(size.select.value),
        fontWeight: Number(weight.select.value),
        color: color.input.value,
        backgroundColor: bg.input.value,
        opacity: Number(opacity.value),
        borderRadius: Number(radius.value),
        shape: currentShape,
      };
      this.options.onSave({ text: textarea.value, style });
    });

    const cancelBtn = el('button', {
      className: 'wr-btn wr-btn-ghost',
      textContent: 'Cancel',
      type: 'button',
    });
    cancelBtn.addEventListener('click', () => this.options.onCancel());

    const actions = el('div', { className: 'wr-actions' });
    if (showDelete && this.options.onDelete) {
      const deleteBtn = el('button', {
        className: 'wr-btn wr-btn-danger',
        textContent: 'Delete',
        type: 'button',
      });
      deleteBtn.addEventListener('click', () => this.options.onDelete?.());
      actions.append(deleteBtn);
      actions.style.justifyContent = 'space-between';
      const rightGroup = el('div', {}, [cancelBtn, saveBtn]);
      rightGroup.style.display = 'flex';
      rightGroup.style.gap = '8px';
      actions.append(rightGroup);
    } else {
      actions.append(cancelBtn, saveBtn);
    }

    const container = el(
      'div',
      { className: 'wr-editor wr-surface', role: 'dialog', ariaLabel: title },
      [
        el('h2', { textContent: title }),
        textarea,
        emojiSection,
        paletteSection,
        shapeSection,
        templateSection,
        controls,
        actions,
      ],
    );
    container.style.left = `${position.left}px`;
    container.style.top = `${position.top}px`;

    container.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.options.onCancel();
      }
    });

    applyPreview();
    return container;
  }

  private insertEmoji(
    textarea: HTMLTextAreaElement,
    emoji: string,
    afterInsert: () => void,
  ): void {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0, start) + emoji + textarea.value.slice(end);
    const caret = start + emoji.length;
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
    afterInsert();
  }

  destroy(): void {
    this.container.remove();
  }
}
