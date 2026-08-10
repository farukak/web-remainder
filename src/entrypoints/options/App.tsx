import { useRef, useState } from 'react';
import { useSettings } from '../../components/hooks';
import { parseBackup } from '../../shared/backup';
import { FONT_FAMILIES, FONT_SIZES, FONT_WEIGHTS } from '../../shared/constants';
import { clearAll, exportData, importData } from '../../shared/storage';
import { PALETTES } from '../../shared/palettes';
import type { MatchMode, ReminderStyle } from '../../shared/types';

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export function App() {
  const { settings, save } = useSettings();
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [replaceOnImport, setReplaceOnImport] = useState(false);

  if (!settings) return <div className="options">Loading…</div>;

  const setStyle = (patch: Partial<ReminderStyle>) =>
    save({ defaultStyle: { ...settings.defaultStyle, ...patch } });

  const doExport = async () => {
    const backup = await exportData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'web-remainder-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    try {
      const text = await file.text();
      const backup = parseBackup(text);
      const count = await importData(backup, replaceOnImport ? 'replace' : 'merge');
      setStatus(`Imported ${count} reminder${count === 1 ? '' : 's'}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const doClear = async () => {
    if (window.confirm('Delete ALL reminders and reset settings? This cannot be undone.')) {
      await clearAll();
      setStatus('All data cleared.');
    }
  };

  const s = settings.defaultStyle;

  return (
    <div className="options">
      <header>
        <span className="logo-dot" aria-hidden="true" />
        <h1>Web Remainder Settings</h1>
      </header>

      <section>
        <h2>General</h2>
        <Toggle
          label="Enable Web Remainder"
          checked={settings.extensionEnabled}
          onChange={(v) => save({ extensionEnabled: v })}
        />
        <Toggle
          label="Show reminders automatically"
          checked={settings.showRemindersAutomatically}
          onChange={(v) => save({ showRemindersAutomatically: v })}
        />
        <Toggle
          label="Highlight reminder when page loads"
          checked={settings.highlightOnLoad}
          onChange={(v) => save({ highlightOnLoad: v })}
        />
      </section>

      <section>
        <h2>Default matching</h2>
        <div className="radios">
          {(['exact', 'path', 'domain'] as MatchMode[]).map((mode) => (
            <label key={mode} className="radio">
              <input
                type="radio"
                name="matchMode"
                checked={settings.defaultMatchMode === mode}
                onChange={() => save({ defaultMatchMode: mode })}
              />
              <span>{mode[0].toUpperCase() + mode.slice(1)}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2>Default style</h2>
        <div className="style-grid">
          <label>
            Font
            <select
              value={s.fontFamily}
              onChange={(e) => setStyle({ fontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Size
            <select
              value={s.fontSize}
              onChange={(e) => setStyle({ fontSize: Number(e.target.value) })}
            >
              {FONT_SIZES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Weight
            <select
              value={s.fontWeight}
              onChange={(e) => setStyle({ fontWeight: Number(e.target.value) })}
            >
              {FONT_WEIGHTS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Text color
            <input
              type="color"
              value={s.color}
              onChange={(e) => setStyle({ color: e.target.value })}
            />
          </label>
          <label>
            Background
            <input
              type="color"
              value={s.backgroundColor}
              onChange={(e) => setStyle({ backgroundColor: e.target.value })}
            />
          </label>
        </div>
        <div className="palette-row">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              className="palette-swatch"
              title={p.name}
              style={{ backgroundColor: p.backgroundColor, color: p.color }}
              onClick={() => setStyle({ color: p.color, backgroundColor: p.backgroundColor })}
            >
              Aa
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Behavior</h2>
        <Toggle
          label="Confirm before delete"
          checked={settings.confirmBeforeDelete}
          onChange={(v) => save({ confirmBeforeDelete: v })}
        />
        <Toggle
          label="Enable context menu"
          checked={settings.contextMenuEnabled}
          onChange={(v) => save({ contextMenuEnabled: v })}
        />
      </section>

      <section>
        <h2>Keyboard shortcut</h2>
        <p className="muted">
          Default: <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>. Change it at{' '}
          <button
            className="link inline"
            onClick={() =>
              chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
            }
          >
            chrome://extensions/shortcuts
          </button>
          .
        </p>
      </section>

      <section>
        <h2>Data</h2>
        <div className="data-actions">
          <button className="btn" onClick={doExport}>
            Export data
          </button>
          <button className="btn" onClick={() => fileInput.current?.click()}>
            Import data
          </button>
          <button className="btn danger" onClick={doClear}>
            Clear all data
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void doImport(file);
            }}
          />
        </div>
        <label className="toggle small">
          <input
            type="checkbox"
            checked={replaceOnImport}
            onChange={(e) => setReplaceOnImport(e.target.checked)}
          />
          <span>Replace existing data on import (instead of merging)</span>
        </label>
        {status && <p className="status">{status}</p>}
      </section>

      <footer className="credit">
        Web Remainder · Created by Faruk AK ·{' '}
        <a href="https://github.com/farukak/web-remainder" target="_blank" rel="noreferrer">
          github.com/farukak/web-remainder
        </a>
      </footer>
    </div>
  );
}
