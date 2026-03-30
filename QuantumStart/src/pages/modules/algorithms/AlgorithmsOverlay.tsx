import React, { useEffect, useRef } from 'react';
import styles from './AlgorithmsOverlay.module.css';

export interface AlgorithmsOverlayProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function AlgorithmsOverlay({ currentStep, onStepChange }: AlgorithmsOverlayProps): JSX.Element {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onStepChange(currentStep + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') onStepChange(currentStep - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, onStepChange]);

  const wheelAcc = useRef(0);
  const lastScrollTime = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 600) return;
    wheelAcc.current += e.deltaY;
    if (Math.abs(wheelAcc.current) > 100) {
      if (wheelAcc.current > 0) onStepChange(currentStep + 1);
      else onStepChange(currentStep - 1);
      wheelAcc.current = 0;
      lastScrollTime.current = now;
    }
  };

  const STEP_META = [
    { label: 'Map', color: '#FFB7C5' },
    { label: 'Oracle', color: '#FFB7C5' },
    { label: 'Amplify', color: '#FFB7C5' },
    { label: 'Measure', color: '#FFB7C5' },
  ];

  return (
    <div className={styles.overlayContainer} onWheel={handleWheel}>
      {/* ─── PHASE LABEL (TOP LEFT) ─── */}
      <div className={styles.phaseLabel}>
        <span className={styles.phaseBadge}>Phase 1</span>
        <span className={styles.phaseTitle}>Theory of Quantum Optimization</span>
      </div>

      {/* ─── STEP DOTS (LEFT) ─── */}
      <div className={styles.stepDots}>
        {STEP_META.map((step, i) => (
          <button 
            key={i}
            className={`${styles.dotItem} ${currentStep === i ? styles.dotItemActive : ''}`}
            onClick={() => onStepChange(i)}
            style={{ '--dot-color': step.color } as React.CSSProperties}
          >
            <div className={styles.dot} />
            <span className={styles.dotLabel}>{step.label}</span>
          </button>
        ))}
      </div>

      {/* ─── MAIN PANEL (RIGHT) ─── */}
      <div className={styles.mainPanel}>
        {currentStep === 0 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 01 — Map Problem</span>
            <h2 className={styles.stepTitle}>Classical to Quantum</h2>
            <p className={styles.stepDesc}>
              Before a quantum processor can help, we must map our classical optimization 
              problem (like scheduling or logistics) into a mathematical form it understands.
            </p>
            <div className={styles.formula}>f(x) = ∑ cᵢxᵢ + ∑ qᵢⱼxᵢxⱼ</div>
            <p className={styles.note}>
              Think of this as creating an energy landscape where the "best" answer 
              is located in the deepest valley.
            </p>
          </div>
        )}

        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 02 — The Oracle</span>
            <h2 className={styles.stepTitle}>Flipping the Phase</h2>
            <p className={styles.stepDesc}>
              In quantum search (Grover's), we use an <strong>Oracle</strong>. It marks the 
              correct answer by flipping its sign in the wave function.
            </p>
            <div className={styles.insightBox}>
              "The Oracle doesn't reveal the answer — it marks the target with a unique phase."
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 03 — Amplify</span>
            <h2 className={styles.stepTitle}>Constructive Interference</h2>
            <p className={styles.stepDesc}>
              We then boost the probability of the marked answer. Amplitude amplification 
              uses interference to make the "correct" spike taller and taller.
            </p>
            <div className={styles.visualCue}>↑ AMPLITUDE ↑</div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 04 — Measure</span>
            <h2 className={styles.stepTitle}>Collapse to Solution</h2>
            <p className={styles.stepDesc}>
              Finally, we measure. The wave function collapses, and with high probability, 
              we find the state that solves our optimization problem.
            </p>
            <div className={styles.outcomePill}>Optimal result found.</div>
            <p className={styles.note}>
              Next, let's try a real-world example: Traffic Optimization.
            </p>
          </div>
        )}
      </div>

      {/* ─── BOTTOM NAV ─── */}
      <div className={styles.bottomNav}>
        <button 
          className={styles.navBtn} 
          disabled={currentStep === 0} 
          onClick={() => onStepChange(currentStep - 1)}
        >
          ← Prev
        </button>
        <button 
          className={`${styles.navBtn} ${styles.navBtnPrimary}`} 
          onClick={() => onStepChange(currentStep + 1)}
        >
          {currentStep === 3 ? 'Start Traffic Example →' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
