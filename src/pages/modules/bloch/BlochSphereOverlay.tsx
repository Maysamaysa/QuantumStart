/**
 * BlochSphereOverlay.tsx — HTML panels for Module 3 "Bloch Sphere"
 */

import styles from './BlochSphereOverlay.module.css'
import { ModuleHeader } from '../../../components/ModuleHeader'
import { QuizCard } from '../../../components/Quiz/QuizCard'
import { CompletionCard } from '../../../components/Quiz/CompletionCard'
import type { QuizQuestion } from '../../../components/Quiz/QuizCard'

const STEPS = [
    {
        title: "Welcome to the Bloch Sphere",
        description: "The Bloch Sphere is a geometrical representation of a single qubit's state. Every point on the surface represents a valid quantum state.",
        hint: "Rotate the sphere by clicking and dragging the background."
    },
    {
        title: "The Z-Axis: |0⟩ and |1⟩",
        description: "The North Pole is state |0⟩ (Blue eye). The South Pole is state |1⟩ (Amber eye). These are our computational basis states.",
        hint: "Notice how θ = 0 at the top and θ = π at the bottom."
    },
    {
        title: "The Equator: Superposition",
        description: "Points on the equator represent equal parts |0⟩ and |1⟩. This is where quantum 'weirdness' lives!",
        hint: "Try to move the vector to the middle horizontal ring."
    },
    {
        title: "Phase (φ)",
        description: "As you move around the equator, you change the 'Phase'. This doesn't change the probability of 0 or 1, but it changes how the state interferes.",
        hint: "Watch the φ (Phi) value change as you move horizontally."
    },
    {
        title: "The X and Y Axes",
        description: "The X axis represents the |+⟩ and |-⟩ states. The Y axis represents |i+⟩ and |i-⟩. These are key for quantum operations.",
        hint: "Explore the red (X) and green (Y) lines."
    }
]

const QUIZ: QuizQuestion[] = [
    {
        question: "What state is represented by the South Pole (θ = π)?",
        answers: [
            { label: "A) |0⟩", correct: false },
            { label: "B) |1⟩", correct: true },
            { label: "C) Superposition", correct: false },
            { label: "D) Phase shift", correct: false },
        ],
        explanation: "The South Pole represents the |1⟩ state. Moving the state vector all the way down (θ = π) means the qubit is entirely in state |1⟩."
    },
    {
        question: "What does the phase angle φ affect?",
        answers: [
            { label: "A) The probability of measuring |0⟩ or |1⟩", correct: false },
            { label: "B) The rotation around the equator", correct: true },
            { label: "C) The speed of the qubit", correct: false },
            { label: "D) The number of qubits", correct: false },
        ],
        explanation: "φ controls the phase — it rotates the state around the Z-axis (equator) without changing measurement probabilities. Phase is invisible to single measurements but crucial for interference."
    },
    {
        question: "Where on the Bloch Sphere is equal superposition?",
        answers: [
            { label: "A) North Pole", correct: false },
            { label: "B) South Pole", correct: false },
            { label: "C) On the equator", correct: true },
            { label: "D) Inside the sphere", correct: false },
        ],
        explanation: "Equal superposition (50% chance of |0⟩ and 50% chance of |1⟩) occurs when θ = π/2, which is the equator of the Bloch Sphere."
    }
]

export function BlochSphereOverlay({
    step, theta, phi, onNext, onBack, onQuizResult, onStateChange
}: any) {

    // Derived values for the dashboard
    const x = (Math.sin(theta) * Math.cos(phi)).toFixed(3)
    const y = (Math.sin(theta) * Math.sin(phi)).toFixed(3)
    const z = Math.cos(theta).toFixed(3)
    
    const prob0 = Math.pow(Math.cos(theta/2), 2)
    const prob1 = Math.pow(Math.sin(theta/2), 2)
    
    const alpha = Math.cos(theta/2).toFixed(3)
    const beta = Math.sin(theta/2).toFixed(3)
    const phiDeg = (phi * 180 / Math.PI).toFixed(1)
    const phiPi = (phi / Math.PI).toFixed(2)

    const isStep = typeof step === 'number'
    const currentStep = isStep ? STEPS[step - 1] : null

    return (
        <>
        <ModuleHeader
            moduleNumber={3}
            moduleName="The Bloch Sphere"
            phases={['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Sandbox', 'Quiz']}
            currentPhase={
                step === 'sandbox' ? 5
                : step === 'quiz' ? 6
                : step === 'complete' ? 6
                : typeof step === 'number' ? step - 1
                : 0
            }
        />

            {/* SIDEBAR CONTAINER */}
            <div className={styles.sidebar}>
                {/* INSTRUCTION PANEL */}
                {(isStep || step === 'sandbox' || step === 'quiz') && (
                    <div className={styles.instructionPanel}>
                        {isStep ? (
                            <>
                                <div className={styles.stepIndicator}>
                                    {STEPS.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`${styles.stepDot} ${i + 1 <= step ? styles.stepDotActive : ''}`} 
                                        />
                                    ))}
                                </div>
                                <span className={styles.stepText}>Step {step} of 5</span>
                                <h2 className={styles.title}>{currentStep?.title}</h2>
                                <p className={styles.description}>{currentStep?.description}</p>
                                
                                <div className={styles.hintBox}>
                                    💡 <span>{currentStep?.hint}</span>
                                </div>

                                <div className={styles.btnRow}>
                                    <button 
                                        className={`${styles.navBtn} ${styles.backStepBtn}`} 
                                        onClick={onBack}
                                        style={{ opacity: step === 1 ? 0.3 : 1 }}
                                        disabled={step === 1}
                                    >
                                        ← Back
                                    </button>
                                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>
                                        Next →
                                    </button>
                                </div>
                            </>
                        ) : step === 'sandbox' ? (
                            <>
                                <span className={styles.stepText}>Sandbox Mode</span>
                                <h2 className={styles.title}>Explore the Sphere</h2>
                                <p className={styles.description}>You can now freely explore the Bloch Sphere. Drag the dot around to see how the state and probabilities change.</p>
                                
                                <div className={styles.btnRow} style={{ marginTop: '20px' }}>
                                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>
                                        ← Back
                                    </button>
                                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>
                                        Take Final Quiz →
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className={styles.stepText}>Final Challenge</span>
                                <QuizCard
                                    questions={QUIZ}
                                    onComplete={onQuizResult}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* LIVE COORDINATES DASHBOARD */}
                {(isStep || step === 'sandbox') && (
                    <div className={styles.dashboardPanel}>
                        <h3 className={styles.dashboardTitle}>Live Coordinates</h3>
                        
                        <div className={styles.section}>
                            <p className={styles.label}>Spherical Coordinates</p>
                            <div className={styles.valueRow}>
                                <span className={styles.coord}>θ = {(theta / Math.PI).toFixed(3)}π ({(theta * 180 / Math.PI).toFixed(1)}°)</span>
                                <span className={styles.coord}>φ = {phiPi}π ({phiDeg}°)</span>
                            </div>
                            
                            {/* NEW SLIDERS */}
                            <div className={styles.sliderGroup}>
                                <div className={styles.sliderItem}>
                                    <span className={styles.sliderIcon}>↕</span>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={Math.PI} 
                                        step="0.01" 
                                        value={theta} 
                                        onChange={(e) => onStateChange(parseFloat(e.target.value), phi)}
                                        className={styles.rangeInput}
                                    />
                                    <span className={styles.sliderLabel}>θ</span>
                                </div>
                                <div className={styles.sliderItem}>
                                    <span className={styles.sliderIcon}>↔</span>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={Math.PI * 2} 
                                        step="0.01" 
                                        value={phi} 
                                        onChange={(e) => onStateChange(theta, parseFloat(e.target.value))}
                                        className={styles.rangeInput}
                                    />
                                    <span className={styles.sliderLabel}>φ</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <p className={styles.label}>Bloch Vector (<span style={{color: '#ff4444'}}>x</span>, <span style={{color: '#44ff44'}}>y</span>, <span style={{color: '#5DA7DB'}}>z</span>)</p>
                            <div className={styles.valueRow}>
                                <span className={styles.coord}>(<span style={{color: '#ff4444'}}>{x}</span>, <span style={{color: '#44ff44'}}>{y}</span>, <span style={{color: '#5DA7DB'}}>{z}</span>)</span>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <p className={styles.label}>Quantum State |ψ⟩</p>
                            <div className={styles.mathState}>
                                |ψ⟩ = <b style={{color: '#5DA7DB'}}>{alpha}</b>|0⟩ + <i style={{color: '#ff4444'}}>{beta} · e<sup>i{phiPi}π</sup></i>|1⟩
                            </div>
                        </div>

                        <div className={styles.section}>
                            <p className={styles.label}>Probabilities</p>
                            <div className={styles.probContainer}>
                                <div className={styles.probItem}>
                                    <span className={styles.probLabel}>P(|0⟩)</span>
                                    <div className={styles.probBar}>
                                        <div className={styles.probFill} style={{ width: `${prob0 * 100}%`, background: 'var(--state-0)' }} />
                                    </div>
                                    <span className={styles.probVal}>{(prob0 * 100).toFixed(1)}%</span>
                                </div>
                                <div className={styles.probItem}>
                                    <span className={styles.probLabel}>P(|1⟩)</span>
                                    <div className={styles.probBar}>
                                        <div className={styles.probFill} style={{ width: `${prob1 * 100}%`, background: 'var(--state-1)' }} />
                                    </div>
                                    <span className={styles.probVal}>{(prob1 * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {step === 'complete' && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 200 }}>
                    <CompletionCard
                        emoji="🔮"
                        badgeName="Sphere Surveyor"
                        subtitle="You've mastered the geometry of the qubit!"
                        nextRoute="/learn/measurement"
                        nextLabel="Next: Measurement →"
                    />
                </div>
            )}

            <div className={styles.bottomNav}>
                <span>Drag the amber dot</span>
                <span>•</span>
                <span>Scroll to zoom</span>
                <span>•</span>
                <span>Click + drag to orbit</span>
            </div>
        </>
    )
}
