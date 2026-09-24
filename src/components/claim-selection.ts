import type {
  Assessment,
  DerivedClaim,
  Projection,
} from '../core/contracts';

const attentionRank: Record<DerivedClaim['attention'], number> = {
  monitor: 1,
  review: 2,
  act: 3,
};

const severityRank: Record<DerivedClaim['severity'], number> = {
  unknown: 1,
  normal: 1,
  warning: 2,
  critical: 3,
};

export function latestClaimFamilies<T extends DerivedClaim>(
  claims: readonly T[],
): T[] {
  const latestById = new Map<string, T>();

  for (const claim of claims) {
    const current = latestById.get(claim.id);

    if (!current || claim.revision > current.revision) {
      latestById.set(claim.id, claim);
    }
  }

  return [...latestById.values()];
}

function compareAttentionAndSeverity(
  left: DerivedClaim,
  right: DerivedClaim,
): number {
  const attentionDifference =
    attentionRank[right.attention] - attentionRank[left.attention];

  if (attentionDifference !== 0) {
    return attentionDifference;
  }

  return severityRank[right.severity] - severityRank[left.severity];
}

function compareRecencyAndId(
  left: DerivedClaim,
  right: DerivedClaim,
): number {
  const recalculationDifference =
    right.recalculatedAt - left.recalculatedAt;

  if (recalculationDifference !== 0) {
    return recalculationDifference;
  }

  return left.id.localeCompare(right.id);
}

export function prioritiseClaims<T extends DerivedClaim>(
  claims: readonly T[],
): T[] {
  return [...claims].sort((left, right) => {
    const operationalDifference = compareAttentionAndSeverity(left, right);

    return operationalDifference !== 0
      ? operationalDifference
      : compareRecencyAndId(left, right);
  });
}

export function prioritiseProjections(
  projections: readonly Projection[],
): Projection[] {
  return [...projections].sort((left, right) => {
    const operationalDifference = compareAttentionAndSeverity(left, right);

    if (operationalDifference !== 0) {
      return operationalDifference;
    }

    const leftImpact = left.horizon.earliest ?? Number.POSITIVE_INFINITY;
    const rightImpact = right.horizon.earliest ?? Number.POSITIVE_INFINITY;
    const impactDifference = leftImpact - rightImpact;

    return impactDifference !== 0
      ? impactDifference
      : compareRecencyAndId(left, right);
  });
}

export function currentAssessmentFamilies(
  assessments: readonly Assessment[],
): Assessment[] {
  return prioritiseClaims(latestClaimFamilies(assessments));
}

export function currentProjectionFamilies(
  projections: readonly Projection[],
): Projection[] {
  return prioritiseProjections(latestClaimFamilies(projections));
}

export function activeAssessmentFamilies(
  assessments: readonly Assessment[],
): Assessment[] {
  return currentAssessmentFamilies(assessments).filter(
    (assessment) => assessment.status === 'active',
  );
}

export function activeProjectionFamilies(
  projections: readonly Projection[],
): Projection[] {
  return currentProjectionFamilies(projections).filter(
    (projection) =>
      projection.status === 'projected' ||
      projection.status === 'developing',
  );
}

export function selectedClaimFamily<T extends DerivedClaim>(
  currentFamilies: readonly T[],
  activeFamilies: readonly T[],
  selectedId: string | null,
): T | undefined {
  if (selectedId) {
    const selected = currentFamilies.find((claim) => claim.id === selectedId);

    if (selected) {
      return selected;
    }
  }

  return activeFamilies[0] ?? currentFamilies[0];
}
