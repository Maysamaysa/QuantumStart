import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AlgorithmsOverlay.module.css';
import type { AlgoPhase } from './algoTypes';

interface AlgorithmsOverlayProps {
  phase: AlgoPhase;
  onComplete: (nextPhase: AlgoPhase) => void;
  visible: boolean;
}

const QUIZ_QUESTIONS = [
  {
    question: "Which pattern best describes the Oracle in Grover's algorithm?",
    options: ["It marks the solution with a phase flip", "It sorts the qubits alphabetically", "It deletes incorrect states", "It measures only the target wire"],
    correct: 0
  },
  {
    question: "What is the primary benefit of Deutsch-Jozsa?",
    options: ["Finding a password", "Determining function properties in one query", "Factoring large primes", "Optimizing wave functions"],
    correct: 1
  }
];

export function AlgorithmsOverlay({ phase, onComplete, visible }: AlgorithmsOverlayProps) {
  const navigate = useNavigate();
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  if (!visible) return null;

  if (phase === 'complete') {
    return (
      <div className={styles.stageWrapper}>
        <div className={styles.glass} style={{ maxWidth: '500px', textAlign: 'center', padding: '48px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Course Mastery!</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
            You\u0027ve navigated the depths of quantum amplitude amplification and oracle logic.
          </p>
          <button className={styles.btnPrimary} style={{ padding: '12px 24px' }} onClick={() => navigate('/learn')}>Return to Hub</button>
        </div>
      </div>
    );
  }

  const handleQuizAnswer = (idx: number) => {
    if (idx === QUIZ_QUESTIONS[quizIndex].correct) {
      setQuizFeedback("Correct! Masterful understanding.");
      setTimeout(() => {
        if (quizIndex < QUIZ_QUESTIONS.length - 1) {
          setQuizIndex(quizIndex + 1);
          setQuizFeedback(null);
        } else {
          onComplete('complete');
        }
      }, 1500);
    } else {
      setQuizFeedback("Not quite. The Oracle specifically identifies state properties.");
    }
  };

  return (
    <div className={styles.overlayContainer}>
      {phase === 'stage6_solo_challenge' && (
        <div className={styles.bottomDialog}>
          <div className={styles.feedback}>
            <p style={{ fontSize: '18px', marginBottom: '20px', color: '#fff' }}>{QUIZ_QUESTIONS[quizIndex].question}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => (
                <button 
                  key={i} 
                  className={styles.btn} 
                  style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '16px' }}
                  onClick={() => handleQuizAnswer(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizFeedback && (
              <p style={{ marginTop: '20px', color: quizFeedback.includes('Correct') ? 'var(--blue-0)' : 'var(--lotus)' }}>
                {quizFeedback}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
