import React from 'react';
import styles from '../AlgorithmsOverlay.module.css';

interface SoloChallengeProps {
  onComplete: () => void;
}

export function SoloChallenge({ onComplete }: SoloChallengeProps): React.JSX.Element {
  return (
    <div className={styles.stageWrapper} style={{ flexDirection: 'column', padding: '40px' }}>
      <div className={styles.glass} style={{ maxWidth: '600px', textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🏆</div>
        <h2 style={{ fontSize: '32px', marginBottom: '16px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Mastery Challenge</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px', fontSize: '18px', lineHeight: '1.6' }}>
          You've explored the building blocks and witnessed Grover's Search in action. 
          Are you ready to prove your quantum intuition?
        </p>
        
        <div style={{ textAlign: 'left', marginBottom: '32px', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '12px', color: 'var(--blue-0)' }}>Next Steps:</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '15px', color: 'var(--text)' }}>
            <li style={{ marginBottom: '8px' }}>• Complete the final proficiency test</li>
            <li style={{ marginBottom: '8px' }}>• Unlock the "Algorithm Architect" badge</li>
            <li style={{ marginBottom: '8px' }}>• Gain full access to the Quantum Playground</li>
          </ul>
        </div>

        <button 
          className={`${styles.btn} ${styles.btnPrimary} ${styles.fadeIn}`}
          onClick={onComplete}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Begin Assessment →
        </button>
      </div>
    </div>
  );
}
