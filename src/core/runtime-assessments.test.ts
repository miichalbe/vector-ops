import { describe, expect, it } from 'vitest';

import {
  evaluateAssessmentRules,
  type AssessmentDraft,
  type AssessmentRule,
} from './runtime-assessments';
import { scenario01EntityIds } from '../scenarios/scenario-01/baseline';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';

function assessmentDraft(
  title = 'Possible correlated disruption',
): AssessmentDraft {
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
          description: 'Test assessment evidence.',
        },
      ],
    },
    entityIds: [scenario01EntityIds.gridSubstation],
    evidenceIds: ['observation.baseline.gpz.supply-state'],
    dependencyIds: ['dependency.suw.powered-by.gpz'],
    assumptions: [
      {
        id: 'assumption.test',
        statement: 'The test evidence remains applicable.',
        status: 'supported',
      },
    ],
    status: 'active',
  };
}

function assessmentRule(
  evaluate: AssessmentRule['evaluate'] = () => assessmentDraft(),
): AssessmentRule {
  return {
    id: 'rule.test.assessment',
    assessmentId: 'assessment.test',
    evaluate,
  };
}

describe('assessment rule evaluation', () => {
  it('creates an immutable first Assessment revision', () => {
    const processedState = evaluateAssessmentRules(
      scenario01InitialState,
      [assessmentRule()],
    );

    expect(processedState).not.toBe(scenario01InitialState);
    expect(processedState.assessments).toHaveLength(1);
    expect(processedState.assessments[0]).toMatchObject({
      id: 'assessment.test',
      revision: 1,
      type: 'assessment',
      ruleId: 'rule.test.assessment',
      createdAt: scenario01InitialState.now,
      recalculatedAt: scenario01InitialState.now,
    });
    expect(scenario01InitialState.assessments).toHaveLength(0);
  });

  it('returns the existing state when a rule has no result', () => {
    expect(
      evaluateAssessmentRules(
        scenario01InitialState,
        [assessmentRule(() => null)],
      ),
    ).toBe(scenario01InitialState);
  });

  it('does not duplicate an unchanged Assessment', () => {
    const firstState = evaluateAssessmentRules(
      scenario01InitialState,
      [assessmentRule()],
    );

    expect(
      evaluateAssessmentRules(firstState, [assessmentRule()]),
    ).toBe(firstState);
  });

  it('appends a material revision without rewriting the first revision', () => {
    const firstState = evaluateAssessmentRules(
      scenario01InitialState,
      [assessmentRule()],
    );
    const laterState = {
      ...firstState,
      now: firstState.now + 1,
    };
    const revisedState = evaluateAssessmentRules(laterState, [
      assessmentRule(() =>
        assessmentDraft('Persistent correlated disruption'),
      ),
    ]);

    expect(revisedState.assessments).toHaveLength(2);
    expect(revisedState.assessments.map(({ revision, title }) => ({
      revision,
      title,
    }))).toEqual([
      {
        revision: 1,
        title: 'Possible correlated disruption',
      },
      {
        revision: 2,
        title: 'Persistent correlated disruption',
      },
    ]);
    expect(revisedState.assessments[1]).toMatchObject({
      createdAt: scenario01InitialState.now,
      recalculatedAt: scenario01InitialState.now + 1,
    });
  });

  it('rejects a draft that references unknown evidence', () => {
    expect(() =>
      evaluateAssessmentRules(scenario01InitialState, [
        assessmentRule(() => ({
          ...assessmentDraft(),
          evidenceIds: ['observation.unknown'],
        })),
      ]),
    ).toThrow(
      'Assessment assessment.test references unknown evidence: observation.unknown',
    );
  });

  it('rejects duplicate rule ids', () => {
    const rule = assessmentRule();

    expect(() =>
      evaluateAssessmentRules(scenario01InitialState, [rule, rule]),
    ).toThrow('Duplicate assessment rule id: rule.test.assessment');
  });
});
