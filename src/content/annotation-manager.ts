import {
  buildAnchorFromRange,
  resolveAnchor,
  type ResolvedAnchor,
} from './anchor-resolver';
import { ReminderEditor } from './editor';
import { computePosition } from './positioning';
import { SelectionManager, type PickResult } from './selection-manager';
import { SHADOW_STYLES } from './styles';
import { ROOT_ID } from '../shared/constants';
import {
  createReminder,
  deleteReminder,
  getPageReminders,
  getSettings,
  updateReminder,
} from '../shared/storage';
import type { PageIdentity, Reminder, Settings } from '../shared/types';
import { generateId, log, now, throttle } from '../shared/utils';

interface Rendered {
  reminder: Reminder;
  node: HTMLDivElement;
  textEl: HTMLSpanElement;
  resolution: ResolvedAnchor;
}

const DRAG_THRESHOLD = 4;
const LOW_CONFIDENCE = 0.6;

export class AnnotationManager {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private overlay: HTMLDivElement;
  private selection: SelectionManager;
  private editor: ReminderEditor | null = null;
  private rendered = new Map<string, Rendered>();
  private page: PageIdentity;
  private settings!: Settings;

  constructor(page: PageIdentity) {
    this.page = page;
    this.host = document.createElement('div');
    this.host.id = ROOT_ID;
    this.shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = SHADOW_STYLES;
    this.shadow.append(style);

    this.overlay = document.createElement('div');
    this.overlay.className = 'wr-overlay';
    this.shadow.append(this.overlay);

    document.documentElement.append(this.host);
    this.selection = new SelectionManager(this.shadow, this.overlay);
  }

  async init(): Promise<void> {
    this.settings = await getSettings();
    if (!this.settings.extensionEnabled || !this.settings.showRemindersAutomatically) {
      return;
    }
    await this.renderPage();
    window.addEventListener('scroll', this.reposition, true);
    window.addEventListener('resize', this.reposition);
  }

  get pageCount(): number {
    return this.rendered.size;
  }

  private async renderPage(): Promise<void> {
    const reminders = await getPageReminders(this.page);
    for (const reminder of reminders) {
      if (reminder.enabled) this.renderReminder(reminder);
    }
    log.info(`Rendered ${this.rendered.size} reminder(s)`);
  }

  private applyStyle(rendered: Rendered): void {
    const { node, reminder } = rendered;
    const s = reminder.style;
    Object.assign(node.style, {
      fontFamily: s.fontFamily,
      fontSize: `${s.fontSize}px`,
      fontWeight: String(s.fontWeight),
      color: s.color,
      backgroundColor: s.backgroundColor,
      opacity: String(s.opacity),
      borderRadius: `${s.borderRadius}px`,
      padding: `${s.padding}px`,
      width: s.width ? `${s.width}px` : '',
    });
  }

  private renderReminder(reminder: Reminder): void {
    this.removeNode(reminder.id);

    const node = document.createElement('div');
    node.className = 'wr-reminder';
    node.setAttribute('role', 'note');

    const textEl = document.createElement('span');
    textEl.className = 'wr-reminder-text';
    textEl.textContent = reminder.text;

    const menuBtn = document.createElement('button');
    menuBtn.className = 'wr-menu-btn';
    menuBtn.type = 'button';
    menuBtn.textContent = '⋮';
    menuBtn.setAttribute('aria-label', 'Reminder options');

    node.append(textEl, menuBtn);
    this.overlay.append(node);

    const resolution = resolveAnchor(reminder.anchor);
    const rendered: Rendered = { reminder, node, textEl, resolution };
    this.rendered.set(reminder.id, rendered);
    this.applyStyle(rendered);

    if (resolution.confidence > 0 && resolution.confidence < LOW_CONFIDENCE) {
      node.classList.add('wr-low-confidence');
      node.title = "We couldn't confidently locate this reminder.";
    }

    menuBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.openMenu(rendered, menuBtn);
    });
    this.attachDrag(rendered);
    this.positionOne(rendered);
  }

  private currentRect(rendered: Rendered): DOMRect | null {
    const { resolution } = rendered;
    if (resolution.range) {
      const r = resolution.range.getBoundingClientRect();
      return r.width || r.height ? r : null;
    }
    if (resolution.element?.isConnected) {
      return resolution.element.getBoundingClientRect();
    }
    return null;
  }

  private positionOne(rendered: Rendered): void {
    const rect = this.currentRect(rendered);
    if (!rect) {
      rendered.node.style.display = 'none';
      return;
    }
    rendered.node.style.display = '';
    const size = {
      width: rendered.node.offsetWidth || 120,
      height: rendered.node.offsetHeight || 40,
    };
    const point = computePosition(rect, size, {
      x: rendered.reminder.offsetX,
      y: rendered.reminder.offsetY,
    });
    rendered.node.style.left = `${point.left}px`;
    rendered.node.style.top = `${point.top}px`;
  }

  reposition = throttle(() => {
    for (const rendered of this.rendered.values()) this.positionOne(rendered);
  }, 50);

  /** Re-resolves anchors that could not be located yet (e.g. late-loading
   *  SPA content). Cheap: only touches currently-lost reminders. */
  retryUnresolved = throttle(() => {
    for (const rendered of this.rendered.values()) {
      if (!this.currentRect(rendered)) {
        rendered.resolution = resolveAnchor(rendered.reminder.anchor);
        this.positionOne(rendered);
      }
    }
  }, 400);

  startAddMode(prefillText = ''): void {
    if (this.editor) this.closeEditor();
    this.selection.start(
      (pick) => this.openEditorForCreate(pick, prefillText),
      () => {},
    );
  }

  /** Context-menu entry: annotate the current selection directly, prefilling
   *  the editor with the selected text. Falls back to pick mode if the
   *  selection was lost. */
  addFromCurrentSelection(prefillText: string): void {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const anchor = buildAnchorFromRange(range);
      this.openEditorForCreate({ anchor, rect, text: '' }, prefillText);
      return;
    }
    this.startAddMode(prefillText);
  }

  private editorPosition(rect: DOMRect) {
    return computePosition(rect, { width: 320, height: 320 });
  }

  private openEditorForCreate(pick: PickResult, prefillText: string): void {
    this.editor = new ReminderEditor(this.shadow, {
      title: 'New reminder',
      initialText: prefillText,
      initialStyle: this.settings.defaultStyle,
      position: this.editorPosition(pick.rect),
      showDelete: false,
      onCancel: () => this.closeEditor(),
      onSave: async ({ text, style }) => {
        if (!text.trim()) {
          this.closeEditor();
          return;
        }
        const reminder: Reminder = {
          id: generateId(),
          text,
          page: this.page,
          matchMode: this.settings.defaultMatchMode,
          anchor: pick.anchor,
          style,
          positionMode: 'anchored',
          createdAt: now(),
          updatedAt: now(),
          enabled: true,
        };
        try {
          await createReminder(reminder);
          this.closeEditor();
          this.renderReminder(reminder);
        } catch (error) {
          log.error('Failed to create reminder', error);
          this.closeEditor();
        }
      },
    });
  }

  private openEditorForEdit(rendered: Rendered): void {
    if (this.editor) this.closeEditor();
    const rect = this.currentRect(rendered) ?? rendered.node.getBoundingClientRect();
    this.editor = new ReminderEditor(this.shadow, {
      title: 'Edit reminder',
      initialText: rendered.reminder.text,
      initialStyle: rendered.reminder.style,
      position: this.editorPosition(rect),
      showDelete: true,
      onCancel: () => this.closeEditor(),
      onDelete: () => {
        this.closeEditor();
        void this.deleteReminder(rendered.reminder.id);
      },
      onSave: async ({ text, style }) => {
        try {
          const updated = await updateReminder(rendered.reminder.id, { text, style });
          this.closeEditor();
          if (updated) this.renderReminder(updated);
        } catch (error) {
          log.error('Failed to update reminder', error);
          this.closeEditor();
        }
      },
    });
  }

  private closeEditor(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  private openMenu(rendered: Rendered, anchorBtn: HTMLElement): void {
    const existing = this.overlay.querySelector('.wr-menu');
    existing?.remove();

    const menu = document.createElement('div');
    menu.className = 'wr-menu wr-surface';
    Object.assign(menu.style, {
      position: 'fixed',
      pointerEvents: 'auto',
      padding: '4px',
      minWidth: '120px',
      zIndex: '2147483002',
    });

    const rect = anchorBtn.getBoundingClientRect();
    menu.style.left = `${Math.min(rect.left, window.innerWidth - 140)}px`;
    menu.style.top = `${rect.bottom + 4}px`;

    const addItem = (label: string, handler: () => void) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'wr-btn wr-btn-ghost';
      item.textContent = label;
      Object.assign(item.style, {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        padding: '6px 8px',
      });
      item.addEventListener('click', () => {
        menu.remove();
        handler();
      });
      menu.append(item);
    };

    addItem('Edit', () => this.openEditorForEdit(rendered));
    addItem('Disable', () => void this.disableReminder(rendered.reminder.id));
    addItem('Delete', () => void this.deleteReminder(rendered.reminder.id));

    this.overlay.append(menu);
    const closeMenu = (event: MouseEvent) => {
      if (!menu.contains(event.target as Node)) {
        menu.remove();
        document.removeEventListener('mousedown', closeMenu, true);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeMenu, true), 0);
  }

  private attachDrag(rendered: Rendered): void {
    const { node } = rendered;
    node.addEventListener('mousedown', (event) => {
      if ((event.target as HTMLElement).closest('.wr-menu-btn')) return;
      event.preventDefault();

      const startX = event.clientX;
      const startY = event.clientY;
      const startRect = node.getBoundingClientRect();
      let moved = false;

      const onMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
          moved = true;
          node.classList.add('wr-dragging');
        }
        if (moved) {
          node.style.left = `${startRect.left + dx}px`;
          node.style.top = `${startRect.top + dy}px`;
        }
      };

      const onUp = async () => {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup', onUp, true);
        node.classList.remove('wr-dragging');

        if (!moved) {
          this.openEditorForEdit(rendered);
          return;
        }
        const anchorRect = this.currentRect(rendered);
        if (!anchorRect) return;
        const base = computePosition(anchorRect, {
          width: node.offsetWidth,
          height: node.offsetHeight,
        });
        const finalLeft = parseFloat(node.style.left);
        const finalTop = parseFloat(node.style.top);
        const offsetX = Math.round(finalLeft - base.left);
        const offsetY = Math.round(finalTop - base.top);
        try {
          const updated = await updateReminder(rendered.reminder.id, {
            positionMode: 'offset',
            offsetX,
            offsetY,
          });
          if (updated) rendered.reminder = updated;
        } catch (error) {
          log.error('Failed to persist drag offset', error);
        }
      };

      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup', onUp, true);
    });
  }

  private async disableReminder(id: string): Promise<void> {
    try {
      await updateReminder(id, { enabled: false });
      this.removeNode(id);
    } catch (error) {
      log.error('Failed to disable reminder', error);
    }
  }

  private async deleteReminder(id: string): Promise<void> {
    if (this.settings.confirmBeforeDelete && !window.confirm('Delete this reminder?')) {
      return;
    }
    try {
      await deleteReminder(id);
      this.removeNode(id);
    } catch (error) {
      log.error('Failed to delete reminder', error);
    }
  }

  private removeNode(id: string): void {
    const existing = this.rendered.get(id);
    if (existing) {
      existing.node.remove();
      this.rendered.delete(id);
    }
  }

  focusReminder(id: string): void {
    const rendered = this.rendered.get(id);
    if (!rendered) return;
    const target =
      rendered.resolution.range?.startContainer.parentElement ??
      rendered.resolution.element;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      this.positionOne(rendered);
      rendered.node.classList.add('wr-focus');
      setTimeout(() => rendered.node.classList.remove('wr-focus'), 1900);
    }, 300);
  }

  async reload(page: PageIdentity): Promise<void> {
    this.page = page;
    this.closeEditor();
    for (const id of Array.from(this.rendered.keys())) this.removeNode(id);
    this.settings = await getSettings();
    if (this.settings.extensionEnabled && this.settings.showRemindersAutomatically) {
      await this.renderPage();
    }
  }

  destroy(): void {
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
    this.selection.stop();
    this.closeEditor();
    this.host.remove();
  }
}
