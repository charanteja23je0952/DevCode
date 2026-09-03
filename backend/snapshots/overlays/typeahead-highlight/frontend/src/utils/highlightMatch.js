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
 *
 * Requirements:
 * - Empty query returns original text as single non-matching segment
 * - Case-insensitive matching
 * - Preserve original casing in returned text
 * - Handle multiple occurrences of the query
 * - Return array of { text, match } objects
 */
export function highlightMatch(text, query) {
  // TODO: Implement this function
  
  
  return [{ text: String(text), match: false }];
}