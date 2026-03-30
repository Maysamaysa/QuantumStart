import { useState } from 'react';
import styles from '../AlgorithmsOverlay.module.css';
import { BadgeUnlock } from '../components/BadgeUnlock';

interface SoloChallengeProps {
    onComplete: () => void;
}

export function SoloChallenge({ onComplete }: SoloChallengeProps) {
    const [quizState, setQuizState] = useState<'question' | 'unlock'>('question');
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleAnswer = (correct: boolean) => {
        if (correct) {
            setFeedback("Correct! You've mastered quantum amplitude amplification.");
            setTimeout(() => setQuizState('unlock'), 1500);
        } else {
            setFeedback("Not quite. Remember that the Diffusion operator reflects amplitudes around the average.");
        }
    };

    if (quizState === 'unlock') {
        return <BadgeUnlock onFinish={onComplete} />;
    }

    return (
        <div className={styles.stageWrapper}>
            <div className={`${styles.glass} ${styles.fadeIn}`} style={{ maxWidth: '600px', padding: '40px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Master Challenge</h2>
                <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                    Final verification: In Grover\u0027s Algorithm, what happens to the target state\u0027s amplitude after the Oracle and Diffusion steps?
                </p>

                <div style={{ display: 'grid', gap: '12px' }}>
                    <button 
                        className={styles.btn} 
                        style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', padding: '20px' }}
                        onClick={() => handleAnswer(false)}
                    >
                        A) It is deleted from the superposition
                    </button>
                    <button 
                        className={styles.btn} 
                        style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', padding: '20px' }}
                        onClick={() => handleAnswer(true)}
                    >
                        B) It is amplified using constructive interference
                    </button>
                    <button 
                        className={styles.btn} 
                        style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', padding: '20px' }}
                        onClick={() => handleAnswer(false)}
                    >
                        C) It remains constant while others decrease
                    </button>
                </div>

                {feedback && (
                    <div style={{ 
                        marginTop: '24px', padding: '16px', borderRadius: '8px',
                        background: feedback.includes('Correct') ? 'rgba(93, 167, 219, 0.1)' : 'rgba(232, 89, 60, 0.1)',
                        color: feedback.includes('Correct') ? 'var(--blue-0)' : 'var(--lotus)',
                        border: `1px solid ${feedback.includes('Correct') ? 'var(--blue-0)' : 'var(--lotus)'}`
                    }}>
                        {feedback}
                    </div>
                )}
            </div>
        </div>
    );
}
