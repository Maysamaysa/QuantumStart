import { useState } from 'react'

const FINAL_QUIZ = [
    { q: "Which gate flips a qubit from |0⟩ to |1⟩?", opts: ["H", "Z", "X", "Y"], ans: 2 },
    { q: "What does the Hadamard (H) gate do?", opts: ["Flips phase", "Creates equal superposition", "Entangles", "Measures"], ans: 1 },
    { q: "To entangle two qubits, what sequence do we typically use?", opts: ["X then Z", "Two H gates", "H then CNOT", "Measured then X"], ans: 2 }
]

export interface GatesQuizProps {
    onComplete: () => void
}

export default function GatesQuiz({ onComplete }: GatesQuizProps) {
    const [idx, setIdx] = useState(0)
    const [msg, setMsg] = useState("Final verification. Let's see if you've mastered the building blocks.")
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null)

    const handleAnswer = (i: number) => {
        if (isTransitioning) return
        
        setSelectedOpt(i)
        
        if (i === FINAL_QUIZ[idx].ans) {
            setIsCorrect(true)
            if (idx === FINAL_QUIZ.length - 1) {
                setMsg("Perfect score! You've mastered Quantum Gates.")
                setIsTransitioning(true)
                setTimeout(() => onComplete(), 2000)
            } else {
                setMsg("Correct! Let's power up the next sequence.")
                setIsTransitioning(true)
                setTimeout(() => {
                    setIdx(prev => prev + 1)
                    setMsg("Accessing next question...")
                    setIsCorrect(null)
                    setSelectedOpt(null)
                    setIsTransitioning(false)
                }, 1500)
            }
        } else {
            setIsCorrect(false)
            setMsg("Ooh, a glitch in the matrix! Let's try another timeline.")
            setTimeout(() => {
                setSelectedOpt(null)
                setIsCorrect(null)
                setMsg(idx === 0 ? "Final verification. Let's see if you've mastered the building blocks." : "Aha, let's keep verifying.")
            }, 2000)
        }
    }

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(5, 5, 15, 0.4)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
        }}>
            <div style={{
                width: '90vw', maxWidth: '700px',
                background: 'rgba(15, 12, 30, 0.85)',
                backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                borderRadius: 24, padding: '40px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                color: '#fff', fontFamily: "'DM Sans', sans-serif",
                textAlign: 'center',
                transition: 'opacity 0.3s ease',
                opacity: isTransitioning && idx !== FINAL_QUIZ.length - 1 ? 0.8 : 1
            }}>
                <h2 style={{ 
                    fontSize: 32, margin: '0 0 8px 0', color: '#5DA7DB', 
                    fontWeight: 800, textShadow: '0 0 15px rgba(93,167,219,0.4)' 
                }}>
                    Final Quiz {idx + 1}/{FINAL_QUIZ.length}
                </h2>
                
                <p style={{ 
                    fontSize: 22, margin: '24px 0 32px 0', 
                    fontWeight: 500, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)'
                }}>
                    {FINAL_QUIZ[idx].q}
                </p>
                
                <div style={{ 
                    display: 'grid', gridTemplateColumns: '1fr 1fr', 
                    gap: '16px', marginBottom: '32px' 
                }}>
                    {FINAL_QUIZ[idx].opts.map((opt, i) => {
                        const isSelected = selectedOpt === i;
                        const stateColor = isSelected 
                            ? (isCorrect ? '#5DCAA5' : '#E8593C') // Green if correct, Red if wrong
                            : 'rgba(93, 167, 219, 0.2)';
                        
                        const stateBorder = isSelected
                            ? (isCorrect ? '#5DCAA5' : '#E8593C')
                            : '#5DA7DB';
                            
                        return (
                            <button 
                                key={i} 
                                onClick={() => handleAnswer(i)}
                                disabled={isTransitioning || (selectedOpt !== null && selectedOpt !== i && isCorrect === true)}
                                style={{
                                    background: isSelected ? stateColor + '33' : 'rgba(93, 167, 219, 0.05)',
                                    border: `1.5px solid ${stateBorder}`,
                                    color: isSelected ? stateColor : '#F8F9FF',
                                    padding: '16px 20px',
                                    borderRadius: 16,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: isTransitioning ? 'default' : 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isSelected && !isCorrect ? 'scale(0.98)' : 'scale(1)',
                                    boxShadow: isSelected && isCorrect ? `0 0 20px ${stateColor}40` : 'none',
                                    opacity: selectedOpt !== null && selectedOpt !== i ? 0.6 : 1
                                }}
                            >
                                {opt}
                            </button>
                        )
                    })}
                </div>
                
                {/* sleek feedback box replacing the cat bubble */}
                <div style={{ 
                    background: isCorrect === true ? 'rgba(93, 202, 165, 0.1)' : 
                                isCorrect === false ? 'rgba(232, 89, 60, 0.1)' : 
                                'rgba(255, 255, 255, 0.05)',
                    borderLeft: `4px solid ${
                        isCorrect === true ? '#5DCAA5' : 
                        isCorrect === false ? '#E8593C' : 
                        '#5DA7DB'
                    }`,
                    padding: '16px 24px', 
                    borderRadius: '0 12px 12px 0', 
                    fontSize: 16, 
                    fontWeight: 500,
                    lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.85)',
                    minHeight: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                }}>
                    {msg}
                </div>
            </div>
        </div>
    )
}
