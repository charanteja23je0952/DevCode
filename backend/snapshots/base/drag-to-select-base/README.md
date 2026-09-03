# Drag-to-Select

A small React grid where users can click individual cards or drag a selection rectangle across several cards.

The app demonstrates mouse/pointer interaction, selection state, and rectangle-based hit testing.

### Structure

drag-to-select-base/
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
            └── getSelectedItems.js

`App.jsx` contains the grid and pointer interaction.

`getSelectedItems.js` determines which cards intersect the current selection rectangle.

Frontend only. No backend or database.
