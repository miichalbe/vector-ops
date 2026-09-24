import type { Effect } from '../../core/contracts';
import type {
  ScenarioEventEffect,
  ScenarioTimeEventDefinition,
} from '../../core/runtime-events';
import type { ScenarioRuntimeState } from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from './decision-3-ids';
import { scenario01Act4EventIds } from './act4';

function withEffects(
  definition: ScenarioTimeEventDefinition,
  effects: readonly ScenarioEventEffect[],
): ScenarioTimeEventDefinition {
  return effects.length === 0
    ? definition
    : {
        ...definition,
        effects: [...(definition.effects ?? []), ...effects],
      };
}

function observedDecisionEffect(
  decisionId: string,
  effect: Effect,
): ScenarioEventEffect {
  return {
    type: 'appendDecisionObservedEffect',
    decisionId,
    effect,
  };
}

export function decorateScenario01OpeningEvents(
  definitions: readonly ScenarioTimeEventDefinition[],
): ScenarioTimeEventDefinition[] {
  return definitions.map((definition, index) =>
    index === 0
      ? withEffects(definition, [
          {
            type: 'updateScenarioPhase',
            phase: 'detection',
          },
        ])
      : definition,
  );
}

export function decorateScenario01DynamicEvents(
  state: ScenarioRuntimeState,
  definitions: readonly ScenarioTimeEventDefinition[],
): ScenarioTimeEventDefinition[] {
  const decision1 = state.decisions.find(
    (decision) => decision.id === scenario01DecisionIds.informationPosture,
  );
  const decision2 = state.decisions.find(
    (decision) => decision.id === scenario01Decision2Ids.generatorRecommendation,
  );
  const decision3 = state.decisions.find(
    (decision) => decision.id === scenario01Decision3Ids.coordinationPosture,
  );

  return definitions.map((definition) => {
    const effects: ScenarioEventEffect[] = [];

    switch (definition.id) {
      case 'event.scenario-01.d1.synchronised-confirmation':
        if (
          decision1?.selectedActionId === scenario01ActionIds.openCrossDomainIncident
        ) {
          effects.push(
            {
              type: 'updateActionLifecycle',
              actionId: decision1.selectedActionId,
              lifecycle: 'completed',
            },
            observedDecisionEffect(decision1.id, {
              type: 'information.confirmation',
              entityIds: [
                scenario01EntityIds.gridSubstation,
                scenario01EntityIds.waterStation,
                scenario01EntityIds.communicationsGateway,
              ],
              description:
                'Synchronised confirmation was received through coordinated operator channels before the persistent feeder isolation was reported.',
            }),
          );
        }
        break;

      case 'event.scenario-01.d1.regional-escalation-acknowledged':
        if (
          decision1?.selectedActionId === scenario01ActionIds.recommendRegionalEscalation
        ) {
          effects.push(
            {
              type: 'updateActionLifecycle',
              actionId: decision1.selectedActionId,
              lifecycle: 'completed',
            },
            observedDecisionEffect(decision1.id, {
              type: 'regional.awareness',
              entityIds: [
                scenario01EntityIds.gridSubstation,
                scenario01EntityIds.waterStation,
                scenario01EntityIds.communicationsGateway,
              ],
              description:
                'The regional coordination chain acknowledged the recommendation while operational confirmation was still pending.',
            }),
          );
        }
        break;

      case 'event.scenario-01.gpz.f12-isolated':
        effects.push(
          {
            type: 'updateScenarioPhase',
            phase: 'dependency',
          },
        );

        if (decision1?.selectedActionId) {
          if (
            decision1.selectedActionId ===
            scenario01ActionIds.continueSeparateMonitoring
          ) {
            effects.push({
              type: 'updateActionLifecycle',
              actionId: decision1.selectedActionId,
              lifecycle: 'completed',
            });
          }

          effects.push(
            observedDecisionEffect(decision1.id, {
              type: 'information.persistence',
              entityIds: [scenario01EntityIds.gridSubstation],
              description:
                decision1.selectedActionId ===
                scenario01ActionIds.continueSeparateMonitoring
                  ? 'Without a synchronised confirmation request, persistent F-12 isolation became the next material confirmation that the disruption was continuing.'
                  : 'Persistent F-12 isolation materially confirmed that the disruption was continuing after the information-posture decision.',
            }),
          );
        }
        break;

      case 'event.scenario-01.d2.suw.generator-operational':
        if (
          decision2?.selectedActionId ===
          scenario01Decision2ActionIds.recommendGeneratorForSuw
        ) {
          effects.push(
            observedDecisionEffect(decision2.id, {
              type: 'water.service-margin',
              entityIds: [
                scenario01EntityIds.mobileGenerator,
                scenario01EntityIds.waterStation,
              ],
              description:
                'AG-400 became operational at SUW Kępa and the observed water-service margin trend began stabilising.',
            }),
          );
        }
        break;

      case 'event.scenario-01.d2.r4.generator-operational':
        if (
          decision2?.selectedActionId ===
          scenario01Decision2ActionIds.recommendGeneratorForR4
        ) {
          effects.push(
            observedDecisionEffect(decision2.id, {
              type: 'communications.continuity',
              entityIds: [
                scenario01EntityIds.mobileGenerator,
                scenario01EntityIds.communicationsGateway,
                scenario01EntityIds.waterStation,
              ],
              description:
                'AG-400 became operational at R-4; link quality began stabilising and SUW telemetry visibility began improving.',
            }),
          );
        }
        break;

      case 'event.scenario-01.d2.wait.restoration-update':
        if (
          decision2?.selectedActionId ===
          scenario01Decision2ActionIds.waitForGridRestoration
        ) {
          effects.push(
            observedDecisionEffect(decision2.id, {
              type: 'information.restoration-window',
              entityIds: [
                scenario01EntityIds.gridSubstation,
                scenario01EntityIds.mobileGenerator,
              ],
              description:
                'A provisional grid-restoration window was received while AG-400 remained unassigned.',
            }),
          );
        }
        break;

      case 'event.scenario-01.d2.suw.r4-risk-developing':
        if (
          decision2?.selectedActionId ===
          scenario01Decision2ActionIds.recommendGeneratorForSuw
        ) {
          effects.push(
            observedDecisionEffect(decision2.id, {
              type: 'communications.continuity',
              entityIds: [scenario01EntityIds.communicationsGateway],
              description:
                'R-4 link quality deteriorated to poor while AG-400 was committed to SUW Kępa.',
            }),
          );
        }
        break;

      case 'event.scenario-01.d2.r4.water-margin-declining':
        if (
          decision2?.selectedActionId ===
          scenario01Decision2ActionIds.recommendGeneratorForR4
        ) {
          effects.push(
            observedDecisionEffect(decision2.id, {
              type: 'water.service-margin',
              entityIds: [scenario01EntityIds.waterStation],
              description:
                'SUW Kępa water-service margin continued to decline while AG-400 was committed to R-4.',
            }),
          );
        }
        break;

      case 'event.scenario-01.d2.wait.dual-margin-declining':
        if (
          decision2?.selectedActionId ===
          scenario01Decision2ActionIds.waitForGridRestoration
        ) {
          effects.push(
            observedDecisionEffect(decision2.id, {
              type: 'time-margin',
              entityIds: [
                scenario01EntityIds.waterStation,
                scenario01EntityIds.communicationsGateway,
              ],
              description:
                'While waiting, water-service margin continued to decline and R-4 link quality deteriorated to poor.',
            }),
          );
        }
        break;

      case 'event.scenario-01.hospital.continuity-request':
        effects.push({
          type: 'updateScenarioPhase',
          phase: 'escalation',
        });
        break;

      case scenario01Act4EventIds.targetedActive:
        if (
          decision3?.selectedActionId ===
          scenario01Decision3ActionIds.targetedContingency
        ) {
          effects.push(
            observedDecisionEffect(decision3.id, {
              type: 'contingency.preparation',
              entityIds: [
                scenario01EntityIds.waterStation,
                scenario01EntityIds.communicationsGateway,
                scenario01EntityIds.countyHospital,
              ],
              description:
                'Affected organisations acknowledged targeted notifications and local contingency preparation became active without broader regional coordination.',
            }),
          );
        }
        break;

      case scenario01Act4EventIds.regionalActive:
        if (
          decision3?.selectedActionId ===
          scenario01Decision3ActionIds.recommendVoivodeshipCoordination
        ) {
          effects.push(
            observedDecisionEffect(decision3.id, {
              type: 'coordination.regional-package',
              entityIds: [
                scenario01EntityIds.gridSubstation,
                scenario01EntityIds.waterStation,
                scenario01EntityIds.communicationsGateway,
                scenario01EntityIds.countyHospital,
              ],
              description:
                'The recommendation was accepted and the voivodeship-level coordination package became active with wider organisational awareness.',
            }),
          );
        }
        break;

      case scenario01Act4EventIds.confirmationReceived:
        if (
          decision3?.selectedActionId ===
          scenario01Decision3ActionIds.continueOperatorCoordination
        ) {
          effects.push(
            observedDecisionEffect(decision3.id, {
              type: 'information.confirmation',
              entityIds: [scenario01EntityIds.gridSubstation],
              description:
                'Additional GPZ confirmation was received while coordination remained at operator level; F-12 remained isolated and restoration work continued.',
            }),
          );
        }
        break;
    }

    return withEffects(definition, effects);
  });
}
