import React from 'react';
import styles from '../AlgorithmsOverlay.module.css';

interface GatePaletteProps {
  onSelectGate: (type: string | null) => void;
  selectedGate: string | null;
}

export const GatePalette: React.FC<GatePaletteProps> = ({ onSelectGate, selectedGate }) => {
  const gates = [
    { type: 'H', label: 'H', color: '#5DA7DB', desc: 'Hadamard — creates superposition' },
    { type: 'X', label: 'X', color: '#A67B5B', desc: 'Pauli-X — quantum NOT' },
    { type: 'Oracle', label: 'O', color: '#FFB7C5', desc: 'Oracle — marks the target state' },
    { type: 'Diffusion', label: 'D', color: '#C1E1C1', desc: 'Grover amplitude amplification' },
    { type: 'Z', label: 'Z', color: '#10b981', desc: 'Pauli-Z — phase flip' },
  ];

  return (
    <div 
      className={styles.glass} 
      style={{ 
        position: 'absolute', 
        left: '40px', 
        top: '120px', 
        width: '100px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        padding: '20px',
        zIndex: 50
      }}
    >
      <div style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', marginBottom: '8px' }}>GATES</div>
      {gates.map((g) => (
        <div 
          key={g.type}
          className={`${styles.gateChip} ${selectedGate === g.type ? styles.selected : ''}`}
          onClick={() => onSelectGate(selectedGate === g.type ? null : g.type)}
          title={g.desc}
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '12px', 
            border: `1px solid ${g.color}66`,
            background: selectedGate === g.type ? `${g.color}33` : 'transparent',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: g.color,
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: selectedGate === g.type ? `0 0 15px ${g.color}44` : 'none'
          }}
        >
          {g.label}
        </div>
      ))}
    </div>
  );
};
