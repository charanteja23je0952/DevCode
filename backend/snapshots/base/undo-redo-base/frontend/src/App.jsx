import { useState } from 'react';
import { createHistoryManager } from './utils/historyManager';

const initialNotes = [
  { id: 1, text: 'Review API changes' },
  { id: 2, text: 'Update release notes' }
];

export default function App() {
  const [, rerender] = useState(0);
  const [manager] = useState(() => createHistoryManager(initialNotes));
  const notes = manager.getState();
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const refresh = () => rerender((value) => value + 1);

  const addNote = () => {
    const note = { id: Date.now(), text: 'New note' };

    manager.perform({
      label: `Add '${note.text}'`,
      apply: (state) => [...state, note],
      undo: (state) => state.filter((item) => item.id !== note.id)
    });
    refresh();
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const saveEdit = () => {
    if (editingId == null) return;

    const current = notes.find((note) => note.id === editingId);
    if (!current) return;

    if (editingText === current.text) {
      setEditingId(null);
      setEditingText('');
      return;
    }

    manager.perform({
      label: `Edit '${current.text}'`,
      apply: (state) =>
        state.map((note) =>
          note.id === editingId
            ? { ...note, text: editingText }
            : note
        ),
      undo: (state) =>
        state.map((note) =>
          note.id === editingId
            ? { ...note, text: current.text }
            : note
        )
    });

    setEditingId(null);
    setEditingText('');
    refresh();
  };

  const deleteNote = (id) => {
    const current = notes.find((note) => note.id === id);
    if (!current) return;

    const index = notes.findIndex((note) => note.id === id);

    manager.perform({
      label: `Delete '${current.text}'`,
      apply: (state) => state.filter((note) => note.id !== id),
      undo: (state) => {
        const next = [...state];
        next.splice(Math.min(index, next.length), 0, current);
        return next;
      }
    });
    refresh();
  };

  const clearAll = () => {
    if (notes.length === 0) return;

    manager.group('Clear all', () => {
      [...notes].forEach((note) => {
        const index = notes.findIndex((item) => item.id === note.id);

        manager.perform({
          label: `Delete '${note.text}'`,
          apply: (state) => state.filter((item) => item.id !== note.id),
          undo: (state) => {
            const next = [...state];
            next.splice(Math.min(index, next.length), 0, note);
            return next;
          }
        });
      });
    });
    refresh();
  };

  const undo = () => {
    manager.undo();
    refresh();
  };

  const redo = () => {
    manager.redo();
    refresh();
  };

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">State</p>
        <h1>Notes</h1>
        <p className="description">
          Every edit is recorded as an action. You can move through the history
          without losing the ability to make new changes.
        </p>

        <div className="toolbar">
          <button onClick={addNote}>Add note</button>
          <button onClick={clearAll} disabled={notes.length === 0}>Clear all</button>
          <button onClick={undo} disabled={!manager.canUndo()}>
            {manager.getUndoLabel() || 'Undo'}
          </button>
          <button onClick={redo} disabled={!manager.canRedo()}>
            {manager.getRedoLabel() || 'Redo'}
          </button>
        </div>

        <div className="notes">
          {notes.map((note) => (
            <div className="note" key={note.id}>
              {editingId === note.id ? (
                <>
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span>{note.text}</span>
                  <div className="actions">
                    <button onClick={() => startEdit(note)}>Edit</button>
                    <button onClick={() => deleteNote(note.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
