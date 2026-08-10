import { useEffect, useState } from 'react';
import { sendToActiveTab } from '../../shared/messages';
import { getPageReminders } from '../../shared/storage';
import type { PageIdentity, Reminder } from '../../shared/types';
import { isSupportedUrl, pageIdentityFromUrl, relativeTime } from '../../shared/utils';

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
                <li key={r.id}>
                  <button className="list-item" onClick={() => focus(r.id)}>
                    <span className="list-text">{r.text || '(empty)'}</span>
                    <span className="list-time">{relativeTime(r.updatedAt)}</span>
                  </button>
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
