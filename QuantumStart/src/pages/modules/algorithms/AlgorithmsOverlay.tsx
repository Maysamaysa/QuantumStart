import { useState } from 'react'
import styles from './AlgorithmsOverlay.module.css'
import { type AlgoPhase } from './algoTypes'
import { applyMatrix, getOracleMatrix, getDiffusionMatrix, type CircuitOp } from './circuitLogic'
import { AlgorithmsBuilder } from './AlgorithmsBuilder'
import { ModuleHeader } from '../../../components/ModuleHeader'

interface AlgorithmsOverlayProps {
    phase: AlgoPhase
    winningBox: number
    guessedBox: number | null
    qState?: number[]
    onApplyState?: (newState: number[]) => void
    showAverage?: boolean
    setShowAverage?: (show: boolean) => void
    onComplete: (nextPhase: AlgoPhase) => void
    panelsVisible: boolean
    builderFeedback?: string | null
    onRunCircuit?: (steps: CircuitOp[]) => void
}

const H_TENSOR_H = [
    [0.5, 0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5, -0.5],
    [0.5, -0.5, -0.5, 0.5]
]

interface QuizQuestion {
    question: string
    options: string[]
    correct: number
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: "What happens to the scientific 'Probability' when an amplitude becomes negative?",
        options: ["It becomes negative", "It disappears", "It stays positive (squared)", "It doubles"],
        correct: 2
    },
    {
        question: "How does the Amplifier (Diffusion) boost the winning box?",
        options: ["By adding random noise", "By reflecting states across the average", "By deleting empty boxes", "By guessing again"],
        correct: 1
    },
    {
        question: "Why is Quantum Search better than Classical Search?",
        options: ["It is newer", "It uses more electricity", "It checks all possibilities at once", "It never makes mistakes"],
        correct: 2
    }
]

export function AlgorithmsOverlay({ 
    phase, 
    winningBox, 
    guessedBox, 
    qState = [], 
    onApplyState, 
    showAverage, 
    setShowAverage, 
    onComplete, 
    panelsVisible, 
    builderFeedback, 
    onRunCircuit 
}: AlgorithmsOverlayProps) {
    const [quizIndex, setQuizIndex] = useState(0)
    const [quizFeedback, setQuizFeedback] = useState<string | null>(null)

    const phaseIndex = 
        phase === 'phase0_intro' ? 0 :
        phase === 'phase1_classical' ? 1 : 
        phase === 'phase2_superposition' ? 2 : 
        phase === 'phase3_oracle' ? 3 : 
        phase === 'phase4_amplification' ? 4 : 
        phase === 'phase5_builder' ? 5 : 6

    const getPhaseContent = () => {
        switch (phase) {
            case 'phase0_intro':
                return {
                    title: "Quantum vs Classical",
                    desc: "Classical computers search like a flashlight in a dark room—one spot at a time. Quantum computers search like a floodlight, illuminating everything instantly."
                }
            case 'phase1_classical':
                return {
                    title: "Classical Guesswork",
                    desc: "Try finding the golden treat by clicking boxes. On average, you'll need over 2 tries. It's slow and sequential."
                }
            case 'phase2_superposition':
                return {
                    title: "Water Wave Superposition",
                    desc: "Think of amplitudes like water levels. In superposition, we create a perfectly flat 'pond' where every box has an equal ripple."
                }
            case 'phase3_oracle':
                return {
                    title: "The Oracle's Trough",
                    desc: "The Oracle pushes the target state down, creating a 'trough' (negative amplitude). The height is the same, but the phase is flipped!"
                }
            case 'phase4_amplification':
                return {
                    title: "Amplifying the Splash",
                    desc: "The Amplifier acts like a reflection. By bouncing all states off the average, the 'trough' becomes a massive 'crest', while others flatten out."
                }
            case 'phase5_builder':
                return {
                    title: "Grover's Masterpiece",
                    desc: "Now it's your turn. Chain the gates: Superposition (H) -> Oracle -> Amplifier (Diff) to isolate the prize."
                }
            case 'phase6_quiz':
                return {
                    title: "Knowledge Check",
                    desc: "Let's see if you've mastered the art of the Quantum Search!"
                }
            default:
                return { title: "", desc: "" }
        }
    }

    const { title, desc } = getPhaseContent()

    const handleQuizAnswer = (idx: number) => {
        if (idx === QUIZ_QUESTIONS[quizIndex].correct) {
            setQuizFeedback("Correct! You've got it.")
            setTimeout(() => {
                if (quizIndex < QUIZ_QUESTIONS.length - 1) {
                    setQuizIndex(quizIndex + 1)
                    setQuizFeedback(null)
                } else {
                    onComplete('phase6_quiz')
                }
            }, 1500)
        } else {
            setQuizFeedback("Not quite. Think about how amplitude and probability relate!")
        }
    }

    return (
        <div className={styles.overlayContainer}>
            <ModuleHeader
                moduleNumber={7}
                moduleName="Quantum Algorithms"
                phases={['Intro', 'Setup', 'Super', 'Oracle', 'Amplify', 'Build', 'Quiz']}
                currentPhase={phaseIndex}
            />

            <div className={styles.leftTitlePanel} style={{ opacity: panelsVisible ? 1 : 0 }}>
                <h1>{title}</h1>
                <p>{desc}</p>
                {phase === 'phase0_intro' && (
                    <button className={styles.actionBtn} onClick={() => onComplete('phase0_intro')}>
                        Start Comparison
                    </button>
                )}
            </div>

            <div className={styles.bottomDialog} style={{ opacity: panelsVisible ? 1 : 0 }}>
                {phase === 'phase1_classical' && (
                    <div className={styles.feedback}>
                        {guessedBox === null ? (
                            <p>Pick a box to search classically...</p>
                        ) : (
                            <>
                                {guessedBox === winningBox ? (
                                    <p style={{ color: '#4ade80' }}>✓ Found it! But notice how you had to pick just one.</p>
                                ) : (
                                    <p style={{ color: '#FFB7C5' }}>Empty. In a real-world database of millions, this would take forever!</p>
                                )}
                                <button className={styles.actionBtn} onClick={() => onComplete('phase1_classical')}>Switch to Quantum</button>
                            </>
                        )}
                    </div>
                )}

                {phase === 'phase2_superposition' && (
                    <div className={styles.feedback}>
                        <p>Apply H x H to spread the 'water' evenly across all possible search results.</p>
                        <button className={styles.actionBtn} onClick={() => {
                            if (onApplyState) onApplyState(applyMatrix(H_TENSOR_H, qState))
                            onComplete('phase2_superposition')
                        }}>
                            Create Ripples (H)
                        </button>
                    </div>
                )}

                {phase === 'phase3_oracle' && (
                    <div className={styles.feedback}>
                        {qState[winningBox] > 0 ? (
                            <>
                                <p>The Oracle 'marks' the treat by pushing its amplitude below the surface.</p>
                                <button className={styles.actionBtn} onClick={() => {
                                    if (onApplyState) onApplyState(applyMatrix(getOracleMatrix(winningBox), qState))
                                }}>
                                    Push Down (Oracle)
                                </button>
                            </>
                        ) : (
                            <>
                                <p style={{ color: '#7effdd' }}>The target is now a 'trough'. The probability hasn't changed yet!</p>
                                <button className={styles.actionBtn} onClick={() => onComplete('phase3_oracle')}>
                                    Next: Amplify
                                </button>
                            </>
                        )}
                    </div>
                )}

                {phase === 'phase4_amplification' && (
                    <div className={styles.feedback}>
                        {!showAverage ? (
                            <>
                                <p>Let's find the 'sea level' (average) to prepare for the reflection.</p>
                                <button className={styles.actionBtn} onClick={() => {
                                    if (setShowAverage) setShowAverage(true)
                                }}>
                                    Show Sea Level
                                </button>
                            </>
                        ) : (
                            <>
                                {qState[winningBox] < 0 ? (
                                    <>
                                        <p style={{ color: '#FFD700' }}> Reflecting across the average will boost the trough into a crest!</p>
                                        <button className={styles.actionBtn} onClick={() => {
                                            if (onApplyState) onApplyState(applyMatrix(getDiffusionMatrix(), qState))
                                            if (setShowAverage) setShowAverage(false)
                                        }}>
                                            Reflect & Amplify
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ color: '#4ade80' }}>100% Probability! The wave has crashed into the right answer.</p>
                                        <button className={styles.actionBtn} onClick={() => onComplete('phase4_amplification')}>
                                            Build the Circuit
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}

                {phase === 'phase5_builder' && (
                    <div className={styles.feedback} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                        <AlgorithmsBuilder onRunCircuit={(steps) => onRunCircuit && onRunCircuit(steps)} />
                        {builderFeedback && (
                            <div className={styles.feedback} style={{ marginTop: '15px' }}>
                                <p style={{ color: builderFeedback.includes('Perfect') ? '#4ade80' : '#FFB7C5' }}>
                                    {builderFeedback}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {phase === 'phase6_quiz' && (
                    <div className={styles.feedback}>
                        <p style={{ fontSize: '20px', marginBottom: '25px' }}>{QUIZ_QUESTIONS[quizIndex].question}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => (
                                <button 
                                    key={i} 
                                    className={styles.actionBtn} 
                                    style={{ margin: 0, padding: '12px', fontSize: '14px' }}
                                    onClick={() => handleQuizAnswer(i)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        {quizFeedback && (
                            <p style={{ marginTop: '20px', color: quizFeedback.includes('Correct') ? '#4ade80' : '#FFB7C5' }}>
                                {quizFeedback}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
