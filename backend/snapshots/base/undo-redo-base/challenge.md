# Challenge: Undo / Redo

The notes app supports editing, deleting, and restoring notes, but the history behavior is inconsistent after an undo followed by a new change.

Implement the history manager in:

frontend/src/utils/historyManager.js

History should be action-based rather than storing a full copy of the application state for every step.

Each action has a label and knows how to apply and undo its own change. The manager should:

- Track undo and redo actions.
- Re-apply actions when redone.
- Clear the redo branch after a new action is performed following an undo.
- Keep at most 50 undoable actions.
- Expose the label of the next undo/redo operation, such as `Undo: Delete 'Buy milk'`.
- Support grouped actions so several changes can be undone and redone as one operation.
- Keep returned state isolated from internal state.

Do not change the existing notes UI or action handlers.
