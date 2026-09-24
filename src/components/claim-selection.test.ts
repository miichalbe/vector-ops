import { describe, expect, it } from 'vitest';

import type { Assessment, Projection, Severity } from '../core/contracts';
import {
  activeAssessmentFamilies,
  activeProjectionFamilies,
  currentAssessmentFamilies,
  currentProjectionFamilies,
  selectedClaimFamily,
} from './claim-selection';

function assessment(
  id: string,
  revision: number,
  recalculatedAt: number,
  attention: Assessment['attention'],
  status: Assessment['status'] = 'active',
  severity: Severity = 'warning',
): Assessment {
  return {
    id,
    revision,
    type: 'assessment',
    title: `${id} r${revision}`,
    severity,
    attention,
    confidence: { level: 'medium' },
    entityIds: [],
    evidenceIds: [],
    dependencyIds: [],
    assumptions: [],
    ruleId: 'rule.test',
    createdAt: 1,
    recalculatedAt,
    status,
  };
}

function projection(
  id: string,
  revision: number,
  recalculatedAt: number,
  attention: Projection['attention'],
  status: Projection['status'],
  severity: Severity = 'warning',
  earliest?: number,
): Projection {
  return {
    id,
    revision,
    type: 'projection',
    title: `${id} r${revision}`,
    severity,
    attention,
    confidence: { level: 'medium' },
    entityIds: [],
    evidenceIds: [],
    dependencyIds: [],
    assumptions: [],
    ruleId: 'rule.test',
    createdAt: 1,
    recalculatedAt,
    status,
    horizon: earliest === undefined ? {} : { earliest },
  };
}

describe('claim selection policy', () => {
  it('keeps only the latest revision of each claim family', () => {
    const current = currentAssessmentFamilies([
      assessment('assessment.a', 1, 10, 'review'),
      assessment('assessment.b', 1, 12, 'review'),
      assessment('assessment.a', 2, 14, 'review'),
    ]);

    expect(current).toHaveLength(2);
    expect(current.find((claim) => claim.id === 'assessment.a')?.revision).toBe(2);
  });

  it('prioritises attention before severity and recency', () => {
    const active = activeAssessmentFamilies([
      assessment('assessment.new-critical-review', 1, 40, 'review', 'active', 'critical'),
      assessment('assessment.older-warning-act', 1, 20, 'act', 'active', 'warning'),
      assessment('assessment.monitor', 1, 50, 'monitor', 'active', 'critical'),
    ]);

    expect(active.map((claim) => claim.id)).toEqual([
      'assessment.older-warning-act',
      'assessment.new-critical-review',
      'assessment.monitor',
    ]);
  });

  it('uses severity before recency when attention is equal', () => {
    const active = activeAssessmentFamilies([
      assessment('assessment.new-warning', 1, 40, 'review', 'active', 'warning'),
      assessment('assessment.older-critical', 1, 20, 'review', 'active', 'critical'),
    ]);

    expect(active[0]?.id).toBe('assessment.older-critical');
  });

  it('uses recency when attention and severity are equal', () => {
    const active = activeAssessmentFamilies([
      assessment('assessment.older', 1, 20, 'review'),
      assessment('assessment.newer', 1, 30, 'review'),
    ]);

    expect(active[0]?.id).toBe('assessment.newer');
  });

  it('uses shorter Projection time-to-impact before recency', () => {
    const current = currentProjectionFamilies([
      projection('projection.newer-later', 1, 40, 'review', 'developing', 'warning', 80),
      projection('projection.older-sooner', 1, 20, 'review', 'developing', 'warning', 60),
    ]);

    expect(current[0]?.id).toBe('projection.older-sooner');
  });

  it('allows an explicit Timeline/operator selection to override default priority', () => {
    const current = currentProjectionFamilies([
      projection('projection.active', 1, 30, 'review', 'developing'),
      projection('projection.avoided', 2, 25, 'monitor', 'avoided'),
    ]);
    const active = activeProjectionFamilies(current);

    expect(selectedClaimFamily(current, active, 'projection.avoided')?.id).toBe(
      'projection.avoided',
    );
  });

  it('falls back to the highest-priority active claim when selection is absent or stale', () => {
    const current = currentProjectionFamilies([
      projection('projection.review', 1, 30, 'review', 'developing'),
      projection('projection.act', 1, 20, 'act', 'projected'),
      projection('projection.done', 1, 40, 'monitor', 'avoided'),
    ]);
    const active = activeProjectionFamilies(current);

    expect(selectedClaimFamily(current, active, null)?.id).toBe('projection.act');
    expect(selectedClaimFamily(current, active, 'projection.missing')?.id).toBe(
      'projection.act',
    );
  });

  it('keeps a current resolved or avoided family inspectable when no claims remain active', () => {
    const current = currentProjectionFamilies([
      projection('projection.avoided', 2, 50, 'monitor', 'avoided'),
      projection('projection.observed', 3, 55, 'review', 'observed'),
    ]);
    const active = activeProjectionFamilies(current);

    expect(active).toHaveLength(0);
    expect(selectedClaimFamily(current, active, null)?.id).toBe(
      'projection.observed',
    );
  });
});
