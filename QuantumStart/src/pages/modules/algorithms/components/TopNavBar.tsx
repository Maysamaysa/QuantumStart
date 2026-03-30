import React from 'react';
import styles from '../AlgorithmsOverlay.module.css';

interface TopNavBarProps {
  currentStage: number;
  unlockedStages: number[];
  onStageClick: (stage: number) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentStage, unlockedStages, onStageClick }) => {
  const stages = [1, 2, 3, 4, 5, 6];
  const progress = (currentStage / stages.length) * 100;

  return (
    <nav className={styles.navBar}>
      {stages.map((s) => {
        const isUnlocked = unlockedStages.includes(s);
        const isActive = currentStage === s;
        
        return (
          <div 
            key={s}
            className={`
              ${styles.navItem} 
              ${isUnlocked ? styles.unlocked : styles.locked} 
              ${isActive ? styles.active : ''}
            `}
            onClick={() => isUnlocked && onStageClick(s)}
          >
            <div className={styles.dot} />
            <span>Stage {s}</span>
          </div>
        );
      })}
      
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </nav>
  );
};
