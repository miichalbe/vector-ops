export function formatRunSeed(unitRandom: number): string {
  if (!Number.isFinite(unitRandom) || unitRandom < 0 || unitRandom >= 1) {
    throw new Error('Run-seed random value must be within [0, 1).');
  }

  return Math.floor(unitRandom * 0x1_0000_0000)
    .toString(16)
    .toUpperCase()
    .padStart(8, '0');
}

export function createFreshRunSeed(
  currentSeed: string,
  random: () => number = Math.random,
): string {
  const normalizedCurrent = currentSeed.trim().toUpperCase().padStart(8, '0');
  const candidate = formatRunSeed(random());

  if (candidate !== normalizedCurrent) {
    return candidate;
  }

  const incremented = (Number.parseInt(candidate, 16) + 1) >>> 0;

  return incremented.toString(16).toUpperCase().padStart(8, '0');
}
