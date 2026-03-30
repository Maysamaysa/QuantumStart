import { useState, useEffect, useCallback } from 'react';
import styles from './AlgorithmsOverlay.module.css';
import { TopNavBar } from './components/TopNavBar';
import { ConceptBridge } from './stages/ConceptBridge';
import { AlgoLibrary } from './stages/AlgoLibrary';
import { CircuitBuilder } from './stages/CircuitBuilder';
import { SimulationZone } from './stages/SimulationZone';
import { SoloChallenge } from './stages/SoloChallenge';
import { useProgress } from '../../../context/ProgressContext';
import { useModuleCatSetup } from '../../../hooks/useModuleCatSetup';
import type { CircuitGate } from './algoTypes';

export function AlgorithmsModule() {
  const { completeModule } = useProgress();
  useModuleCatSetup('hidden', 'idle');

  // Module State
  const [stage, setStage] = useState(1);
  const [unlocked, setUnlocked] = useState([1]);
  const [circuitGates, setCircuitGates] = useState<CircuitGate[]>([]);

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem('qm7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStage(parsed.stage || 1);
        setUnlocked(parsed.unlocked || [1]);
        setCircuitGates(parsed.circuit?.gates || []);
      } catch (e) {
        console.error("Failed to load algorithms state", e);
      }
    }
  }, []);

  const saveState = useCallback((newStage: number, newUnlocked: number[], newGates: CircuitGate[]) => {
    const state = {
      stage: newStage,
      unlocked: newUnlocked,
      circuit: { gates: newGates }
    };
    localStorage.setItem('qm7', JSON.stringify(state));
  }, []);

  const handleStageComplete = (nextStage: number) => {
    const newUnlocked = Array.from(new Set([...unlocked, nextStage]));
    setUnlocked(newUnlocked);
    setStage(nextStage);
    saveState(nextStage, newUnlocked, circuitGates);
  };

  const handleCircuitComplete = (gates: CircuitGate[]) => {
    setCircuitGates(gates);
    handleStageComplete(5); // Move to simulation
  };

  const handleFinalComplete = () => {
    completeModule('algorithms', 'blue');
    saveState(6, unlocked, circuitGates);
  };

  const renderStage = () => {
    switch (stage) {
      case 1: return <ConceptBridge onComplete={() => handleStageComplete(2)} />;
      case 2: return <AlgoLibrary onComplete={() => handleStageComplete(3)} />;
      case 3: return <CircuitBuilder onComplete={handleCircuitComplete} />;
      case 4: return <CircuitBuilder isChallenge onComplete={handleCircuitComplete} />;
      case 5: return <SimulationZone gates={circuitGates} onComplete={() => handleStageComplete(6)} />;
      case 6: return <SoloChallenge onComplete={handleFinalComplete} />;
      default: return <ConceptBridge onComplete={() => handleStageComplete(2)} />;
    }
  };

  return (
    <div className={styles.overlayContainer} style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', pointerEvents: 'auto' }}>
      <TopNavBar 
        currentStage={stage} 
        unlockedStages={unlocked} 
        onStageClick={(s) => setStage(s)} 
      />
      
      <main style={{ width: '100%', height: '100%' }}>
        {renderStage()}
      </main>
    </div>
  );
}
