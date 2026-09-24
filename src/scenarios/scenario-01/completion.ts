import type {
  CompletionRuleDefinition,
  CompletionRuleContext,
} from '../../core/runtime-completion';
import { scenario01Act4EventIds } from './act4';
import { scenario01DecisionIds } from './decision-1-ids';
import { scenario01Decision2Ids } from './decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from './decision-3-ids';

export const scenario01CompletionRuleId =
  'completion.scenario-01.operational-handover';

function hasRecordedDecision(
  context: CompletionRuleContext,
  decisionId: string,
): boolean {
  const decision = context.decisions.find(
    (candidate) => candidate.id === decisionId,
  );

  return Boolean(
    decision?.selectedActionId && decision.decidedAt !== undefined,
  );
}

function requiredDecision3ResponseEventId(
  actionId: string | undefined,
): string | undefined {
  switch (actionId) {
    case scenario01Decision3ActionIds.targetedContingency:
      return scenario01Act4EventIds.targetedActive;

    case scenario01Decision3ActionIds.recommendVoivodeshipCoordination:
      return scenario01Act4EventIds.regionalActive;

    case scenario01Decision3ActionIds.continueOperatorCoordination:
      return scenario01Act4EventIds.confirmationReceived;

    default:
      return undefined;
  }
}

export const scenario01CompletionRule: CompletionRuleDefinition = {
  id: scenario01CompletionRuleId,
  evaluate(context) {
    if (
      !hasRecordedDecision(
        context,
        scenario01DecisionIds.informationPosture,
      ) ||
      !hasRecordedDecision(
        context,
        scenario01Decision2Ids.generatorRecommendation,
      ) ||
      !hasRecordedDecision(
        context,
        scenario01Decision3Ids.coordinationPosture,
      )
    ) {
      return false;
    }

    const decision3 = context.decisions.find(
      (decision) =>
        decision.id === scenario01Decision3Ids.coordinationPosture,
    );
    const requiredResponseEventId =
      requiredDecision3ResponseEventId(decision3?.selectedActionId);

    if (!requiredResponseEventId) {
      return false;
    }

    const eventIds = new Set(context.events.map((event) => event.id));

    return (
      eventIds.has(requiredResponseEventId) &&
      eventIds.has(scenario01Act4EventIds.handover)
    );
  },
};
