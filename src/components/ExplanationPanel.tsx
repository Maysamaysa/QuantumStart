import type { Circuit } from '../lib/circuit/types';
import type { Complex } from '../lib/simulator/stateVector';
import { explainGate } from '../lib/explanations/gateExplanations';
import { explainState } from '../lib/explanations/stateExplanations';
import { runShots } from '../lib/simulator/shotRunner';
import { MeasurementHistogram } from './MeasurementHistogram';
import { useState, useEffect, useCallback } from 'react';
import styles from './ExplanationPanel.module.css';

export interface ExplanationPanelProps {
  circuit: Circuit;
  stepIndex: number;
  state: Complex[];
}

export function ExplanationPanel({
  circuit,
  stepIndex,
  state,
}: ExplanationPanelProps) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [prevStep, setPrevStep] = useState(stepIndex);
  const [prevCircuitLen, setPrevCircuitLen] = useState(circuit.length);

  // Reset experimental results if state or circuit changes
  if (stepIndex !== prevStep || circuit.length !== prevCircuitLen) {
    setPrevStep(stepIndex);
    setPrevCircuitLen(circuit.length);
    setCounts(null);
  }

  const SHOTS = 1000;

  const handleRunExperiment = useCallback(() => {
    const results = runShots(circuit, Math.log2(state.length), SHOTS);
    setCounts(results);
  }, [circuit, state.length]);

  const stateExplanation = explainState(state);
  const gateExplanation =
    stepIndex >= 0 &&
    stepIndex < circuit.length &&
    circuit[stepIndex]
      ? explainGate(circuit[stepIndex], stepIndex)
      : null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Explanation</h3>
      <div className={styles.section}>
        <span className={styles.label}>Current state</span>
        <p className={styles.text}>{stateExplanation}</p>
      </div>
      {gateExplanation && (
        <div className={styles.section}>
          <span className={styles.label}>Last gate applied</span>
          <p className={styles.text}>{gateExplanation}</p>
        </div>
      )}

      {/* Experimental Measurement Section */}
      <div className={styles.section} style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className={styles.label}>Measurement Lab</span>
          <button 
            type="button" 
            className={styles.experimentBtn}
            onClick={handleRunExperiment}
          >
            🧪 Run 1,000 Shots
          </button>
        </div>
        
        {counts ? (
          <MeasurementHistogram counts={counts} totalShots={SHOTS} />
        ) : (
          <p className={styles.text} style={{ fontSize: '0.75rem', opacity: 0.6 }}>
            Run an experiment to see the statistical distribution of measurement outcomes for the current state.
          </p>
        )}
      </div>
    </div>
  );
}
