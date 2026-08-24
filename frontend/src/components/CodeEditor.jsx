import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { EMOJIS } from '../constants/emojis';

const vscodeDarkTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontSize: '13px',
      lineHeight: '20px',
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', 'Monaco', monospace",
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
    },

    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', 'Monaco', monospace",
      fontVariantLigatures: 'contextual',
    },

    '.cm-content': {
      padding: '4px 0',
      caretColor: '#aeafad',
    },

    '.cm-line': {
      padding: '0 4px 0 8px',
    },

    '.cm-gutters': {
      backgroundColor: '#1e1e1e',
      color: '#858585',
      border: 'none',
      paddingRight: '8px',
    },

    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px 0 4px',
      minWidth: '2.5ch',
    },

    '.cm-activeLineGutter': {
      backgroundColor: '#2c2c2c',
      color: '#c6c6c6',
    },

    '.cm-foldGutter .cm-gutterElement': {
      cursor: 'pointer',
      color: '#6e7681',
    },

    '.cm-foldPlaceholder': {
      backgroundColor: '#3a3d41',
      border: 'none',
      color: '#d4d4d4',
      borderRadius: '3px',
      padding: '0 4px',
      margin: '0 2px',
    },

    '.cm-activeLine': { backgroundColor: '#2c2c2c' },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#aeafad',
      borderLeftWidth: '2px',
    },

    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: '#264f78 !important',
    },

    '&.cm-focused': { outline: 'none' },

    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      backgroundColor: '#3a3d41',
      color: '#ffd700 !important',
      outline: '1px solid #888',
    },

    '.cm-searchMatch': {
      backgroundColor: 'rgba(234, 92, 0, 0.33)',
      outline: '1px solid rgba(234, 157, 0, 0.5)',
    },

    '.cm-searchMatch-selected': {
      backgroundColor: 'rgba(234, 92, 0, 0.55)',
    },

    '.cm-selectionMatch': {
      backgroundColor: 'rgba(58, 122, 175, 0.3)',
    },

    '.cm-tooltip': {
      backgroundColor: '#252526',
      border: '1px solid #454545',
      color: '#d4d4d4',
    },

    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: '#04395e',
      color: '#ffffff',
    },

    '.cm-panels': {
      backgroundColor: '#252526',
      color: '#cccccc',
    },

    '.cm-panels.cm-panels-top': { borderBottom: '1px solid #454545' },

    '.cm-panel input, .cm-panel button': {
      backgroundColor: '#3c3c3c',
      color: '#cccccc',
      border: '1px solid #6b6b6b',
    },

    '.cm-scroller::-webkit-scrollbar': { width: '12px', height: '12px' },
    '.cm-scroller::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(121,121,121,0.4)',
      borderRadius: '6px',
      border: '3px solid transparent',
      backgroundClip: 'padding-box',
    },

    '.cm-scroller::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(121,121,121,0.7)',
      backgroundClip: 'padding-box',
    },
  },
  { dark: true }
);

const vscodeHighlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.modifier], color: '#569cd6' },
  { tag: [t.bool, t.null], color: '#569cd6' },
  { tag: t.self, color: '#569cd6' },

  { tag: [t.variableName], color: '#9cdcfe' },
  { tag: t.propertyName, color: '#9cdcfe' },
  { tag: t.definition(t.variableName), color: '#9cdcfe' },
  { tag: t.definition(t.propertyName), color: '#9cdcfe' },

  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#dcdcaa' },
  { tag: t.definition(t.function(t.variableName)), color: '#dcdcaa' },

  { tag: [t.className, t.typeName, t.namespace], color: '#4ec9b0' },
  { tag: t.standard(t.typeName), color: '#4ec9b0' },

  { tag: [t.string, t.special(t.string)], color: '#ce9178' },
  { tag: t.regexp, color: '#d16969' },
  { tag: t.escape, color: '#d7ba7d' },

  { tag: t.number, color: '#b5cea8' },

  { tag: [t.comment, t.blockComment, t.lineComment], color: '#6a9955', fontStyle: 'italic' },
  { tag: t.docComment, color: '#6a9955', fontStyle: 'italic' },

  { tag: [t.tagName], color: '#569cd6' },
  { tag: [t.attributeName], color: '#9cdcfe' },
  { tag: [t.attributeValue], color: '#ce9178' },
  { tag: [t.angleBracket], color: '#808080' },

  { tag: [t.punctuation, t.separator], color: '#d4d4d4' },
  { tag: t.bracket, color: '#ffd700' },
  { tag: t.operator, color: '#d4d4d4' },
  { tag: t.meta, color: '#d7ba7d' },

  { tag: t.heading, color: '#569cd6', fontWeight: 'bold' },
  { tag: t.link, color: '#3794ff', textDecoration: 'underline' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.monospace, color: '#ce9178' },

  { tag: t.invalid, color: '#f44747', textDecoration: 'underline wavy' },
]);

const CodeEditor = forwardRef(function CodeEditor(
  { file, webcontainer, onSave, readOnly = false },
  ref
) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const savedContentRef = useRef('');
  const saveToastTimeoutRef = useRef(null);

  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [docStats, setDocStats] = useState({ lines: 1, chars: 0 });

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();

    switch (ext) {
      case 'js':
        return EMOJIS.JAVASCRIPT;
      case 'ts':
        return EMOJIS.TYPESCRIPT;
      case 'jsx':
      case 'tsx':
        return EMOJIS.REACT;
      case 'json':
        return EMOJIS.JSON;
      case 'css':
        return EMOJIS.CSS;
      case 'html':
      case 'htm':
        return EMOJIS.HTML;
      case 'md':
        return EMOJIS.MARKDOWN;
      case 'env':
        return EMOJIS.ENV;
      default:
        return EMOJIS.FILE;
    }
  };

  const getLanguageName = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();

    const names = {
      js: 'JavaScript',
      jsx: 'JavaScript JSX',
      ts: 'TypeScript',
      tsx: 'TypeScript JSX',
      html: 'HTML',
      htm: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      less: 'LESS',
      json: 'JSON',
      md: 'Markdown',
    };

    return names[ext] || 'Plain Text';
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();

    switch (ext) {
      case 'js':
        return javascript();
      case 'jsx':
        return javascript({ jsx: true });
      case 'ts':
        return javascript({ typescript: true });
      case 'tsx':
        return javascript({ typescript: true, jsx: true });
      case 'html':
      case 'htm':
        return html();
      case 'css':
        return css();
      case 'json':
        return json();
      case 'md':
        return markdown();
      default:
        return [];
    }
  };

  const handleSave = async () => {
    if (!viewRef.current || !webcontainer || !file || readOnly) {
      return;
    }

    try {
      const content = viewRef.current.state.doc.toString();

      await webcontainer.fs.writeFile(file.path, content);

      savedContentRef.current = content;
      setIsDirty(false);
      setJustSaved(true);

      if (saveToastTimeoutRef.current) {
        clearTimeout(saveToastTimeoutRef.current);
      }

      saveToastTimeoutRef.current = setTimeout(() => {
        setJustSaved(false);
        saveToastTimeoutRef.current = null;
      }, 1200);

      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  useImperativeHandle(ref, () => ({
    saveCurrentFile: handleSave,
  }));

  useEffect(() => {
    if (!editorRef.current || !file) return;

    const filePath = file.path;
    let cancelled = false;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const loadFileContent = async () => {
      if (file.contents !== undefined) {
        return file.contents;
      }

      if (!webcontainer) {
        return '// No content available';
      }

      try {
        return await webcontainer.fs.readFile(file.path, 'utf-8');
      } catch (err) {
        console.error('Failed to read file:', err);
        return '// Error loading file';
      }
    };

    const updateStats = (state) => {
      const head = state.selection.main.head;
      const line = state.doc.lineAt(head);

      setCursorInfo({
        line: line.number,
        col: head - line.from + 1,
      });

      setDocStats({
        lines: state.doc.lines,
        chars: state.doc.length,
      });
    };

    const initializeEditor = async () => {
      const content = await loadFileContent();

      if (cancelled) return;
      if (file?.path !== filePath) return;

      savedContentRef.current = content;
      setIsDirty(false);

      const saveKeymap = Prec.highest(
        keymap.of([
          {
            key: 'Mod-s',
            run: () => {
              handleSave();
              return true;
            },
          },
        ])
      );

      const state = EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          getLanguage(file.name),
          vscodeDarkTheme,
          Prec.high(syntaxHighlighting(vscodeHighlightStyle)),
          saveKeymap,
          EditorView.editable.of(!readOnly),
          EditorView.lineWrapping,

          EditorView.updateListener.of((update) => {
            if (update.docChanged || update.selectionSet) {
              updateStats(update.state);
            }

            if (update.docChanged) {
              const newContent = update.state.doc.toString();
              setIsDirty(newContent !== savedContentRef.current);
            }
          }),
        ],
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });

      updateStats(state);
    };

    initializeEditor();

    return () => {
      cancelled = true;

      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [file?.path, file?.contents, webcontainer, readOnly]);

  useEffect(() => {
    return () => {
      if (saveToastTimeoutRef.current) {
        clearTimeout(saveToastTimeoutRef.current);
      }
    };
  }, []);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-app-editor text-app-muted">
        <div className="text-center">
          <div className="text-4xl mb-2">{EMOJIS.FILE}</div>
          <p>Select a file to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-stretch bg-[#252526] border-b border-black/40 flex-shrink-0">
        <div className="relative flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-r border-black/40 min-w-0">
          <span className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#007acc]" />

          <span className="text-sm shrink-0">
            {getFileIcon(file.name)}
          </span>

          <span className="text-[13px] text-[#d4d4d4] truncate max-w-[180px]">
            {file.name}
          </span>

          {isDirty ? (
            <span
              className="w-2 h-2 rounded-full bg-[#d4d4d4] shrink-0"
              title="Unsaved changes"
            />
          ) : (
            !readOnly && (
              <button
                onClick={handleSave}
                className="shrink-0 text-xs text-[#858585] hover:text-white transition-colors"
                title="Save file (Cmd/Ctrl+S)"
              >
                {EMOJIS.SAVE}
              </button>
            )
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center px-3 text-xs text-[#858585] truncate max-w-[320px]">
          {justSaved && (
            <span className="text-[#4ec9b0] mr-2 transition-opacity">
              Saved
            </span>
          )}

          {file.path}
        </div>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        className="flex-1 min-h-0 overflow-hidden"
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-[11px] text-white flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>
            Ln {cursorInfo.line}, Col {cursorInfo.col}
          </span>

          <span className="opacity-70">
            {docStats.lines} lines
          </span>

          {readOnly && (
            <span className="opacity-70">
              Read Only
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span>{isDirty ? 'Modified' : 'Saved'}</span>
          <span>UTF-8</span>
          <span>{getLanguageName(file.name)}</span>
        </div>
      </div>
    </div>
  );
});

export default CodeEditor;
