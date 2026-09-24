import { describe, expect, it } from 'vitest';

import { scenario01ActionIds } from './decisions';
import { getDecision1DownstreamModifiers } from './decision-1-outcomes';

describe('Scenario 01 Decision 1 downstream outcomes', () => {
  it('maps synchronised confirmation to earlier confidence support with added coordination load', () => {
    expect(
      getDecision1DownstreamModifiers(
        scenario01ActionIds.openCrossDomainIncident,
      ),
    ).toEqual({
      confirmationBehaviour: 'synchronised',
      confirmationDelayDeltaMinutes: -4,
      confidenceSupport: 'moderate',
      regionalAwareness: 'normal',
      coordinationLoad: 'increased',
    });
  });

  it('maps separate monitoring to organic later confirmation without added coordination load', () => {
    expect(
      getDecision1DownstreamModifiers(
        scenario01ActionIds.continueSeparateMonitoring,
      ),
    ).toEqual({
      confirmationBehaviour: 'organic',
      confirmationDelayDeltaMinutes: 4,
      confidenceSupport: 'none',
      regionalAwareness: 'normal',
      coordinationLoad: 'normal',
    });
  });

  it('maps early escalation to early regional awareness without artificial confidence support', () => {
    expect(
      getDecision1DownstreamModifiers(
        scenario01ActionIds.recommendRegionalEscalation,
      ),
    ).toEqual({
      confirmationBehaviour: 'organic',
      confirmationDelayDeltaMinutes: 0,
      confidenceSupport: 'none',
      regionalAwareness: 'early',
      coordinationLoad: 'increased',
    });
  });

  it('rejects an Action outside Decision 1', () => {
    expect(() =>
      getDecision1DownstreamModifiers('action.scenario-01.other'),
    ).toThrow(
      'Action action.scenario-01.other does not define a Decision 1 downstream outcome.',
    );
  });
});
