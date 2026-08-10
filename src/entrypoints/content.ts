import { defineContentScript } from 'wxt/sandbox';
import { AnnotationManager } from '../content/annotation-manager';
import { startPageWatcher } from '../content/mutation-observer';
import type { Message, PingResponse } from '../shared/messages';
import { subscribe } from '../shared/storage';
import { isContextValid, isSupportedUrl, pageIdentityFromUrl } from '../shared/utils';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_end',
  main() {
    if (!isSupportedUrl(location.href)) return;

    const manager = new AnnotationManager(pageIdentityFromUrl(location.href));
    void manager.init();

    let stopWatcher = () => {};
    let unsubscribe = () => {};
    let torndown = false;

    // Once the extension is reloaded/updated this stale content script loses its
    // connection ("Extension context invalidated"). Shut everything down so it
    // stops running and stops throwing on every navigation/DOM change.
    const teardown = () => {
      if (torndown) return;
      torndown = true;
      try {
        stopWatcher();
        unsubscribe();
        manager.destroy();
      } catch {
        // context already gone; nothing more to clean up
      }
    };

    const guard = (fn: () => void) => {
      if (!isContextValid()) {
        teardown();
        return;
      }
      fn();
    };

    stopWatcher = startPageWatcher({
      onUrlChange: (url) => guard(() => void manager.reload(pageIdentityFromUrl(url))),
      onDomChange: () =>
        guard(() => {
          manager.reposition();
          manager.retryUnresolved();
        }),
    });

    unsubscribe = subscribe(() =>
      guard(() => void manager.reload(pageIdentityFromUrl(location.href))),
    );

    chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
      switch (message.type) {
        case 'START_ADD_MODE':
          manager.startAddMode();
          return false;
        case 'ADD_FROM_SELECTION':
          manager.addFromCurrentSelection(message.payload.text);
          return false;
        case 'FOCUS_REMINDER':
          manager.focusReminder(message.payload.id);
          return false;
        case 'RECENTER_REMINDER':
          void manager.recenterReminder(message.payload.id);
          return false;
        case 'PING':
          sendResponse({
            ok: true,
            page: pageIdentityFromUrl(location.href),
            count: manager.pageCount,
          } satisfies PingResponse);
          return true;
        default:
          return false;
      }
    });

    window.addEventListener('pagehide', teardown);
  },
});
