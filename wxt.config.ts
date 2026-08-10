import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    // MV3 extension pages don't benefit from module preload hints, and the
    // injected <link rel="modulepreload" crossorigin> triggers cross-world
    // resource-mismatch warnings in Chrome. Disable the injection.
    build: { modulePreload: false },
  }),
  manifest: {
    name: 'Web Remainder',
    description:
      'Add persistent reminders and annotations to any webpage. Local-only, no account, no tracking.',
    permissions: ['storage', 'activeTab', 'contextMenus'],
    action: {
      default_title: 'Web Remainder',
    },
    commands: {
      'add-reminder': {
        suggested_key: { default: 'Alt+Shift+R' },
        description: 'Start adding a reminder on the current page',
      },
    },
    icons: {
      16: '/icons/16.png',
      32: '/icons/32.png',
      48: '/icons/48.png',
      128: '/icons/128.png',
    },
  },
});
