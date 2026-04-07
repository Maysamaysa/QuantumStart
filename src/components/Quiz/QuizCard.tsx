/**
 * QuizCard.tsx — Unified quiz component for all Quantum Lotus modules
 *
 * Features:
 *  • Quantum-themed feedback messages from skill.md
 *  • 2-retry system with explanation reveal
 *  • Shimmer effect on hover (superposition metaphor)
 *  • Collapse animation on answer (measurement metaphor)
 *  • Progress dots + counter
 */

import { useState, useCallback } from 'react'
import styles from './Quiz.module.css'

export interface QuizAnswer {
    label: string
    correct: boolean
}

export interface QuizQuestion {
    question: string
    answers: QuizAnswer[]
    explanation: string
}

export interface QuizCardProps {
    questions: QuizQuestion[]
    onComplete: () => void
    onQuizResult?: (correct: boolean) => void
    className?: string
}

const CORRECT_MESSAGES = [
    "The universe and I agree: you're a natural.",
    "Beautifully observed — the wave function collapsed in your favor.",
    "Spot on! Your quantum intuition is strong.",
    "Correct! The probability was on your side.",
]

const WRONG_MESSAGES = [
    "Ooh, a glitch in the matrix! Let's try another timeline.",
    "A momentary decoherence — the universe invites you to try again.",
    "Not quite! The qubit spun the other way this time.",
]

function pickRandom(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function QuizCard({ questions, onComplete, onQuizResult, className }: QuizCardProps) {
    const [qIndex, setQIndex] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [retries, setRetries] = useState(0)
    const [showExplanation, setShowExplanation] = useState(false)
    const [answered, setAnswered] = useState(false)
    const [feedbackMsg, setFeedbackMsg] = useState('')
    const [isCorrect, setIsCorrect] = useState(false)

    const MAX_RETRIES = 2
    const currentQ = questions[qIndex]
    const isLastQ = qIndex >= questions.length - 1

    const handleAnswer = useCallback((idx: number) => {
        if (answered) return
        const correct = currentQ.answers[idx].correct
        setSelected(idx)

        if (correct) {
            setIsCorrect(true)
            setAnswered(true)
            setFeedbackMsg(pickRandom(CORRECT_MESSAGES))
            onQuizResult?.(true)
        } else {
            setIsCorrect(false)
            const newRetries = retries + 1
            setRetries(newRetries)
            setFeedbackMsg(pickRandom(WRONG_MESSAGES))

            if (newRetries >= MAX_RETRIES) {
                setAnswered(true)
                setShowExplanation(true)
                onQuizResult?.(false)
            } else {
                // Reset selection after a shake
                setTimeout(() => {
                    setSelected(null)
                    setFeedbackMsg('')
                }, 1200)
            }
        }
    }, [answered, currentQ, retries, onQuizResult])

    const handleNext = useCallback(() => {
        if (isLastQ) {
            onComplete()
        } else {
            setQIndex(i => i + 1)
            setSelected(null)
            setRetries(0)
            setShowExplanation(false)
            setAnswered(false)
            setFeedbackMsg('')
            setIsCorrect(false)
        }
    }, [isLastQ, onComplete])

    if (!currentQ) return null

    return (
        <div className={`${styles.quizCard} ${className || ''}`}>
            {/* Header */}
            <div className={styles.quizHeader}>
                <span className={styles.quizLabel}>
                    KNOWLEDGE CHECK · {qIndex + 1} / {questions.length}
                </span>
                <div className={styles.quizProgress}>
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`${styles.quizDot} ${
                                i === qIndex ? styles.quizDotActive :
                                i < qIndex ? styles.quizDotDone : ''
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Question */}
            <p className={styles.quizQuestion}>{currentQ.question}</p>

            {/* Options */}
            <div className={styles.quizOptions}>
                {currentQ.answers.map((opt, i) => {
                    let optClass = styles.quizOption
                    if (selected === i && answered) {
                        optClass += opt.correct
                            ? ` ${styles.optionCorrect}`
                            : ` ${styles.optionWrong}`
                    } else if (selected === i && !answered) {
                        // Temporarily selected wrong — playing shake
                        optClass += ` ${styles.optionWrong}`
                    } else if (answered && opt.correct) {
                        optClass += ` ${styles.optionCorrect}`
                    } else if (answered) {
                        optClass += ` ${styles.optionDimmed}`
                    }

                    return (
                        <button
                            key={i}
                            className={optClass}
                            onClick={() => handleAnswer(i)}
                            disabled={answered}
                            id={`quiz-option-${qIndex}-${i}`}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>

            {/* Feedback */}
            {feedbackMsg && (
                <div className={`${styles.feedbackBox} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                    <span className={styles.feedbackIcon}>{isCorrect ? '✦' : '↻'}</span>
                    <span>{feedbackMsg}</span>
                </div>
            )}

            {/* Retries counter */}
            {!answered && retries > 0 && (
                <div className={styles.retriesText}>
                    {MAX_RETRIES - retries} attempt{MAX_RETRIES - retries !== 1 ? 's' : ''} remaining
                </div>
            )}

            {/* Explanation */}
            {showExplanation && (
                <div className={styles.explanationBox}>
                    <span className={styles.explanationIcon}>📖</span>
                    <span>{currentQ.explanation}</span>
                </div>
            )}

            {/* Next button */}
            {answered && (
                <button
                    className={styles.nextBtn}
                    onClick={handleNext}
                    id={`quiz-next-${qIndex}`}
                >
                    {isLastQ ? 'Claim your Badge →' : 'Next Question →'}
                </button>
            )}
        </div>
    )
}
