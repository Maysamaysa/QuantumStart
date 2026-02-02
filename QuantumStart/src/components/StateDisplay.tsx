import { useState, useMemo } from 'react';
import type { Complex } from '../lib/simulator/stateVector';
import { toKetString, getProbabilities } from '../lib/simulator/stateVector';
import styles from './StateDisplay.module.css';

export interface StateDisplayProps {
  state: Complex[];
  nQubits: number;
}

export function StateDisplay({ state }: StateDisplayProps) {
  const [sortByProb, setSortByProb] = useState(false);

  const ket = toKetString(state);
  const probs = getProbabilities(state);
  const n = Math.log2(state.length);
  if (!Number.isInteger(n) || n <= 0) return null;

  const basisLabels = Array.from(
    { length: state.length },
    (_, i) => i.toString(2).padStart(n, '0')
  );

  // Create array of {index, probability, label} and optionally sort
  const probabilityData = useMemo(() => {
    const data = probs.map((p, i) => ({
      index: i,
      probability: p,
      label: basisLabels[i],
    }));

    if (sortByProb) {
      return data.sort((a, b) => b.probability - a.probability);
    }
    return data;
  }, [probs, basisLabels, sortByProb]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>State</h3>
      </div>
      <div className={styles.ket}>
        <code>{ket}</code>
      </div>
      <div className={styles.probs}>
        <div className={styles.probsHeader}>
          <span className={styles.probsLabel}>Probabilities:</span>
          <button
            type="button"
            className={styles.sortBtn}
            onClick={() => setSortByProb(!sortByProb)}
            title={sortByProb ? 'Show default order' : 'Sort by probability'}
          >
            {sortByProb ? '↓ Sorted' : '⇅ Sort'}
          </button>
        </div>
        <div className={styles.barsContainer}>
          <div className={styles.bars}>
            {probabilityData.map(({ index, probability, label }) => (
              <div key={index} className={styles.barRow}>
                <span className={styles.basisLabel}>|{label}⟩</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${Math.min(100, probability * 100)}%` }}
                  />
                </div>
                <span className={styles.barPct}>
                  {(probability * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
