import { debounce } from '../shared/utils';

export interface PageWatcherCallbacks {
  onUrlChange: (url: string) => void;
  onDomChange: () => void;
}

/** Watches for SPA navigations (pushState/replaceState/popstate) and DOM
 *  mutations, coalescing both into debounced callbacks to keep CPU low. */
export function startPageWatcher(callbacks: PageWatcherCallbacks): () => void {
  let currentUrl = location.href;

  const checkUrl = () => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      callbacks.onUrlChange(currentUrl);
    }
  };

  const onDom = debounce(() => {
    checkUrl();
    callbacks.onDomChange();
  }, 400);

  const observer = new MutationObserver(onDom);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const originalPush = history.pushState.bind(history);
  const originalReplace = history.replaceState.bind(history);

  history.pushState = function patchedPush(...args) {
    originalPush(...(args as Parameters<typeof history.pushState>));
    checkUrl();
  };
  history.replaceState = function patchedReplace(...args) {
    originalReplace(...(args as Parameters<typeof history.replaceState>));
    checkUrl();
  };

  window.addEventListener('popstate', checkUrl);

  return () => {
    observer.disconnect();
    history.pushState = originalPush;
    history.replaceState = originalReplace;
    window.removeEventListener('popstate', checkUrl);
  };
}
