# Challenge: Duplicate Finder

The duplicate-users endpoint is missing some obvious duplicate candidates while also needing to avoid unrelated users being grouped together.

Implement the matching logic in:

backend/src/duplicateFinder.js

A duplicate candidate is returned as:

```js
{
  ids: [id1, id2],
  reason: 'email' | 'name-and-domain',
  score: number
}
```

`score` is a confidence value from **0 to 1**, where **1 means a certain match**.

Use these rules:

- Email comparison is case-insensitive and ignores surrounding whitespace.
- For email matching, dots in the local part are ignored and a `+tag` is ignored before comparing addresses.
- An exact match after that normalization is a certain match: `reason` is `email` and `score` is `1`.
- Users with different normalized emails can still be candidates when they share the same email domain and their normalized names are highly similar.
- A weak name resemblance by itself is not enough to report a duplicate.
- Each user pair should appear at most once, and a user must never be paired with itself.

Do not change the storage layer or the endpoint response shape.

**Note: This is a backend-only challenge, so there is no live preview.**
