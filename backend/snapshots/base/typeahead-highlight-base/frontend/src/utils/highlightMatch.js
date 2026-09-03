/**
 * Split text into segments so the caller can render matching text differently.
 * Matching is case-insensitive and preserves the original text casing.
 *
 * Example:
 * highlightMatch('JavaScript', 'script')
 * -> [
 *      { text: 'Java', match: false },
 *      { text: 'Script', match: true }
 *    ]
 */
export function highlightMatch(text, query) {
  if (!query) {
    return [{ text, match: false }];
  }

  const source = String(text);
  const needle = String(query).trim();

  if (!needle) {
    return [{ text: source, match: false }];
  }

  const lowerSource = source.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const segments = [];
  let cursor = 0;

  while (cursor < source.length) {
    const matchIndex = lowerSource.indexOf(lowerNeedle, cursor);

    if (matchIndex === -1) {
      segments.push({
        text: source.slice(cursor),
        match: false
      });
      break;
    }

    if (matchIndex > cursor) {
      segments.push({
        text: source.slice(cursor, matchIndex),
        match: false
      });
    }

    segments.push({
      text: source.slice(matchIndex, matchIndex + needle.length),
      match: true
    });

    cursor = matchIndex + needle.length;
  }

  return segments.length ? segments : [{ text: source, match: false }];
}
