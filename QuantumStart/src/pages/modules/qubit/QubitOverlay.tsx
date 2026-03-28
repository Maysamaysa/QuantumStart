/**
 * QubitOverlay.tsx — all HTML panels for "What is a Qubit?"
 * (Moved to src/pages/qubit/)
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTypewriter } from '../../../hooks/useTypewriter'
import styles from './QubitOverlay.module.css'
import type { Track, Phase } from './QubitScene'
import { ModuleHeader } from '../../../components/ModuleHeader'

// ─── LESSON CONTENT ───────────────────────────────────────────────────────────
const BLUE_PANELS = [
    { 
        text: "Meet the Classical Bit. Like this coin, it's always in one of two states: Heads (0) or Tails (1). Deterministic, simple, and limited.", 
        hint: "Flip the coin on the left. See how it's always definitively 0 or 1?" 
    },
    { 
        text: "Now, look at the Qubit. While the coin is stuck in one state, the Qubit explores both possibilities at once. This is Superposition.", 
        hint: "The 'ghost' spheres around the qubit show it taking all paths simultaneously." 
    },
    { 
        text: "A qubit isn't 'somewhere in between' 0 and 1. It is a mathematical combination of both, existing in a cloud of probability.", 
        hint: "Click the qubit to witness its 'collapse' into a single classical state." 
    },
    { 
        text: "In the quantum world, we don't just choose a path. We explore all of them until the moment of measurement.", 
        hint: "Try resetting the qubit and collapsing it again. Notice the randomness?" 
    },
]

const AMBER_PANELS = [
    { 
        text: "Mathematically, we describe a qubit's state |ψ⟩ as a vector in a complex Hilbert space. Let's break down the superposition equation.",
        hint: "Look at the floating equation above the qubit."
    },
    { 
        text: "The state |ψ⟩ is a linear combination of the basis states |0⟩ and |1⟩. These are the fixed 'poles' of our quantum world.",
        hint: "The coefficients α and β are what make quantum computing so powerful."
    },
    { 
        text: "α (Alpha) and β (Beta) are probability amplitudes. They aren't just probabilities—they are complex numbers that can interfere with each other.",
        hint: "The probability of measuring |0⟩ is |α|², and for |1⟩ it's |β|²."
    },
    { 
        text: "The constraint |α|² + |β|² = 1 ensures that when we measure, we always find the qubit in *some* state. Total probability must be 1.",
        hint: "Click the qubit to see it collapse. The equation will disappear as the state becomes definite."
    },
]

// ─── QUIZ CONTENT ─────────────────────────────────────────────────────────────
type QuizAnswer = { label: string; correct: boolean }
interface QuizQuestion {
    question: string
    answers?: QuizAnswer[]
    isObserver?: boolean
    explanation: string
    tracks: ('blue' | 'amber')[]
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: "What is the key visual difference between the coin and the qubit in this scene?",
        answers: [
            { label: "A) The coin is larger", correct: false },
            { label: "B) The qubit shows multiple 'ghost' paths at once", correct: true },
            { label: "C) The coin is made of gold", correct: false },
            { label: "D) There is no difference", correct: false },
        ],
        explanation: "The 'ghost' trail represents superposition—the qubit's ability to explore all paths simultaneously, unlike the classical coin which is always in one state.",
        tracks: ['blue', 'amber'],
    },
    {
        question: "In the equation |ψ⟩ = α|0⟩ + β|1⟩, what does |α|² represent?",
        answers: [
            { label: "A) The speed of the qubit", correct: false },
            { label: "B) The probability of measuring the state |0⟩", correct: true },
            { label: "C) The phase of the qubit", correct: false },
            { label: "D) A random constant", correct: false },
        ],
        explanation: "The square of the absolute value of the coefficient α gives the probability of the qubit collapsing into the |0⟩ state upon measurement.",
        tracks: ['amber'],
    },
    {
        question: "Click the object that demonstrates 'Quantum Parallelism' by being in two states at once.",
        isObserver: true,
        explanation: "The glowing sphere is your qubit—it holds a superposition until measured. The coin is always classical: either 0 or 1.",
        tracks: ['blue', 'amber'],
    },
]

// ─── TRACK SELECTOR ───────────────────────────────────────────────────────────
function TrackSelector({ panelsVisible, onTrackSelect }: { panelsVisible: boolean; onTrackSelect: (t: 'blue' | 'amber') => void }) {
    return (
        <div className={`${styles.panel} ${styles.trackSelector} ${panelsVisible ? styles.panelVisible : ''}`}>
            <p className={styles.trackTitle}>Module 1: Foundations</p>
            <h2 className={styles.trackHeadline}>What is a Qubit?</h2>
            <p className={styles.trackDescription}>Choose how you'd like to explore the quantum world.</p>
            <div className={styles.trackBtnRow}>
                <button className={`${styles.trackBtn} ${styles.trackBtnBlue}`} onClick={() => onTrackSelect('blue')} id="track-blue-btn">
                    <div className={styles.pathSphere} /> Intuition
                    <span className={styles.btnSub}>Visual & Concepts</span>
                </button>
                <button className={`${styles.trackBtn} ${styles.trackBtnAmber}`} onClick={() => onTrackSelect('amber')} id="track-amber-btn">
                    <div className={styles.pathSphere} /> Technical
                    <span className={styles.btnSub}>Math & Vectors</span>
                </button>
            </div>
        </div>
    )
}

// ─── CAT DIALOGUE BUBBLE ─────────────────────────────────────────────────────
const TRACK_DIALOGUE: Record<'blue' | 'amber', string> = {
    blue: "Classical coins are boring. Let's see some quantum chaos.",
    amber: "Mathematics is the language of the universe. Let's start with the vector space.",
}

function CatDialogueBubble({ track, panelsVisible }: { track: Track; panelsVisible: boolean }) {
    if (!track) return null
    const { displayed, finished, skip } = useTypewriter(TRACK_DIALOGUE[track], 36, panelsVisible)
    return (
        <div 
            className={`${styles.panel} ${styles.catDialogue} ${track === 'amber' ? styles.amberTrack : ''} ${panelsVisible ? styles.panelVisible : ''}`}
            onClick={() => !finished && skip()}
            style={{ cursor: finished ? 'default' : 'pointer' }}
        >
            <div className={styles.catLabel}>Quantum Cat:</div>
            <div className={styles.catText}>
                {displayed}
                {!finished && <span className={styles.cursor}>▊</span>}
            </div>
        </div>
    )
}

// ─── LESSON PANELS ────────────────────────────────────────────────────────────
function LessonPanels({ track, panelsVisible, onComplete, setEquationStep }: { 
    track: Track; panelsVisible: boolean; onComplete: () => void; setEquationStep: (s: number) => void 
}) {
    const [panelIndex, setPanelIndex] = useState(0)
    
    const panels = track === 'amber' ? AMBER_PANELS : BLUE_PANELS
    const current = panels[panelIndex]
    const isLast = panelIndex >= panels.length - 1
    const isAmber = track === 'amber'

    useEffect(() => { 
        setPanelIndex(0)
        setEquationStep(-1)
    }, [track, setEquationStep])

    useEffect(() => {
        // Map panelIndex to equation steps for Amber track
        if (isAmber) {
            if (panelIndex === 0) setEquationStep(0) // |psi>
            else if (panelIndex === 1) setEquationStep(3) // |0>
            else if (panelIndex === 2) setEquationStep(5) // beta
            else if (panelIndex === 3) setEquationStep(6) // |1>
        } else {
            setEquationStep(-1)
        }
    }, [panelIndex, isAmber, setEquationStep])

    const { displayed, finished, skip } = useTypewriter(current?.text ?? '', 32, panelsVisible)
    
    const handleNext = () => {
        if (isLast) {
            setEquationStep(-1)
            onComplete()
        } else {
            setPanelIndex(i => i + 1)
        }
    }

    if (!track) return null
    return (
        <div className={`${styles.panel} ${styles.lessonPanel} ${panelsVisible ? styles.panelVisible : ''}`}>
            <div className={styles.lessonHeader}>
                <span className={styles.lessonStep}> STEP {panelIndex + 1} / {panels.length}</span>
                <span className={`${styles.lessonTrackBadge} ${track === 'amber' ? styles.amberBadge : styles.blueBadge}`}>
                    {track === 'blue' ? '🔵 Intuition' : '🟡 Technical'}
                </span>
            </div>
            <div 
                onClick={() => !finished && skip()}
                style={{ cursor: finished ? 'default' : 'pointer', minHeight: '80px' }}
            >
                <p className={styles.lessonText}>
                    {displayed as string}
                    {!finished && <span className={styles.cursor}>▊</span>}
                </p>
            </div>
            {current.hint && (
                <p className={styles.lessonHint}>
                    <span className={styles.hintIcon}>💡</span> {current.hint}
                </p>
            )}
            <div className={styles.lessonNav}>
                <div className={styles.navDots}>
                    {panels.map((_, i) => <div key={i} className={`${styles.navDot} ${i === panelIndex ? styles.navDotActive : ''}`} />)}
                </div>
                <button className={styles.nextBtn} onClick={handleNext} id={`lesson-next-${panelIndex}`}>
                    {isLast ? 'Take the Quiz →' : 'Continue →'}
                </button>
            </div>
        </div>
    )
}

// ─── COMPARE PANEL ────────────────────────────────────────────────────────────
function ComparePanel({ panelsVisible, onCompareComplete, coinClicked, qubitClicked }: {
    panelsVisible: boolean, onCompareComplete: () => void, coinClicked: boolean, qubitClicked: boolean
}) {
    const bothClicked = coinClicked && qubitClicked;
    return (
        <div className={`${styles.panel} ${styles.comparePanel} ${panelsVisible ? styles.panelVisible : ''}`}>
            <div className={styles.lessonHeader}>
                <span className={styles.lessonStep}>INTERACTIVE SANDBOX</span>
            </div>
            <p className={styles.compareText}>
                Let's put them side-by-side. The Classical Coin is grounded in one state (either 0 or 1). 
                The Quantum Qubit explores both 0 & 1 simultaneously in a state of <strong>Superposition</strong> until measured.
            </p>
            <div className={styles.checkboxList}>
                <div className={`${styles.checkboxRow} ${coinClicked ? styles.checkboxRowChecked : ''}`}>
                    <div className={`${styles.checkboxSquare} ${coinClicked ? styles.checkboxSquareChecked : ''}`}>
                        {coinClicked ? '✓' : ''}
                    </div>
                    <span className={styles.checkboxLabel}>Flip the Classical Bit (Coin)</span>
                </div>
                <div className={`${styles.checkboxRow} ${qubitClicked ? styles.checkboxRowChecked : ''}`}>
                    <div className={`${styles.checkboxSquare} ${qubitClicked ? styles.checkboxSquareChecked : ''}`}>
                        {qubitClicked ? '✓' : ''}
                    </div>
                    <span className={styles.checkboxLabel}>Measure the Quantum Qubit</span>
                </div>
            </div>
            <button 
                className={`${styles.nextBtn} ${!bothClicked ? styles.compareBtnDisabled : ''}`} 
                onClick={() => bothClicked && onCompareComplete()} 
                disabled={!bothClicked}
                id="compare-next-btn"
            >
                {bothClicked ? 'Continue to Knowledge Check →' : 'Click both to continue'}
            </button>
        </div>
    )
}

// ─── QUIZ PANEL ───────────────────────────────────────────────────────────────
function QuizPanel({ track, panelsVisible, onComplete, onAllCorrect, sphereClicked }: {
    track: Track; panelsVisible: boolean; onComplete: (correct: boolean) => void; onAllCorrect: () => void; sphereClicked?: boolean
}) {
    const [qIndex, setQIndex] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [retries, setRetries] = useState(0)
    const [showExplanation, setShowExplanation] = useState(false)
    const [answered, setAnswered] = useState(false)
    const [observerResult, setObserverResult] = useState<boolean | null>(null)
    const MAX_RETRIES = 2

    const questions = QUIZ_QUESTIONS.filter(q => track ? q.tracks.includes(track) : false)
    const currentQ = questions[qIndex]
    const isLastQ = qIndex >= questions.length - 1

    useEffect(() => {
        if (!sphereClicked || !currentQ?.isObserver || answered) return
        setObserverResult(true); setAnswered(true); onComplete(true)
    }, [sphereClicked, currentQ, answered, onComplete])

    const handleAnswer = (idx: number) => {
        if (answered || !currentQ.answers) return
        const correct = currentQ.answers[idx].correct
        setSelected(idx)
        if (correct) { setAnswered(true); onComplete(true) }
        else {
            const newRetries = retries + 1; setRetries(newRetries)
            if (newRetries >= MAX_RETRIES) { setAnswered(true); setShowExplanation(true); onComplete(false) }
            else setTimeout(() => setSelected(null), 800)
        }
    }

    const handleNext = useCallback(() => {
        if (isLastQ) { onAllCorrect() }
        else { setQIndex(i => i + 1); setSelected(null); setRetries(0); setShowExplanation(false); setAnswered(false); setObserverResult(null) }
    }, [isLastQ, onAllCorrect])

    if (!track || !currentQ) return null
    const isCorrect = selected !== null && currentQ.answers?.[selected]?.correct === true

    return (
        <div className={`${styles.panel} ${styles.quizPanel} ${panelsVisible ? styles.panelVisible : ''}`}>
            <div className={styles.quizLabel}>KNOWLEDGE CHECK · {qIndex + 1} / {questions.length} </div>
            <p className={styles.quizQuestion}>{currentQ.question}</p>
            {currentQ.answers && (
                <div className={styles.quizOptions}>
                    {currentQ.answers.map((opt, i) => {
                        let cls = styles.quizOption
                        if (selected === i) cls += opt.correct ? ` ${styles.quizOptionCorrect}` : ` ${styles.quizOptionWrong}`
                        else if (answered && opt.correct) cls += ` ${styles.quizOptionCorrect}`
                        return <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered} id={`quiz-option-${qIndex}-${i}`}> {opt.label} </button>
                    })}
                </div>
            )}
            {currentQ.isObserver && !answered && <div className={styles.observerPrompt}><span className={styles.eyeIcon}>👁️</span> Interact with the correct model in the scene to answer.</div>}
            {currentQ.isObserver && observerResult !== null && (
                <div className={`${styles.quizFeedback} ${observerResult ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                    {observerResult ? "✓ Correct! Notice how the qubit's paths overlap." : "✗ That's the classical bit. Try the one with multiple paths!"}
                </div>
            )}
            {!currentQ.isObserver && answered && (
                <div className={`${styles.quizFeedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                    {isCorrect ? "✓ Masterfully observed. The quantum world reveals its secrets." : "✗ A temporary decoherence! Let's examine the reality again."}
                </div>
            )}
            {showExplanation && <div className={styles.explanationBox}><span className={styles.bookIcon}>📖</span> {currentQ.explanation} </div>}
            {answered && <button className={styles.nextQuizBtn} onClick={handleNext} id={`quiz-next-${qIndex}`}> {isLastQ ? 'Claim your Badge →' : 'Next Question →'} </button>}
        </div>
    )
}

// ─── COMPLETION PANEL ──────────────────────────────────────────────────────────
function CompletionPanel({ track, panelsVisible }: { track: Track; panelsVisible: boolean }) {
    const navigate = useNavigate()
    const badge = track === 'amber'
        ? { emoji: '🟡', label: 'Quantum Analyst', color: '#C4955A' }
        : { emoji: '🔵', label: 'Quantum Explorer', color: '#5DA7DB' }
    return (
        <div className={`${styles.panel} ${styles.completionPanel} ${panelsVisible ? styles.panelVisible : ''}`}>
            <div className={styles.badgeGlow}>{badge.emoji}</div>
            <h2 className={styles.badgeName}>{badge.label} Unlocked</h2>
            <p className={styles.badgeSubtitle} style={{ color: badge.color }}>You've mastered the fundamentals of the Qubit.</p>
            <button className={styles.continueBtn} onClick={() => navigate('/learn')} id="completion-continue-btn">
                Return to Modules
            </button>
        </div>
    )
}

// ─── MODULE 1 OVERLAY (main export) ──────────────────────────────────────────
export interface QubitOverlayProps {
    panelsVisible: boolean; track: Track; phase: Phase
    onTrackSelect: (t: 'blue' | 'amber') => void
    onLessonComplete: () => void; onCompareComplete: () => void; onQuizComplete: () => void
    onQuizResult: (correct: boolean) => void; sphereClicked: boolean
    coinClickedCompare: boolean; qubitClickedCompare: boolean
    setEquationStep: (s: number) => void
}

export function QubitOverlay({ panelsVisible, track, phase, onTrackSelect, onLessonComplete, onCompareComplete, onQuizComplete, onQuizResult, sphereClicked, coinClickedCompare, qubitClickedCompare, setEquationStep }: QubitOverlayProps) {
    return (
        <>
            <ModuleHeader moduleNumber={1} moduleName="What is a Qubit?" />
            {phase === 'hook' && (
                <>
                    <TrackSelector panelsVisible={panelsVisible} onTrackSelect={onTrackSelect} />
                    {track && <CatDialogueBubble track={track} panelsVisible={panelsVisible} />}
                </>
            )}
            {phase === 'lesson' && <LessonPanels track={track} panelsVisible={panelsVisible} onComplete={onLessonComplete} setEquationStep={setEquationStep} />}
            {phase === 'compare' && <ComparePanel panelsVisible={panelsVisible} onCompareComplete={onCompareComplete} coinClicked={coinClickedCompare} qubitClicked={qubitClickedCompare} />}
            {phase === 'quiz' && <QuizPanel track={track} panelsVisible={panelsVisible} onComplete={onQuizResult} onAllCorrect={onQuizComplete} sphereClicked={sphereClicked} />}
            {phase === 'complete' && <CompletionPanel track={track} panelsVisible={panelsVisible} />}
        </>
    )
}
