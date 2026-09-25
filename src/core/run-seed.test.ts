import { describe, expect, it } from 'vitest';

import { createFreshRunSeed, formatRunSeed } from './run-seed';

describe('run seed generation', () => {
  it('formats the full uint32 range as stable hexadecimal seeds', () => {
    expect(formatRunSeed(0)).toBe('00000000');
    expect(formatRunSeed(1 - 1 / 0x1_0000_0000)).toBe('FFFFFFFF');
  });

  it('uses the supplied random source deterministically', () => {
    expect(createFreshRunSeed('8F4C', () => 0.5)).toBe('80000000');
  });

  it('never returns the current seed when the random source collides', () => {
    const collision = 0x00008f4c / 0x1_0000_0000;

    expect(createFreshRunSeed('8F4C', () => collision)).toBe('00008F4D');
  });

  it('rejects values outside the unit interval', () => {
    expect(() => formatRunSeed(-0.1)).toThrow();
    expect(() => formatRunSeed(1)).toThrow();
  });
});
