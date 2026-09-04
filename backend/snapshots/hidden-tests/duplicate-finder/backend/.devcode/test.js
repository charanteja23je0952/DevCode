import assert from 'node:assert/strict';
import { findDuplicates } from '../src/duplicateFinder.js';

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

function findPair(results, a, b) {
  return results.find(
    (entry) =>
      entry.ids.length === 2 &&
      entry.ids.includes(a) &&
      entry.ids.includes(b)
  );
}

test('matches emails that become identical after documented normalization', () => {
  const results = findDuplicates([
    { _id: 'a', name: 'John Smith', email: 'John.Smith+old@example.com' },
    { _id: 'b', name: 'John S.', email: 'johnsmith@example.com' }
  ]);

  const pair = findPair(results, 'a', 'b');
  assert.ok(pair);
  assert.equal(pair.reason, 'email');
  assert.equal(pair.score, 1);
});

test('matches very similar names when the email domain is shared', () => {
  const results = findDuplicates([
    { _id: 'a', name: 'Sara Conner', email: 'sara.conner@acme.com' },
    { _id: 'b', name: 'Sarah Connor', email: 'sarah.connor@acme.com' }
  ]);

  const pair = findPair(results, 'a', 'b');
  assert.ok(pair);
  assert.equal(pair.reason, 'name-and-domain');
  assert.ok(pair.score >= 0 && pair.score <= 1);
});

test('does not match the same name across unrelated email domains', () => {
  const results = findDuplicates([
    { _id: 'a', name: 'Alice Brown', email: 'alice.brown@example.com' },
    { _id: 'b', name: 'Alice Brown', email: 'alice.brown@other.com' }
  ]);

  assert.equal(findPair(results, 'a', 'b'), undefined);
});

test('does not report weak name resemblance on its own', () => {
  const results = findDuplicates([
    { _id: 'a', name: 'Alice Brown', email: 'alice@example.com' },
    { _id: 'b', name: 'Alicia Green', email: 'alicia@example.com' }
  ]);

  assert.equal(findPair(results, 'a', 'b'), undefined);
});

test('does not create duplicate self-pairs', () => {
  assert.deepEqual(
    findDuplicates([{ _id: 'a', name: 'John Smith', email: 'john@example.com' }]),
    []
  );
});

test('returns only the documented response fields', () => {
  const results = findDuplicates([
    { _id: 'a', name: 'John Smith', email: 'john.smith@example.com' },
    { _id: 'b', name: 'John Smith', email: 'johnsmith@example.com' }
  ]);

  assert.deepEqual(Object.keys(results[0]).sort(), ['ids', 'reason', 'score']);
});

test('returns the same pair at most once', () => {
  const results = findDuplicates([
    { _id: 'a', name: 'John Smith', email: 'john.smith@example.com' },
    { _id: 'b', name: 'John Smith', email: 'johnsmith@example.com' }
  ]);

  // Count how many times each pair appears
  const pairCounts = {};
  for (const entry of results) {
    const key = entry.ids.sort().join(',');
    pairCounts[key] = (pairCounts[key] || 0) + 1;
  }

  // Each pair should appear at most once
  for (const count of Object.values(pairCounts)) {
    assert.equal(count, 1, 'Each pair should appear at most once');
  }
});

if (process.exitCode) process.exit(1);
console.log('\nAll tests passed.');
