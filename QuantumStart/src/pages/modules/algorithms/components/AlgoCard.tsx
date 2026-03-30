import React, { useState } from 'react';
import styles from '../AlgorithmsOverlay.module.css';

interface AlgoCardProps {
  title: string;
  tagline: string;
  difficulty: number;
  circuitPreview: React.ReactNode;
  expandedContent: React.ReactNode;
  onExpand: () => void;
}

export const AlgoCard: React.FC<AlgoCardProps> = ({ 
  title, tagline, difficulty, circuitPreview, expandedContent, onExpand 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) onExpand();
  };

  return (
    <div 
      className={`${styles.glass} ${styles.algoCard} ${isExpanded ? styles.expanded : ''}`}
      onClick={handleToggle}
      style={{ 
        cursor: 'pointer', 
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        height: isExpanded ? 'auto' : '200px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{title}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{tagline}</p>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              style={{ 
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: i <= difficulty ? 'var(--blue-0)' : 'transparent',
                border: '1px solid var(--blue-0)'
              }} 
            />
          ))}
        </div>
      </div>

      {!isExpanded && (
        <div style={{ marginTop: '24px', opacity: 0.6 }}>
          {circuitPreview}
        </div>
      )}

      {isExpanded && (
        <div className={styles.fadeIn} style={{ marginTop: '24px' }} onClick={(e) => e.stopPropagation()}>
          {expandedContent}
        </div>
      )}
    </div>
  );
};
