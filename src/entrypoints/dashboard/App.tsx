import { useMemo, useState } from 'react';
import { useReminders } from '../../components/hooks';
import {
  deleteReminder,
  toggleReminder,
  updateReminder,
} from '../../shared/storage';
import type { Reminder } from '../../shared/types';
import { relativeTime } from '../../shared/utils';

type StatusFilter = 'all' | 'active' | 'disabled';
type SortMode = 'newest' | 'oldest' | 'website';

function openPage(reminder: Reminder) {
  chrome.tabs.create({ url: reminder.page.url }, (tab) => {
    const tabId = tab.id;
    if (!tabId) return;
    const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(() => {
          chrome.tabs
            .sendMessage(tabId, { type: 'FOCUS_REMINDER', payload: { id: reminder.id } })
            .catch(() => {});
        }, 600);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

function ReminderCard({ reminder }: { reminder: Reminder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reminder.text);

  const save = async () => {
    await updateReminder(reminder.id, { text: draft });
    setEditing(false);
  };

  const remove = async () => {
    if (window.confirm('Delete this reminder?')) await deleteReminder(reminder.id);
  };

  return (
    <article className={`card ${reminder.enabled ? '' : 'is-disabled'}`}>
      {editing ? (
        <div className="card-edit">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
          <div className="card-actions">
            <button className="btn primary" onClick={save}>
              Save
            </button>
            <button
              className="btn"
              onClick={() => {
                setDraft(reminder.text);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="card-text">{reminder.text || '(empty)'}</p>
          <a
            className="card-url"
            href={reminder.page.url}
            title={reminder.page.url}
            onClick={(e) => {
              e.preventDefault();
              openPage(reminder);
            }}
          >
            {reminder.page.hostname}
            {reminder.page.pathname}
          </a>
          <div className="card-meta">
            <span>Created {new Date(reminder.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span>Updated {relativeTime(reminder.updatedAt)}</span>
          </div>
          <div className="card-actions">
            <button className="btn" onClick={() => openPage(reminder)}>
              Open page →
            </button>
            <button className="btn" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn" onClick={() => toggleReminder(reminder.id)}>
              {reminder.enabled ? 'Disable' : 'Enable'}
            </button>
            <button className="btn danger" onClick={remove}>
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export function App() {
  const { reminders, loading } = useReminders();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [site, setSite] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('newest');

  const sites = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reminders) {
      counts.set(r.page.hostname, (counts.get(r.page.hostname) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [reminders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = reminders.filter((r) => {
      if (status === 'active' && !r.enabled) return false;
      if (status === 'disabled' && r.enabled) return false;
      if (site && r.page.hostname !== site) return false;
      if (q && !r.text.toLowerCase().includes(q) && !r.page.url.toLowerCase().includes(q))
        return false;
      return true;
    });
    result.sort((a, b) => {
      if (sort === 'newest') return b.createdAt - a.createdAt;
      if (sort === 'oldest') return a.createdAt - b.createdAt;
      return a.page.hostname.localeCompare(b.page.hostname);
    });
    return result;
  }, [reminders, query, status, site, sort]);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo-dot" aria-hidden="true" />
          <strong>Web Remainder</strong>
        </div>

        <nav className="filters" aria-label="Status filter">
          {(['all', 'active', 'disabled'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              className={`filter ${status === s ? 'active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </nav>

        <h3 className="sidebar-title">Websites</h3>
        <ul className="site-list">
          <li>
            <button
              className={`site ${site === null ? 'active' : ''}`}
              onClick={() => setSite(null)}
            >
              All websites <span className="badge">{reminders.length}</span>
            </button>
          </li>
          {sites.map(([host, count]) => (
            <li key={host}>
              <button
                className={`site ${site === host ? 'active' : ''}`}
                onClick={() => setSite(host)}
              >
                {host} <span className="badge">{count}</span>
              </button>
            </li>
          ))}
        </ul>

        <button className="link" onClick={() => chrome.runtime.openOptionsPage()}>
          Settings
        </button>
      </aside>

      <main className="content">
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search reminders…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="sort">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="website">Website</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="empty">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="empty">
            No reminders yet. Open any web page, select text or an element, and add your
            first reminder.
          </p>
        ) : (
          <div className="cards">
            {filtered.map((r) => (
              <ReminderCard key={r.id} reminder={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
