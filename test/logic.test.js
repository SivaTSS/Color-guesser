import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generatePalette, generateSecret, calculateFeedback } from '../js/logic.js';

describe('generatePalette', () => {
  it('creates distinct hsl colors', () => {
    const palette = generatePalette(5);
    assert.equal(palette.length, 5);
    palette.forEach(color => {
      assert.match(color, /^hsl\(/);
    });
  });
});

describe('generateSecret', () => {
  it('allows duplicates when configured', () => {
    const config = { numColors: 4, numPegs: 4, allowDuplicates: true };
    const originalRandom = Math.random;
    const seq = [0.1, 0.1, 0.4, 0.4];
    Math.random = () => seq.shift();
    const secret = generateSecret(config);
    Math.random = originalRandom;
    assert.deepEqual(secret, [0, 0, 1, 1]);
  });

  it('prevents duplicates when disallowed', () => {
    const config = { numColors: 4, numPegs: 4, allowDuplicates: false };
    const originalRandom = Math.random;
    const seq = [0.1, 0.1, 0.1, 0.1];
    Math.random = () => seq.shift();
    const secret = generateSecret(config);
    Math.random = originalRandom;
    // Should contain all unique values
    assert.deepEqual(new Set(secret).size, secret.length);
  });
});

describe('calculateFeedback', () => {
  it('returns all black for exact match', () => {
    const secret = [1, 2, 3, 4];
    const guess = [1, 2, 3, 4];
    const result = calculateFeedback(guess, secret);
    assert.deepEqual(result, { black: 4, white: 0 });
  });

  it('handles all colors correct but misplaced', () => {
    const secret = [1, 2, 3, 4];
    const guess = [4, 3, 2, 1];
    const result = calculateFeedback(guess, secret);
    assert.deepEqual(result, { black: 0, white: 4 });
  });

  it('handles mixed black and white pegs', () => {
    const secret = [1, 1, 2, 2];
    const guess = [1, 2, 1, 2];
    const result = calculateFeedback(guess, secret);
    assert.deepEqual(result, { black: 2, white: 2 });
  });
});
