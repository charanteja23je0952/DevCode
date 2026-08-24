// Shared UI icons/symbols.
// Keep these in one place so the UI stays consistent and can
// later be replaced with a proper icon library.

export const EMOJIS = {
  FOLDER_CLOSED: '▸',
  FOLDER_OPEN: '▾',
  FILE: '•',

  JAVASCRIPT: 'JS',
  TYPESCRIPT: 'TS',
  REACT: '⚛︎',
  JSON: '{}',
  CSS: '#',
  HTML: '<>',
  MARKDOWN: 'M',
  ENV: '⚙',

  PENDING: '⚪',
  IN_PROGRESS: '🔄',
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',

  BACK: '‹',
  FORWARD: '›',
  CHEVRON_RIGHT: '›',
  CHEVRON_DOWN: '⌄',
  CLOSE: '×',

  REFRESH: '↻',
  SEARCH: '⌕',
  SETTINGS: '⚙',
  MORE: '⋯',
  ADD: '+',
  REMOVE: '−',
  EXPAND: '⛶',
  COLLAPSE: '⊟',

  TERMINAL: '⌘',
  RUN: '▶',
  STOP: '■',
  SAVE: '↓',
  COPY: '⧉',
  EDIT: '✎',
  DELETE: '⌫',
  VIEW: '◉',

  PREVIEW: '▣',
  OPEN_EXTERNAL: '↗',

  TEST: '✓',
  SUBMIT: '↑',
  PASSED: '✅',
  FAILED: '❌',

  CHECKMARK: '✅',
  CROSS: '❌',
  BULLET: '•',
};

// Status icon mapping helper
export const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return EMOJIS.PENDING;

    case 'in-progress':
      return EMOJIS.IN_PROGRESS;

    case 'success':
      return EMOJIS.SUCCESS;

    case 'error':
      return EMOJIS.ERROR;

    default:
      return EMOJIS.PENDING;
  }
};