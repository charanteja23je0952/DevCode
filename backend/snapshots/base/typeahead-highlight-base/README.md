# Typeahead Highlight

A small React typeahead search application where users can search through a list of items as they type.

The app includes debounced search, result filtering, keyboard navigation, and highlighting of the text that matches the current query.

### Structure

frontend/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        └── utils/
            └── highlightMatch.js

`App.jsx` contains the main search interface and interaction logic.

`highlightMatch.js` contains the text-matching logic used to split result text into matching and non-matching parts.

Frontend only. No backend or database.
