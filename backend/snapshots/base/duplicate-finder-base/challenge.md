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
- Users with different normalized emails can still be candidates when they share the same email domain and their normalized names are at least **80% similar**.
- Name similarity uses normalized Levenshtein similarity: `1 - (edit distance / max(name lengths))`.
- A name similarity below 80% is not enough to report a duplicate.
- Each user pair should appear at most once, and a user must never be paired with itself.

Do not change the storage layer or the endpoint response shape.

## Example

An exact normalized email match is a certain duplicate:

```js
[
  { _id: 'a', name: 'John Doe', email: 'john.doe+work@example.com' },
  { _id: 'b', name: 'John Doe', email: 'johndoe@example.com' }
]
```

should produce:

```js
[
  {
    ids: ['a', 'b'],
    reason: 'email',
    score: 1
  }
]
```

A same-domain name match can also produce a candidate. For example:

```js
[
  { _id: 'a', name: 'Alice Brown', email: 'alice@example.com' },
  { _id: 'b', name: 'Alice Browne', email: 'alice2@example.com' }
]
```

should produce a name-and-domain candidate because the emails are different, the domain is the same, and the normalized names are at least 80% similar:

```js
[
  {
    ids: ['a', 'b'],
    reason: 'name-and-domain',
    score: 0.909
  }
]
```

The score for a name-and-domain match is the calculated name similarity, rounded to three decimal places.

**Note: This is a backend-only challenge, so there is no live preview.**
