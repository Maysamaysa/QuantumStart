/**
 * GatesQuiz.tsx — Refactored to use unified QuizCard component
 */

import { QuizCard } from '../../../components/Quiz/QuizCard'
import type { QuizQuestion } from '../../../components/Quiz/QuizCard'

const GATES_QUIZ: QuizQuestion[] = [
    {
        question: "Which gate flips a qubit from |0⟩ to |1⟩?",
        answers: [
            { label: "H", correct: false },
            { label: "Z", correct: false },
            { label: "X", correct: true },
            { label: "Y", correct: false },
        ],
        explanation: "The X gate (Pauli-X) is the quantum equivalent of a classical NOT gate. It flips |0⟩ → |1⟩ and |1⟩ → |0⟩."
    },
    {
        question: "What does the Hadamard (H) gate do?",
        answers: [
            { label: "Flips phase", correct: false },
            { label: "Creates equal superposition", correct: true },
            { label: "Entangles two qubits", correct: false },
            { label: "Measures the qubit", correct: false },
        ],
        explanation: "The Hadamard gate transforms |0⟩ into |+⟩ = (|0⟩ + |1⟩)/√2, creating an equal superposition — the gateway to quantum parallelism."
    },
    {
        question: "To entangle two qubits, what sequence do we typically use?",
        answers: [
            { label: "X then Z", correct: false },
            { label: "Two H gates", correct: false },
            { label: "H then CNOT", correct: true },
            { label: "Measure then X", correct: false },
        ],
        explanation: "The canonical entanglement recipe: Apply H to the control qubit (superposition), then CNOT to correlate it with the target qubit. This creates a Bell state."
    }
]

export interface GatesQuizProps {
    onComplete: () => void
}

export default function GatesQuiz({ onComplete }: GatesQuizProps) {
    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(5, 5, 15, 0.4)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
        }}>
            <QuizCard
                questions={GATES_QUIZ}
                onComplete={onComplete}
            />
        </div>
    )
}
