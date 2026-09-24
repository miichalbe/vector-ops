import { describe, expect, it } from 'vitest';

import type { Assessment, Projection } from '../core/contracts';
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
): Assessment {
  return {
    id,
    revision,
    type: 'assessment',
    title: `${id} r${revision}`,
    severity: attention === 'act' ? 'critical' : 'warning',
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
): Projection {
  return {
    id,
    revision,
    type: 'projection',
    title: `${id} r${revision}`,
    severity: attention === 'act' ? 'critical' : 'warning',
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
    horizon: {},
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

  it('prioritises attention before recency for the default visible claim', () => {
    const active = activeAssessmentFamilies([
      assessment('assessment.new-review', 1, 30, 'review'),
      assessment('assessment.older-act', 1, 20, 'act'),
      assessment('assessment.monitor', 1, 40, 'monitor'),
    ]);

    expect(active.map((claim) => claim.id)).toEqual([
      'assessment.older-act',
      'assessment.new-review',
      'assessment.monitor',
    ]);
  });

  it('uses recency when active claims have the same attention state', () => {
    const active = activeAssessmentFamilies([
      assessment('assessment.older', 1, 20, 'review'),
      assessment('assessment.newer', 1, 30, 'review'),
    ]);

    expect(active[0]?.id).toBe('assessment.newer');
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
});
