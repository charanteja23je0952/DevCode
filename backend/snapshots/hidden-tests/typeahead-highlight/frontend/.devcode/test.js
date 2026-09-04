import assert from 'node:assert/strict';
import { highlightMatch } from '../src/utils/highlightMatch.js';

function test(name, fn) {
  try {
    fn();
    console.log(`PASS - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}`);
    console.error(`  ${error.message}`);
    process.exitCode = 1;
  }
}

test('returns original text for an empty query', () => {
  assert.deepEqual(
    highlightMatch('JavaScript', ''),
    [{ text: 'JavaScript', match: false }]
  );
});

test('matches case-insensitively while preserving original casing', () => {
  assert.deepEqual(
    highlightMatch('JavaScript', 'script'),
    [
      { text: 'Java', match: false },
      { text: 'Script', match: true }
    ]
  );
});

test('handles a match at the beginning', () => {
  assert.deepEqual(
    highlightMatch('JavaScript', 'Java'),
    [
      { text: 'Java', match: true },
      { text: 'Script', match: false }
    ]
  );
});

test('handles a match at the end', () => {
  assert.deepEqual(
    highlightMatch('JavaScript', 'Script'),
    [
      { text: 'Java', match: false },
      { text: 'Script', match: true }
    ]
  );
});

test('handles multiple occurrences', () => {
  assert.deepEqual(
    highlightMatch('test TEST testing', 'test'),
    [
      { text: 'test', match: true },
      { text: ' ', match: false },
      { text: 'TEST', match: true },
      { text: ' ', match: false },
      { text: 'test', match: true },
      { text: 'ing', match: false }
    ]
  );
});

test('returns the whole text as non-matching when there is no match', () => {
  assert.deepEqual(
    highlightMatch('JavaScript', 'python'),
    [{ text: 'JavaScript', match: false }]
  );
});

test('handles an exact match', () => {
  assert.deepEqual(
    highlightMatch('React', 'react'),
    [{ text: 'React', match: true }]
  );
});

test('handles an empty text value', () => {
  assert.deepEqual(
    highlightMatch('', 'react'),
    [{ text: '', match: false }]
  );
});

if (process.exitCode) process.exit(1);
console.log('\nAll tests passed.');