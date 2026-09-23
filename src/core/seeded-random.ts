export interface SeededRandom {
  next(): number;
  integer(minInclusive: number, maxExclusive: number): number;
  pick<T>(values: readonly T[]): T;
}

function hashSeed(value: string): number {
  let hash = 1779033703 ^ value.length;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);

  return (hash ^ (hash >>> 16)) >>> 0;
}

export function createSeededRandom(seedMaterial: string): SeededRandom {
  if (!seedMaterial.trim()) {
    throw new Error('Seed material must not be empty.');
  }

  let state = hashSeed(seedMaterial);

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^=
      value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  function integer(
    minInclusive: number,
    maxExclusive: number,
  ): number {
    if (
      !Number.isInteger(minInclusive) ||
      !Number.isInteger(maxExclusive) ||
      maxExclusive <= minInclusive
    ) {
      throw new Error(
        'Seeded integer bounds must be integers with max greater than min.',
      );
    }

    return (
      minInclusive +
      Math.floor(next() * (maxExclusive - minInclusive))
    );
  }

  function pick<T>(values: readonly T[]): T {
    if (values.length === 0) {
      throw new Error('Cannot pick from an empty collection.');
    }

    const value = values[integer(0, values.length)];

    if (value === undefined) {
      throw new Error('Seeded selection produced no value.');
    }

    return value;
  }

  return {
    next,
    integer,
    pick,
  };
}
