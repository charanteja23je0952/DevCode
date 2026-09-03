# Undo / Redo

A small React notes list where users can add, edit, delete, clear, undo, and redo changes.

The application records user operations as history actions and supports grouped operations such as clearing the whole list.

### Structure

undo-redo-base/
├── README.md
├── challenge.md
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        └── utils/
            └── historyManager.js

`App.jsx` contains the notes UI and user actions.

`historyManager.js` records actions, supports undo/redo, exposes upcoming action labels, and handles grouped operations.

Frontend only. No backend or database.
