# Duplicate Finder

A small Express API for finding likely duplicate user records.

The service works with user data stored through a lightweight in-memory adapter so it can run without a separate MongoDB process inside WebContainer.

The duplicate matcher considers normalized email information together with name similarity and returns candidate pairs rather than deleting or merging records.

### Structure

duplicate-finder-base/
├── README.md
├── challenge.md
└── backend/
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── db/
        │   └── inMemoryAdapter.js
        ├── models/
        │   └── User.js
        ├── duplicateFinder.js
        └── server.js

`User.js` defines the user model.

`inMemoryAdapter.js` supplies the WebContainer data store.

`duplicateFinder.js` decides which users should be reported as likely duplicates.

Backend only. No external MongoDB server is required.

**Note: This is a backend-only challenge, so there is no live preview.**
