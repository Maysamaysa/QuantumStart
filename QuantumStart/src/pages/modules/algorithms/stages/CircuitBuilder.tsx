import React, { useState, useCallback } from 'react';
import styles from '../AlgorithmsOverlay.module.css';
import { CircuitScene } from '../components/CircuitScene';
import { GatePalette } from '../components/GatePalette';
import { ModuleCanvas } from '../../../../components/ModuleCanvas';
import type { CircuitGate } from '../algoTypes';

interface CircuitBuilderProps {
  isChallenge?: boolean;
  onComplete: (gates: CircuitGate[]) => void;
}

export function CircuitBuilder({ isChallenge, onComplete }: CircuitBuilderProps): React.JSX.Element {
  const [gates, setGates] = useState<CircuitGate[]>([]);
  const [selectedGateType, setSelectedGateType] = useState<string | null>(null);

  const handlePlaceGate = useCallback((qubit: number, slot: number) => {
    if (!selectedGateType) return;
    const newGate: CircuitGate = {
      id: Math.random().toString(36).substring(2, 9),
      type: selectedGateType,
      qubit,
      slot
    };
    setGates(prev => [...prev, newGate]);
  }, [selectedGateType]);

  const handleRemoveGate = useCallback((id: string) => {
    setGates(prev => prev.filter(g => g.id !== id));
  }, []);

  const handleRun = () => {
    if (gates.length === 0) {
      alert("Place at least one gate to run!");
      return;
    }
    // Simple validation for Grover's if in challenge mode
    if (isChallenge) {
      const hasOracle = gates.some(g => g.type === 'Oracle' && g.slot === 2);
      const hasDiffusion = gates.some(g => g.type === 'Diffusion' && g.slot === 3);
      if (!hasOracle || !hasDiffusion) {
        alert("Grover's algorithm needs an Oracle at slot 2 and Diffusion at slot 3!");
        return;
      }
    }
    onComplete(gates);
  };

  return (
    <div className={styles.stageWrapper} style={{ position: 'relative' }}>
      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ModuleCanvas camera={{ position: [0, 4, 12], fov: 45 }}>
          <CircuitScene 
            gates={gates} 
            onPlaceGate={handlePlaceGate} 
            onRemoveGate={handleRemoveGate} 
            isDraggingType={selectedGateType}
          />
        </ModuleCanvas>
      </div>

      {/* UI Overlays */}
      <GatePalette 
        selectedGate={selectedGateType} 
        onSelectGate={setSelectedGateType} 
      />

      {isChallenge && (
        <div 
          className={styles.glass} 
          style={{ 
            position: 'absolute', top: '100px', right: '40px', width: '300px',
            animation: 'fadeIn 0.8s ease-out'
          }}
        >
          <h3 style={{ marginBottom: '12px' }}>Grover Challenge</h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>
            Build the circuit to locate record |101\u27E9.
            <br />1. Place <strong>Oracle</strong> at slot 2.
            <br />2. Place <strong>Diffusion</strong> at slot 3.
          </p>
        </div>
      )}

      {/* Records Visualization for Grover */}
      {isChallenge && (
        <div style={{ 
          position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '8px'
        }}>
          {[0,1,2,3,4,5,6,7].map(i => {
            const binary = i.toString(2).padStart(3, '0');
            const isTarget = binary === '101';
            const hasCorrectGates = gates.some(g => g.type === 'Oracle' && g.slot === 2);
            return (
              <div 
                key={i}
                className={styles.glass}
                style={{ 
                  width: '60px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', opacity: isTarget && hasCorrectGates ? 1 : 0.4,
                  border: isTarget ? '1.5px solid var(--lotus)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isTarget && hasCorrectGates ? '0 0 20px var(--lotus)' : 'none',
                  transition: 'all 0.5s ease'
                }}
              >
                #{binary}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)' }}>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleRun}
        >
          {isChallenge ? 'Run your quantum search \u2192' : 'Run simulation \u2192'}
        </button>
      </div>
    </div>
  );
}
