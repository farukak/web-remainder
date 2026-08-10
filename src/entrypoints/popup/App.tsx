import { useEffect, useState } from 'react';
import { sendToActiveTab } from '../../shared/messages';
import { deleteReminder, getPageReminders } from '../../shared/storage';
import type { PageIdentity, Reminder } from '../../shared/types';
import { isSupportedUrl, pageIdentityFromUrl, relativeTime } from '../../shared/utils';

function CenterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="6.5" />
      <line x1="12" y1="1.5" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22.5" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
    </svg>
  );
}

export function App() {
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(true);
  const [page, setPage] = useState<PageIdentity | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url || !isSupportedUrl(tab.url)) {
        setSupported(false);
        setLoading(false);
        return;
      }
      const identity = pageIdentityFromUrl(tab.url);
      setPage(identity);
      setReminders(await getPageReminders(identity));
      setLoading(false);
    })();
  }, []);

  const addReminder = async () => {
    await sendToActiveTab({ type: 'START_ADD_MODE' });
    window.close();
  };

  const focus = async (id: string) => {
    await sendToActiveTab({ type: 'FOCUS_REMINDER', payload: { id } });
    window.close();
  };

  const recenter = async (id: string) => {
    await sendToActiveTab({ type: 'RECENTER_REMINDER', payload: { id } });
    window.close();
  };

  const remove = async (id: string) => {
    await deleteReminder(id);
    if (page) setReminders(await getPageReminders(page));
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    window.close();
  };

  const openSettings = () => {
    chrome.runtime.openOptionsPage();
    window.close();
  };

  return (
    <div className="popup">
      <header className="popup-header">
        <span className="logo-dot" aria-hidden="true" />
        <h1>Web Remainder</h1>
      </header>

      {!supported ? (
        <p className="empty">Web Remainder isn&apos;t available on this page.</p>
      ) : loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <>
          <div className="page-row">
            <span className="host">{page?.hostname}</span>
            <span className="count">
              {reminders.length} reminder{reminders.length === 1 ? '' : 's'} on this page
            </span>
          </div>

          <button className="btn primary block" onClick={addReminder}>
            + Add Reminder
          </button>

          {reminders.length > 0 && (
            <ul className="list">
              {reminders.map((r) => (
                <li key={r.id} className="list-row">
                  <button className="list-item" onClick={() => focus(r.id)}>
                    <span className="list-text">{r.text || '(empty)'}</span>
                    <span className="list-time">{relativeTime(r.updatedAt)}</span>
                  </button>
                  <div className="list-actions">
                    <button
                      className="icon-btn"
                      title="Bring to center"
                      aria-label="Bring to center"
                      onClick={() => recenter(r.id)}
                    >
                      <CenterIcon />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => remove(r.id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <footer className="popup-footer">
        <button className="link" onClick={openDashboard}>
          Open Dashboard
        </button>
        <button className="link" onClick={openSettings}>
          Settings
        </button>
      </footer>
    </div>
  );
}
