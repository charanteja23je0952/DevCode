const DEFAULT_LIMIT = 50;

export function createHistoryManager(initialState, options = {}) {
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : DEFAULT_LIMIT;

  let state = clone(initialState);
  let undoStack = [];
  let redoStack = [];
  let activeGroup = null;

  const manager = {
    getState() {
      return clone(state);
    },

    perform(action) {
      validateAction(action);

      const previousState = state;
      const nextState = action.apply(clone(state));
      state = clone(nextState);

      if (activeGroup) {
        activeGroup.actions.push(action);
      } else {
        pushUndo(action);
        redoStack = [];
      }

      return manager.getState();
    },

    group(label, callback) {
      if (activeGroup) {
        throw new Error('Nested history groups are not supported');
      }

      const group = { label, actions: [] };
      activeGroup = group;

      try {
        callback();
      } finally {
        activeGroup = null;
      }

      if (group.actions.length > 0) {
        pushUndo({
          label,
          apply(currentState) {
            let nextState = clone(currentState);
            for (const action of group.actions) {
              nextState = action.apply(nextState);
            }
            return nextState;
          },
          undo(currentState) {
            let nextState = clone(currentState);
            for (let i = group.actions.length - 1; i >= 0; i -= 1) {
              nextState = group.actions[i].undo(nextState);
            }
            return nextState;
          }
        });
        redoStack = [];
      }

      return manager.getState();
    },

    undo() {
      if (undoStack.length === 0) return manager.getState();

      const action = undoStack.pop();
      state = clone(action.undo(clone(state)));
      redoStack.push(action);
      return manager.getState();
    },

    redo() {
      if (redoStack.length === 0) return manager.getState();

      const action = redoStack.pop();
      state = clone(action.apply(clone(state)));
      undoStack.push(action);
      return manager.getState();
    },

    canUndo() {
      return undoStack.length > 0;
    },

    canRedo() {
      return redoStack.length > 0;
    },

    getUndoLabel() {
      const action = undoStack.at(-1);
      return action ? `Undo: ${action.label}` : null;
    },

    getRedoLabel() {
      const action = redoStack.at(-1);
      return action ? `Redo: ${action.label}` : null;
    }
  };

  function pushUndo(action) {
    undoStack.push(action);
    if (undoStack.length > limit) {
      undoStack.shift();
    }
  }

  return manager;
}

function validateAction(action) {
  if (!action || typeof action.label !== 'string') {
    throw new Error('A history action must have a label');
  }
  if (typeof action.apply !== 'function' || typeof action.undo !== 'function') {
    throw new Error('A history action must provide apply and undo functions');
  }
}

function clone(value) {
  return structuredClone(value);
}
