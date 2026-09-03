# Challenge: Typeahead Highlight

The typeahead search is working, but matching text in the results is not being highlighted correctly.

Implement the missing logic in:

frontend/src/utils/highlightMatch.js

The function should split the original text into matching and non-matching segments.

For example:

highlightMatch('JavaScript', 'script')

should produce:

[
  { text: 'Java', match: false },
  { text: 'Script', match: true }
]


Your implementation should handle case-insensitive matching, preserve the original text casing, support multiple occurrences, and return the original text as a single non-matching segment when the query is empty.

Do not change the existing search or keyboard-navigation behavior.
