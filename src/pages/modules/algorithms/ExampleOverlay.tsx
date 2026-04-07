import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExampleOverlay.module.css';
import { EnergyHistogram } from './components/EnergyHistogram';

export interface ExampleOverlayProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onReset: () => void;
}

export function ExampleOverlay({ currentStep, onStepChange, onReset }: ExampleOverlayProps) {
  const navigate = useNavigate();

  // --- STATE FOR MANUAL CHALLENGE ---
  const [manualState, setManualState] = useState<Record<string, number>>({
    'A': 0, // 0 = Morning, 1 = Afternoon
    'B': 1,
    'C': 0
  });

  const TASKS = ['A', 'B', 'C'];
  const SLOTS = ['Morning', 'Afternoon'];

  const calculateConflicts = (state: Record<string, number>) => {
    const list: string[] = [];
    let energy = 0;
    
    // Reward for each assignment (simplified linear term)
    energy -= (Object.keys(state).length);

    // Constraint 1: A and B cannot be in the same slot
    if (state['A'] === state['B']) {
      list.push('Task A & B Conflict');
      energy += 10.0;
    }
    // Constraint 2: B and C cannot be in the same slot
    if (state['B'] === state['C']) {
      list.push('Task B & C Conflict');
      energy += 10.0;
    }
    
    return { list, energy };
  };

  const { list: conflicts, energy: currentEnergy } = calculateConflicts(manualState);

  // --- NAVIGATION ---
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
    { label: 'Scenario', color: '#5DA7DB' },
    { label: 'Mapping', color: '#FFB7C5' },
    { label: 'Manual Solve', color: '#C1E1C1' },
    { label: 'Quantum Search', color: '#5DA7DB' },
    { label: 'Results', color: '#5DA7DB' },
  ];

  const MOCK_HISTOGRAM_DATA = [
    { bitstring: '010', energy: -3, probability: 0.82 },
    { bitstring: '101', energy: -3, probability: 0.14 },
    { bitstring: '000', energy: 7, probability: 0.02 },
    { bitstring: '111', energy: 7, probability: 0.01 },
    { bitstring: '011', energy: 7, probability: 0.005 },
    { bitstring: '110', energy: 7, probability: 0.003 },
    { bitstring: '001', energy: 17, probability: 0.002 },
  ];

  if (currentStep === 5) {
    return (
      <div className={styles.completionOverlay}>
        <div className={styles.completeCard}>
          <div className={styles.badgeGlow}>🏆</div>
          <h1 className={styles.completeTitle}>Quantum Architect</h1>
          <p className={styles.completeDesc}>
            Congratulations! You've successfully built and executed a quantum algorithm to solve a real-world scheduling problem.
          </p>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statVal}>100%</div>
              <div className={styles.statLab}>Accuracy</div>
            </div>
            <div className={styles.statItem}>
               <div className={styles.statVal}>3</div>
               <div className={styles.statLab}>Qubits Used</div>
            </div>
          </div>
          <button className={styles.hubBtn} onClick={() => {
            onReset();
            navigate('/learn');
          }}>
            Return to Learning Hub →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} onWheel={handleWheel}>
      {/* ─── PHASE LABEL ─── */}
      <div className={styles.phaseLabel}>
        <span className={styles.phaseBadge}>Phase 3: Real-world Mapping</span>
        <span className={styles.phaseTitle}>QUBO & Optimization</span>
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
            <span className={styles.stepTag}>Step 01 — Scenario</span>
            <h2 className={styles.stepTitle}>Resource Conflict</h2>
            <p className={styles.stepDesc}>
              Imagine you have <strong>Tasks A, B, and C</strong> and two slots: 
              <strong>Morning</strong> and <strong>Afternoon</strong>.
            </p>
            <div style={{ padding: '1.2rem', background: 'rgba(255, 100, 100, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 100, 100, 0.2)', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#ff8888' }}>❌ <strong>Constraint:</strong> Task A & B cannot be together.</p>
              <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#ff8888' }}>❌ <strong>Constraint:</strong> Task B & C cannot be together.</p>
            </div>
            
            <button className={styles.actionBtn} onClick={() => onStepChange(2)}>
              Try Solving by Hand →
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 02 — Mapping</span>
            <h2 className={styles.stepTitle}>The QUBO Plan</h2>
            <p className={styles.stepDesc}>
              We map decisions to binary variables (<strong>0 or 1</strong>). 
              A <strong>QUBO Matrix</strong> defines the "cost" of every pair of tasks.
            </p>

            <div className={styles.quboMatrix}>
              <div style={{ fontSize: '0.6rem', color: '#5DA7DB', marginBottom: '8px', textTransform: 'uppercase' }}>Sample QUBO Weights</div>
              <table className={styles.quboTable}>
                <thead>
                  <tr>
                    <th></th><th>QA</th><th>QB</th><th>QC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>QA</td><td>-1</td><td><span className={styles.quboVal}>+10</span></td><td>0</td></tr>
                  <tr><td>QB</td><td><span className={styles.quboVal}>+10</span></td><td>-1</td><td><span className={styles.quboVal}>+10</span></td></tr>
                  <tr><td>QC</td><td>0</td><td><span className={styles.quboVal}>+10</span></td><td>-1</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.insightPill}>
              <strong>Quantum Insight:</strong> By setting high costs for conflicts, the system 
              is naturally pushed toward the <strong>Ground State</strong>.
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 03 — Challenge</span>
            <h2 className={styles.stepTitle}>Interactive Solve</h2>
            <p className={styles.stepDesc}>
              Assign tasks. The <strong>Energy</strong> increases every time you violate a constraint.
            </p>
            
            <div className={styles.assignmentGrid}>
              <div className={styles.gridHeader}>
                <div className={styles.gridCorner}></div>
                <div className={styles.slotLabel}>Morning</div>
                <div className={styles.slotLabel}>Afternoon</div>
              </div>
              {TASKS.map(task => (
                <div key={task} className={styles.gridRow}>
                  <div className={styles.taskLabel}>Task {task}</div>
                  {SLOTS.map((_s, slotIdx) => (
                    <button 
                      key={slotIdx}
                      className={`${styles.gridCell} ${manualState[task] === slotIdx ? styles.gridCellActive : ''}`}
                      onClick={() => setManualState({...manualState, [task]: slotIdx})}
                    >
                      {manualState[task] === slotIdx ? '✓' : ''}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem' }}>
              <div style={{ flex: 1, padding: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Current Energy</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: currentEnergy > 0 ? '#ff6464' : '#C1E1C1' }}>{currentEnergy.toFixed(1)}</div>
              </div>
            </div>

            {conflicts.length > 0 ? (
              <div style={{ padding: '12px', color: '#ff8888', background: 'rgba(255,100,100,0.1)', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid rgba(255,100,100,0.2)' }}>
                ⚠️ {conflicts[0]} (Penalty +10)
              </div>
            ) : (
              <div style={{ padding: '12px', color: '#C1E1C1', background: 'rgba(193,225,193,0.1)', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid rgba(193,225,193,0.2)', textAlign: 'center' }}>
                ✨ <strong>Optimal State Found!</strong>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 04 — Annealing</span>
            <h2 className={styles.stepTitle}>Quantum Search</h2>
            <p className={styles.stepDesc}>
              The computer explores all possible schedules at once using an <strong>Energy Function</strong>.
            </p>

            <div className={styles.formula}>
              <div style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '8px', textTransform: 'uppercase' }}>Final QUBO Energy Form</div>
              E(x) = ∑ Qᵢᵢxᵢ + ∑ Qᵢⱼxᵢxⱼ
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.6 }}>
                • <strong>Linear Terms (Qᵢᵢ):</strong> Benefits or costs of individual tasks.<br/>
                • <strong>Quadratic Terms (Qᵢⱼ):</strong> Interactions (like the +10 penalty for conflicts).
              </p>
            </div>

            <p className={styles.note}>
              The system "cools" down to find the configuration with the <strong>lowest energy</strong>.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '1.5rem', borderRadius: '40px', marginTop: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#5DA7DB', boxShadow: '0 0 10px #5DA7DB' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFB7C5', boxShadow: '0 0 10px #FFB7C5' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#C1E1C1', boxShadow: '0 0 10px #C1E1C1' }} />
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Searching Deep Valleys...</span>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className={styles.stepContent}>
            <span className={styles.stepTag}>Step 05 — Statistics</span>
            <h2 className={styles.stepTitle}>Final Results</h2>
            <p className={styles.stepDesc}>
              After many runs, the "Ground State" (the lowest energy) appears most frequently.
            </p>
            
            <EnergyHistogram states={MOCK_HISTOGRAM_DATA} />

            <div style={{ marginTop: '2rem', background: 'rgba(93, 167, 219, 0.05)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(93, 167, 219, 0.1)' }}>
              <div style={{ fontSize: '0.65rem', color: '#5DA7DB', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 800 }}>Ground State Breakup</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                Bitstring <strong>010</strong> (A and C in Morning, B in Afternoon).<br/>
                <strong>Total Energy:</strong> -3 (tasks done) + 0 (conflicts) = <strong>-3</strong>
              </div>
            </div>
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
          onClick={() => {
            if (currentStep === 4) onStepChange(5);
            else onStepChange(currentStep + 1);
          }}
        >
          {currentStep === 4 ? 'Finish Module ✅' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
