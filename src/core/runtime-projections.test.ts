import { describe, expect, it } from 'vitest';

import {
  evaluateProjectionRules,
  type ProjectionDraft,
  type ProjectionRule,
} from './runtime-projections';
import { scenario01EntityIds } from '../scenarios/scenario-01/baseline';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';

function projectionDraft(
  title = 'Communications may become unavailable',
): ProjectionDraft {
  return {
    title,
    severity: 'warning',
    attention: 'review',
    confidence: {
      level: 'medium',
      reasons: [
        {
          type: 'test',
          effect: 'neutral',
          description: 'Test projection evidence.',
        },
      ],
    },
    entityIds: [scenario01EntityIds.communicationsGateway],
    evidenceIds: ['observation.baseline.r4.packet-loss'],
    dependencyIds: ['dependency.r4.powered-by.gpz'],
    assumptions: [
      {
        id: 'assumption.test.projection',
        statement: 'The observed trend continues.',
        status: 'supported',
      },
    ],
    horizon: {
      earliest: scenario01InitialState.now + 10,
      latest: scenario01InitialState.now + 20,
    },
    mainUncertainty: 'Whether the trend persists.',
    status: 'projected',
  };
}

function projectionRule(
  evaluate: ProjectionRule['evaluate'] = () => [
    {
      projectionId: 'projection.test',
      draft: projectionDraft(),
    },
  ],
): ProjectionRule {
  return {
    id: 'rule.test.projection',
    evaluate,
  };
}

describe('projection rule evaluation', () => {
  it('creates an immutable first Projection revision', () => {
    const processedState = evaluateProjectionRules(
      scenario01InitialState,
      [projectionRule()],
    );

    expect(processedState).not.toBe(scenario01InitialState);
    expect(processedState.projections).toHaveLength(1);
    expect(processedState.projections[0]).toMatchObject({
      id: 'projection.test',
      revision: 1,
      type: 'projection',
      ruleId: 'rule.test.projection',
      createdAt: scenario01InitialState.now,
      recalculatedAt: scenario01InitialState.now,
    });
    expect(scenario01InitialState.projections).toHaveLength(0);
  });

  it('returns the existing state when a rule has no result', () => {
    expect(
      evaluateProjectionRules(
        scenario01InitialState,
        [projectionRule(() => [])],
      ),
    ).toBe(scenario01InitialState);
  });

  it('does not duplicate an unchanged Projection', () => {
    const firstState = evaluateProjectionRules(
      scenario01InitialState,
      [projectionRule()],
    );

    expect(
      evaluateProjectionRules(firstState, [projectionRule()]),
    ).toBe(firstState);
  });

  it('appends a material revision without rewriting the first revision', () => {
    const firstState = evaluateProjectionRules(
      scenario01InitialState,
      [projectionRule()],
    );
    const laterState = {
      ...firstState,
      now: firstState.now + 1,
    };
    const revisedState = evaluateProjectionRules(laterState, [
      projectionRule(() => [
        {
          projectionId: 'projection.test',
          draft: projectionDraft(
            'Communications loss is becoming more likely',
          ),
        },
      ]),
    ]);

    expect(revisedState.projections).toHaveLength(2);
    expect(
      revisedState.projections.map(({ revision, title }) => ({
        revision,
        title,
      })),
    ).toEqual([
      {
        revision: 1,
        title: 'Communications may become unavailable',
      },
      {
        revision: 2,
        title: 'Communications loss is becoming more likely',
      },
    ]);
    expect(revisedState.projections[1]).toMatchObject({
      createdAt: scenario01InitialState.now,
      recalculatedAt: scenario01InitialState.now + 1,
    });
  });

  it('rejects an invalid time horizon', () => {
    expect(() =>
      evaluateProjectionRules(scenario01InitialState, [
        projectionRule(() => [
          {
            projectionId: 'projection.test',
            draft: {
              ...projectionDraft(),
              horizon: {
                earliest: scenario01InitialState.now + 20,
                latest: scenario01InitialState.now + 10,
              },
            },
          },
        ]),
      ]),
    ).toThrow(
      'Projection projection.test earliest horizon must not be after its latest horizon.',
    );
  });

  it('rejects a draft that references unknown evidence', () => {
    expect(() =>
      evaluateProjectionRules(scenario01InitialState, [
        projectionRule(() => [
          {
            projectionId: 'projection.test',
            draft: {
              ...projectionDraft(),
              evidenceIds: ['observation.unknown'],
            },
          },
        ]),
      ]),
    ).toThrow(
      'Projection projection.test references unknown evidence: observation.unknown',
    );
  });

  it('rejects duplicate Projection ids across rule results', () => {
    const duplicateResult = {
      projectionId: 'projection.duplicate',
      draft: projectionDraft(),
    };

    expect(() =>
      evaluateProjectionRules(scenario01InitialState, [
        projectionRule(() => [duplicateResult, duplicateResult]),
      ]),
    ).toThrow(
      'Duplicate projection id across rules: projection.duplicate',
    );
  });
});
