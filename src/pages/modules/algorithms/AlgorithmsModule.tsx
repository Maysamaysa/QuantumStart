import { useState, useEffect, useCallback } from 'react';
import styles from './AlgorithmsOverlay.module.css';
import { AlgorithmsScene } from './AlgorithmsScene';
import { AlgorithmsOverlay } from './AlgorithmsOverlay';
import { ExampleOverlay } from './ExampleOverlay';
import { TrafficOverlay } from './TrafficOverlay';
import { useProgress } from '../../../context/ProgressContext';
import { ModuleCanvas } from '../../../components/ModuleCanvas';
import { ModuleHeader } from '../../../components/ModuleHeader';

/**
 * AlgorithmsModule.tsx
 * Three-phase interactive module:
 *   Phase 0 — Theory of Quantum Programming
 *   Phase 1 — Traffic Light Optimization (1-qubit)
 *   Phase 2 — Task Scheduling (QUBO/Annealing)
 */

const PHASE_NAMES = ['Theory', 'Traffic Light', 'Task Schedule'];

export function AlgorithmsModule() {
  const { completeModule } = useProgress();

  const [phase, setPhase] = useState(0); 
  const [currentStep, setCurrentStep] = useState(0);
  const [trafficWeight, setTrafficWeight] = useState(50); // Lifted for 3D sync

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('qm7_v3'); // Incrementing version for safety
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.phase === 'number') setPhase(parsed.phase);
        if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
        if (typeof parsed.trafficWeight === 'number') setTrafficWeight(parsed.trafficWeight);
      } catch (e) {
        console.error("Failed to load module 7 state", e);
      }
    }
  }, []);

  const saveState = useCallback((p: number, step: number, weight?: number) => {
    localStorage.setItem('qm7_v3', JSON.stringify({ 
      phase: p, 
      currentStep: step, 
      trafficWeight: weight ?? trafficWeight 
    }));
  }, [trafficWeight]);

  // Phase 0 (theory): 4 steps
  const handleTheoryStepChange = (step: number) => {
    if (step < 0) return;
    if (step > 3) {
      setPhase(1);
      setCurrentStep(0);
      saveState(1, 0);
      return;
    }
    setCurrentStep(step);
    saveState(0, step);
  };

  // Phase 1 (Traffic Light Example): 4 steps
  const handleTrafficStepChange = (step: number) => {
    if (step < 0) {
      setPhase(0);
      setCurrentStep(3);
      saveState(0, 3);
      return;
    }
    if (step > 3) {
      setPhase(2);
      setCurrentStep(0);
      saveState(2, 0);
      return;
    }
    setCurrentStep(step);
    saveState(1, step);
  };

  const handleTrafficWeightChange = (weight: number) => {
    setTrafficWeight(weight);
    saveState(phase, currentStep, weight);
  };

  // Phase 2 (Task Schedule Example): 3 steps
  const handleTaskStepChange = (step: number) => {
    if (step < 0) {
      setPhase(1);
      setCurrentStep(3);
      saveState(1, 3);
      return;
    }
    if (step > 5) return;
    if (step === 5) {
      completeModule('algorithms', 'blue', true);
    }
    setCurrentStep(step);
    saveState(2, step);
  };

  const handleReset = useCallback(() => {
    localStorage.removeItem('qm7_v3');
    setPhase(0);
    setCurrentStep(0);
  }, []);

  const handlePhaseChange = (newPhase: number) => {
    setPhase(newPhase);
    setCurrentStep(0);
  };

  return (
    <div className={styles.overlayContainer}>
      <ModuleHeader 
        moduleNumber={7} 
        moduleName="Quantum Programs"
        phases={PHASE_NAMES}
        currentPhase={phase}
        onPhaseChange={handlePhaseChange}
      />

      {/* 3D Scene Layer — Transparent and Layered correctly for global background */}
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 0, 
        pointerEvents: 'none'
      }}>
        <ModuleCanvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ alpha: true }}>
          <AlgorithmsScene 
            currentStep={currentStep} 
            phase={phase} 
            trafficWeight={trafficWeight}
          />
        </ModuleCanvas>
      </div>

      {/* 2D UI Overlay Layer */}
      {phase === 0 && (
        <AlgorithmsOverlay 
          currentStep={currentStep}
          onStepChange={handleTheoryStepChange}
        />
      )}
      {phase === 1 && (
        <TrafficOverlay
          currentStep={currentStep}
          onStepChange={handleTrafficStepChange}
          trafficWeight={trafficWeight}
          onWeightChange={handleTrafficWeightChange}
        />
      )}
      {phase === 2 && (
        <ExampleOverlay
          currentStep={currentStep}
          onStepChange={handleTaskStepChange}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
