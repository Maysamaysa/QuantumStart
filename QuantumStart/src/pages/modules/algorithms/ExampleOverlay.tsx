import React, { useEffect, useRef } from 'react';
import styles from './ExampleOverlay.module.css';

export interface ExampleOverlayProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function ExampleOverlay({ currentStep, onStepChange }: ExampleOverlayProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onStepChange(currentStep + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') onStepChange(currentStep - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, onStepChange]);

  // Combined wheel scroll handler
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
    { label: 'Map', color: '#5DA7DB' },
    { label: 'Solve', color: '#5DA7DB' },
    { label: 'Results', color: '#5DA7DB' },
  ];

  return (
    <div className={styles.container} onWheel={handleWheel}>
      <div className={styles.phaseLabel}>
        <span className={styles.phaseBadge}>Phase 3: Complex Example</span>
        <span className={styles.phaseTitle}>QUBO & Task Scheduling</span>
      </div>

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

      <div className={styles.mainPanel}>
        {currentStep === 0 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 01 — Map Problem</span>
            <h2 className={styles.stepTitle}>Multi-Variable Scheduling</h2>
            <p className={styles.stepDesc}>
              This is a standard <strong>QUBO</strong> (Quadratic Unconstrained Binary Optimization) problem. 
              We map tasks to time slots while avoiding resource conflicts.
            </p>
            <div className={styles.conflictCard}>
              <div className={styles.conflictIcon}>⚠️</div>
              <div className={styles.conflictText}>
                <strong>Constraint:</strong> Task A and Task B cannot both be in the same "Morning" slot simultaneously.
              </div>
            </div>
            <div className={styles.insight}>
              Look at the <strong>Red Conflict Ring</strong> in 3D — it indicates a high penalty for this overlap.
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 02 — Solving with QA</span>
            <h2 className={styles.stepTitle}>Quantum Annealing Flow</h2>
            <p className={styles.stepDesc}>
              We let the quantum processor "anneal". In 3D, you see the annealing 
              particles exploring different pathways.
            </p>
            <div className={styles.algorithmBox}>
              <div className={styles.algoHeader}>QA Optimizer</div>
              <div className={styles.algoVisual}>
                <div className={styles.pulseNode}></div>
                <div className={styles.pulseNode}></div>
                <div className={styles.pulseNode}></div>
              </div>
            </div>
            <p className={styles.stepDesc}>
              This is essentially finding the lowest valley in a complex energy landscape.
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 03 — Final Result</span>
            <h2 className={styles.stepTitle}>Global Minimum Found</h2>
            <p className={styles.stepDesc}>
              The quantum system has converged to the most efficient schedule.
            </p>
            <div className={styles.resultsPanel}>
              <div className={styles.resultItem}>
                <span>A</span> → Morning
              </div>
              <div className={styles.resultItem}>
                <span>B</span> → Afternoon
              </div>
              <div className={styles.resultItem}>
                <span>C</span> → Morning
              </div>
            </div>
            <div className={styles.insight}>
              Congratulations! You've learned how quantum algorithms solve optimization problems.
            </div>
          </div>
        )}
      </div>

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
          onClick={() => {
            if (currentStep === 2) onStepChange(3); // Trigger completion
            else onStepChange(currentStep + 1);
          }}
        >
          {currentStep === 2 ? 'Complete Module ✅' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
