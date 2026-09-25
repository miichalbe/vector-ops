import { useEffect, useState } from 'react';

import './VectorOpsApp.css';
import ActionReceipt from './ActionReceipt';
import ActionReview from './ActionReview';
import AfterActionReport from './AfterActionReport';
import {
  activeAssessmentFamilies,
  activeProjectionFamilies,
  currentAssessmentFamilies,
  currentProjectionFamilies,
  selectedClaimFamily,
} from './claim-selection';
import { EntityGrid, SelectedEntityPanel } from './EntityWorkspace';
import {
  formatObservationSource,
  formatObservationValue,
  formatScenarioTime,
} from './entity-state';
import HeaderUtilities from './HeaderUtilities';
import OperationalTimeline from './OperationalTimeline';
import {
  buildOperationalTimeline,
  type OperationalTimelineClaimKind,
} from './operational-timeline';
import RunCompletionControls from './RunCompletionControls';
import type {
  ActionId,
  Assessment,
  DecisionId,
  EntityId,
  Observation,
  Projection,
} from '../core/contracts';
import { recordDecisionSelection } from '../core/runtime-decision-selection';
import { createFreshRunSeed } from '../core/run-seed';
import { advanceScenarioRuntime } from '../core/runtime-step';
import type { ScenarioRuntimeState } from '../core/runtime-state';
import {
  createScenario01Run,
  SCENARIO_01_DEFAULT_SEED,
} from '../scenarios/scenario-01/scenario';

const SIMULATION_TICK_MS = 4_000;
const initialScenarioRun = createScenario01Run(SCENARIO_01_DEFAULT_SEED);
const initialEntityId = initialScenarioRun.initialState.entityOrder[0];

if (!initialEntityId) {
  throw new Error('Scenario 01 runtime state contains no entities.');
}

const metricLabels: Record<string, string> = {
  'power.supplyState': 'Supply',
  'power.feederState': 'Feeder F-12',
  'power.loadPercentage': 'Load',
  'power.qualityEvent': 'Power quality',
  'power.restorationEstimate': 'Restoration estimate',
  'water.outputPressure': 'Output pressure',
  'water.reservoirLevel': 'Reservoir',
  'water.pumpState': 'Pumps',
  'water.controllerState': 'Controller',
  'water.telemetryFreshness': 'Telemetry freshness',
  'water.powerSupport': 'Power support',
  'water.serviceMarginTrend': 'Service margin',
  'communications.powerMode': 'Power mode',
  'communications.linkQuality': 'Link quality',
  'communications.packetLoss': 'Packet loss',
  'health.essentialServicesPosture': 'Essential services',
  'health.waterMargin': 'Water margin',
  'health.continuityRequest': 'Continuity request',
  'health.contingencyPreparation': 'Contingency preparation',
  'logistics.resourceState': 'Resource state',
  'logistics.assignment': 'Assignment',
  'logistics.estimatedArrival': 'Travel time',
  'logistics.routeState': 'Route state',
  'logistics.estimatedTravelTime': 'Travel time',
};

function ClaimEvidence({
  claim,
  runtimeState,
}: {
  claim: Assessment | Projection;
  runtimeState: ScenarioRuntimeState;
}) {
  const evidence = claim.evidenceIds
    .map((evidenceId) =>
      runtimeState.observations.find(
        (observation) => observation.id === evidenceId,
      ),
    )
    .filter(
      (observation): observation is Observation => observation !== undefined,
    );
  const dependencies = runtimeState.dependencies.filter((dependency) =>
    claim.dependencyIds.includes(dependency.id),
  );

  return (
    <details className="claim-evidence">
      <summary>Review evidence</summary>

      <div className="claim-evidence__content">
        <h3>Evidence</h3>
        <ul>
          {evidence.map((observation) => (
            <li key={observation.id}>
              <strong>
                {metricLabels[observation.metric] ?? observation.metric}
              </strong>
              <span>{formatObservationValue(observation)}</span>
              <small>
                {formatObservationSource(observation.source)} · received{' '}
                {formatScenarioTime(observation.receivedAt)}
              </small>
            </li>
          ))}
        </ul>

        <h3>Dependencies</h3>
        <ul>
          {dependencies.map((dependency) => (
            <li key={dependency.id}>
              <span>{dependency.description ?? dependency.type}</span>
            </li>
          ))}
        </ul>

        <h3>Assumptions</h3>
        <ul>
          {claim.assumptions.map((assumption) => (
            <li key={assumption.id}>
              <span>{assumption.statement}</span>
              <small>Status: {assumption.status}</small>
            </li>
          ))}
        </ul>

        <p className="rule-reference">Rule: {claim.ruleId}</p>
      </div>
    </details>
  );
}

function ClaimSwitcher({
  kind,
  claims,
  selectedId,
  activeCount,
  onSelect,
}: {
  kind: 'Assessment' | 'Projection';
  claims: readonly (Assessment | Projection)[];
  selectedId: string | undefined;
  activeCount: number;
  onSelect: (claimId: string) => void;
}) {
  if (claims.length <= 1) {
    return (
      <div className="claim-panel__heading-row">
        <p className="eyebrow">{kind}</p>
        <span>{activeCount} active</span>
      </div>
    );
  }

  return (
    <>
      <div className="claim-panel__heading-row">
        <p className="eyebrow">{kind}</p>
        <span>
          {activeCount} active · {claims.length} tracked
        </span>
      </div>
      <label className="claim-switcher">
        <span>View {kind.toLowerCase()}</span>
        <select
          value={selectedId ?? ''}
          onChange={(event) => onSelect(event.target.value)}
        >
          {claims.map((claim) => (
            <option key={claim.id} value={claim.id}>
              {claim.title} ({claim.status})
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

interface ReceiptReference {
  decisionId: DecisionId;
  actionId: ActionId;
}

export default function VectorOpsApp() {
  const [scenarioRun, setScenarioRun] = useState(initialScenarioRun);
  const [runtimeState, setRuntimeState] =
    useState<ScenarioRuntimeState>(initialScenarioRun.initialState);
  const [selectedEntityId, setSelectedEntityId] =
    useState<EntityId>(initialEntityId);
  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string | null>(null);
  const [selectedProjectionId, setSelectedProjectionId] =
    useState<string | null>(null);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [receiptReference, setReceiptReference] =
    useState<ReceiptReference | null>(null);

  useEffect(() => {
    if (isManuallyPaused || runtimeState.status !== 'running') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRuntimeState((currentState) =>
        advanceScenarioRuntime(
          currentState,
          1,
          scenarioRun.runtimeDefinition,
          new Date().toISOString(),
        ),
      );
    }, SIMULATION_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [isManuallyPaused, runtimeState.status, scenarioRun.runtimeDefinition]);

  const currentAssessments = currentAssessmentFamilies(runtimeState.assessments);
  const currentProjections = currentProjectionFamilies(runtimeState.projections);
  const activeAssessments = activeAssessmentFamilies(runtimeState.assessments);
  const activeProjections = activeProjectionFamilies(runtimeState.projections);
  const primaryAssessment = selectedClaimFamily(
    currentAssessments,
    activeAssessments,
    selectedAssessmentId,
  );
  const primaryProjection = selectedClaimFamily(
    currentProjections,
    activeProjections,
    selectedProjectionId,
  );
  const activeClaims = [...activeAssessments, ...activeProjections];
  const delayedObservationCount = runtimeState.observations.filter(
    (observation) =>
      observation.quality === 'degraded' ||
      observation.observedAt < observation.receivedAt,
  ).length;
  const timelineEntries = buildOperationalTimeline(runtimeState);
  const pendingDecision =
    runtimeState.status === 'awaitingDecision'
      ? runtimeState.decisions.find(
          (decision) => decision.selectedActionId === undefined,
        )
      : undefined;
  const pendingDecisionGate = pendingDecision
    ? scenarioRun.runtimeDefinition.decisionGates.find(
        (gate) => gate.id === pendingDecision.id,
      )
    : undefined;
  const decisionRequired =
    pendingDecision !== undefined && pendingDecisionGate !== undefined;
  const runStatusLabel =
    runtimeState.status === 'awaitingDecision'
      ? 'Awaiting decision'
      : isManuallyPaused
        ? 'Paused'
        : runtimeState.status === 'running'
          ? 'Running'
          : runtimeState.status;
  const runtimeControlLabel =
    runtimeState.status === 'awaitingDecision'
      ? 'Decision required'
      : isManuallyPaused
        ? 'Resume'
        : 'Pause';
  const receiptDecision = receiptReference
    ? runtimeState.decisions.find(
        (decision) => decision.id === receiptReference.decisionId,
      )
    : undefined;
  const receiptAction = receiptReference
    ? runtimeState.actions.find(
        (action) => action.id === receiptReference.actionId,
      )
    : undefined;

  function startRun(seed: string) {
    const nextRun = createScenario01Run(seed);
    const nextEntityId = nextRun.initialState.entityOrder[0];

    if (!nextEntityId) {
      throw new Error('Scenario 01 runtime state contains no entities.');
    }

    setScenarioRun(nextRun);
    setRuntimeState(nextRun.initialState);
    setSelectedEntityId(nextEntityId);
    setSelectedAssessmentId(null);
    setSelectedProjectionId(null);
    setIsManuallyPaused(false);
    setReceiptReference(null);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  function handleDecisionConfirm(actionId: ActionId) {
    if (!pendingDecision) {
      return;
    }

    const decisionId = pendingDecision.id;

    setRuntimeState((currentState) =>
      recordDecisionSelection(
        currentState,
        decisionId,
        actionId,
        new Date().toISOString(),
      ),
    );
    setReceiptReference({ decisionId, actionId });
  }

  function handleTimelineClaimSelect(
    kind: OperationalTimelineClaimKind,
    claimId: string,
  ) {
    if (kind === 'assessment') {
      setSelectedAssessmentId(claimId);
    } else {
      setSelectedProjectionId(claimId);
    }

    window.requestAnimationFrame(() => {
      document
        .getElementById(`${kind}-panel`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  return (
    <main className="vector-ops">
      <header className="app-header">
        <div>
          <p className="eyebrow">VECTOR OPS</p>
          <h1>Operational workspace</h1>
          <p className="scenario-name">{runtimeState.scenario.title}</p>
        </div>

        <div className="scenario-controls">
          <HeaderUtilities />
          <div className="scenario-clock" aria-label="Scenario time">
            <span>Scenario time</span>
            <strong>{formatScenarioTime(runtimeState.now)}</strong>
          </div>
          <button
            type="button"
            className="runtime-control"
            aria-pressed={isManuallyPaused}
            disabled={runtimeState.status !== 'running'}
            onClick={() => setIsManuallyPaused((paused) => !paused)}
          >
            {runtimeControlLabel}
          </button>
        </div>
      </header>

      <section className="system-bar" aria-label="System and data status">
        <span><strong>Modules:</strong> 4 active</span>
        <span>
          <strong>Data:</strong> {runtimeState.observations.length} observations
          {delayedObservationCount > 0
            ? ` · ${delayedObservationCount} delayed`
            : ' · current'}
        </span>
        <span>
          <strong>Entities:</strong> {runtimeState.entityOrder.length} monitored
        </span>
        <span>
          <strong>Seed:</strong> {runtimeState.run.seed}
        </span>
        <span>
          <strong>Run:</strong> {runStatusLabel}
        </span>
      </section>

      <OperationalTimeline
        entries={timelineEntries}
        onSelectEntity={setSelectedEntityId}
        onSelectClaim={handleTimelineClaimSelect}
      />

      {receiptDecision && receiptAction ? (
        <ActionReceipt
          action={receiptAction}
          decision={receiptDecision}
          onDismiss={() => setReceiptReference(null)}
        />
      ) : null}

      {decisionRequired && pendingDecision && pendingDecisionGate ? (
        <ActionReview
          runtimeState={runtimeState}
          decision={pendingDecision}
          question={pendingDecisionGate.question}
          ownerLabel="WCZK duty officer"
          onConfirm={handleDecisionConfirm}
        />
      ) : null}

      <div className="workspace">
        <section className="entity-workspace" aria-labelledby="entities-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current operational picture</p>
              <h2 id="entities-title">Monitored entities</h2>
            </div>
            <span>{runtimeState.entityOrder.length} entities currently monitored</span>
          </div>

          <EntityGrid
            runtimeState={runtimeState}
            selectedEntityId={selectedEntityId}
            activeClaims={activeClaims}
            onSelectEntity={setSelectedEntityId}
          />
        </section>

        <aside className="intelligence-column">
          <div className="section-heading intelligence-heading">
            <div>
              <p className="eyebrow">Inspection context</p>
              <h2>Selection details</h2>
            </div>
          </div>

          <SelectedEntityPanel
            runtimeState={runtimeState}
            selectedEntityId={selectedEntityId}
          />

          <section
            id="assessment-panel"
            className={`intelligence-panel claim-panel${primaryAssessment ? ' claim-panel--active' : ''}`}
            aria-live="polite"
          >
            <ClaimSwitcher
              kind="Assessment"
              claims={currentAssessments}
              selectedId={primaryAssessment?.id}
              activeCount={activeAssessments.length}
              onSelect={setSelectedAssessmentId}
            />
            {primaryAssessment ? (
              <>
                <h2>{primaryAssessment.title}</h2>
                <p className="claim-summary">
                  {primaryAssessment.evidenceIds.length} observations ·{' '}
                  {primaryAssessment.dependencyIds.length} dependencies ·{' '}
                  {primaryAssessment.assumptions.length} assumptions
                </p>
                <p className="panel-meta">
                  Status: {primaryAssessment.status} · Confidence:{' '}
                  {primaryAssessment.confidence.level} · Recalculated at{' '}
                  {formatScenarioTime(primaryAssessment.recalculatedAt)}
                </p>
                <ClaimEvidence
                  claim={primaryAssessment}
                  runtimeState={runtimeState}
                />
              </>
            ) : (
              <>
                <h2>No material cross-domain issue detected</h2>
                <p>
                  Current observations do not indicate a material
                  multi-service disruption.
                </p>
                <p className="panel-meta">
                  Confidence: high · Recalculated at{' '}
                  {formatScenarioTime(runtimeState.now)}
                </p>
              </>
            )}
          </section>

          <section
            id="projection-panel"
            className={`intelligence-panel claim-panel${primaryProjection ? ' claim-panel--active' : ''}`}
            aria-live="polite"
          >
            <ClaimSwitcher
              kind="Projection"
              claims={currentProjections}
              selectedId={primaryProjection?.id}
              activeCount={activeProjections.length}
              onSelect={setSelectedProjectionId}
            />
            {primaryProjection ? (
              <>
                <h2>{primaryProjection.title}</h2>
                <p className="projection-window">
                  Projected window:{' '}
                  <strong>
                    {primaryProjection.horizon.earliest !== undefined
                      ? formatScenarioTime(primaryProjection.horizon.earliest)
                      : 'Unknown'}
                    {'–'}
                    {primaryProjection.horizon.latest !== undefined
                      ? formatScenarioTime(primaryProjection.horizon.latest)
                      : 'Unknown'}
                  </strong>
                </p>
                <p>Main uncertainty: {primaryProjection.mainUncertainty}</p>
                <p className="panel-meta">
                  Status: {primaryProjection.status} · Confidence:{' '}
                  {primaryProjection.confidence.level} · Recalculated at{' '}
                  {formatScenarioTime(primaryProjection.recalculatedAt)}
                </p>
                <ClaimEvidence
                  claim={primaryProjection}
                  runtimeState={runtimeState}
                />
              </>
            ) : (
              <>
                <h2>No active projections</h2>
                <p>
                  Time-dependent consequences will appear when
                  observations and dependencies meet a defined rule.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>

      {runtimeState.status === 'completed' ? (
        <>
          <AfterActionReport runtimeState={runtimeState} />
          <RunCompletionControls
            seed={runtimeState.run.seed}
            onReplay={() => startRun(runtimeState.run.seed)}
            onNewRun={() =>
              startRun(createFreshRunSeed(runtimeState.run.seed))
            }
          />
        </>
      ) : null}
    </main>
  );
}
