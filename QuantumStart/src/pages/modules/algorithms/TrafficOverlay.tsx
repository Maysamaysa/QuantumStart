import React, { useState, useEffect, useRef } from 'react';
import styles from './TrafficOverlay.module.css';

export interface TrafficOverlayProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  trafficWeight: number;
  onWeightChange: (weight: number) => void;
}

export function TrafficOverlay({ 
  currentStep, 
  onStepChange, 
  trafficWeight, 
  onWeightChange 
}: TrafficOverlayProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [counts, setCounts] = useState({ '0': 0, '1': 0 });
  const simulatorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ─── CALCULATIONS ───
  const theta = (trafficWeight - 50) * (Math.PI / 100);
  const prob1 = Math.pow(Math.sin(theta/2 + Math.PI/4), 2); 
  const prob0 = 1 - prob1;

  const runSimulation = () => {
    setIsSimulating(true);
    setCounts({ '0': 0, '1': 0 });
    
    let iterations = 0;
    const maxIterations = 20;
    const shots = 1000;

    const tick = () => {
      iterations++;
      const current0 = Math.round(shots * prob0 * (iterations / maxIterations));
      const current1 = Math.round(shots * prob1 * (iterations / maxIterations));
      
      setCounts({ '0': current0, '1': current1 });

      if (iterations < maxIterations) {
        simulatorRef.current = setTimeout(tick, 50);
      } else {
        setIsSimulating(false);
      }
    };
    tick();
  };

  useEffect(() => {
    return () => { if (simulatorRef.current) clearTimeout(simulatorRef.current); };
  }, []);

  const STEP_META = [
    { label: 'Map', color: '#C1E1C1' },
    { label: 'Circuit', color: '#C1E1C1' },
    { label: 'Execute', color: '#C1E1C1' },
    { label: 'Interpret', color: '#C1E1C1' },
  ];

  return (
    <div className={styles.container} onWheel={handleWheel}>
      <div className={styles.phaseLabel}>
        <span className={styles.phaseBadge}>Phase 2: Example 1</span>
        <span className={styles.phaseTitle}>Simple Traffic Light Optimization</span>
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

      {/* ─── STEP CONTENT ─── */}
      <div className={styles.mainPanel}>
        {currentStep === 0 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 01 — Map Problem</span>
            <h2 className={styles.stepTitle}>Prioritize Road A or B?</h2>
            <p className={styles.stepDesc}>
              In this scenario, we use 1 qubit to represent a binary decision. 
              |0⟩ means prioritize Road A, and |1⟩ means prioritize Road B.
            </p>
            
            <div className={styles.sliderContainer}>
              <div className={styles.sliderLabels}>
                <span>Road A (more traffic)</span>
                <span>Road B (more traffic)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={trafficWeight} 
                onChange={(e) => onWeightChange(parseInt(e.target.value))}
                className={styles.weightSlider}
              />
              <div className={styles.weightDisplay}>
                Bias Level: {trafficWeight}% towards B
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 02 — Map Problem → Quantum Circuit</span>
            <h2 className={styles.stepTitle}>Create Superposition</h2>
            <p className={styles.stepDesc}>
              We start by placing the qubit in superposition to try BOTH decisions at once. 
              Then, we apply a rotation based on our traffic data.
            </p>
            <div className={styles.circuitGraphic}>
              <div className={styles.qubitLine}>
                <span className={styles.qubitLabel}>|0⟩</span>
                <div className={styles.gate}>H</div>
                <div className={styles.gate}>Ry(θ)</div>
                <div className={styles.measureGate}>M</div>
              </div>
            </div>
            <div className={styles.mathRecall}>
              θ = {((trafficWeight - 50) * 0.0314).toFixed(3)} rad
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 03 — Execute & Measure</span>
            <h2 className={styles.stepTitle}>Run Simulation</h2>
            <p className={styles.stepDesc}>
              Running 1000 "shots" on the quantum processor. The biased superposition 
              collapses into a distribution of results.
            </p>
            
            <div className={styles.simulationBox}>
              <button 
                className={styles.simBtn} 
                onClick={runSimulation}
                disabled={isSimulating}
              >
                {isSimulating ? 'Running...' : 'Execute on QPU'}
              </button>

              <div className={styles.resultsChart}>
                <div className={styles.barGroup}>
                  <div className={styles.barLabel}>Road A (|0⟩)</div>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ width: `${(counts['0']/1000)*100}%`, background: '#5DA7DB' }} />
                  </div>
                  <div className={styles.barValue}>{counts['0']}</div>
                </div>
                <div className={styles.barGroup}>
                  <div className={styles.barLabel}>Road B (|1⟩)</div>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ width: `${(counts['1']/1000)*100}%`, background: '#C1E1C1' }} />
                  </div>
                  <div className={styles.barValue}>{counts['1']}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 04 — Post-Process</span>
            <h2 className={styles.stepTitle}>The Optimal Decision</h2>
            <p className={styles.stepDesc}>
              We interpret the measurement peak as the optimal light timing. 
              Higher counts mean the quantum system "found" that the cost is lower for that decision.
            </p>
            <div className={styles.outcomePill}>
              Winner: {counts['0'] > counts['1'] ? 'Road A (Prioritized)' : 'Road B (Prioritized)'}
            </div>
            <div className={styles.insight}>
              This bias is encoded in the <strong>Phase Rotation</strong> of the qubit. 
              Move the slider to see how the 3D traffic density changes!
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
          onClick={() => onStepChange(currentStep + 1)}
        >
          {currentStep === 3 ? 'Next Phase →' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
