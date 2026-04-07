import styles from './MeasurementOverlay.module.css'
import type { Basis, Phase } from './MeasurementModule'
import { ModuleHeader } from '../../../components/ModuleHeader'
import { QuizCard } from '../../../components/Quiz/QuizCard'
import { CompletionCard } from '../../../components/Quiz/CompletionCard'
import type { QuizQuestion } from '../../../components/Quiz/QuizCard'

interface Props {
    phase: Phase
    step: number
    theta: number
    setTheta: (t: number) => void
    phi: number
    setPhi: (p: number) => void
    isMeasured: boolean
    measuredValue: 0 | 1 | null
    basis: Basis
    setBasis: (b: Basis) => void
    histogram: { 0: number, 1: number }
    quizQuestion: number
    onMeasure: () => void
    onReset: () => void
    onRun50: () => void
    onClearHistogram: () => void
    onNext: () => void
    onBack: () => void
    onQuizAnswer: (correct: boolean) => void
}

export function MeasurementOverlay({
    phase, step, theta, setTheta, phi, setPhi, isMeasured, measuredValue, basis, setBasis,
    histogram, quizQuestion: _quizQuestion, onMeasure, onReset, onRun50, onClearHistogram, onNext, onBack, onQuizAnswer
}: Props) {

    const renderConcept = () => {
        const specs = [
            {
                title: "The core idea",
                desc: "This qubit is in superposition. It has no definite value. The moment we look — we force it to decide.",
                hint: "Think of it like a spinning coin. While it's spinning, it's neither heads nor tails. The moment it lands, that's measurement."
            },
            {
                title: "Before vs After",
                desc: "Any point on the sphere collapses to one of exactly two poles when measured along the Z-axis.",
                hint: "Left: Superposition. Right: Collapsed to |0⟩."
            },
            {
                title: "The one-way door",
                desc: "You cannot un-measure. The superposition is gone forever. To get it back, you must prepare a new qubit.",
                hint: "Observation is irreversible."
            }
        ][step - 1]

        return (
            <div className={styles.instructionPanel}>
                <span className={styles.stepText}>Phase 1 — Concept {step}/3</span>
                <h2 className={styles.title}>{specs.title}</h2>
                <p className={styles.description}>{specs.desc}</p>
                <div className={styles.hintBox}>💡 <span>{specs.hint}</span></div>
                <div className={styles.btnRow}>
                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack} disabled={step === 1}>← Back</button>
                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>Next →</button>
                </div>
            </div>
        )
    }

    const renderCollapse = () => {
        const total = histogram[0] + histogram[1]
        return (
            <div className={styles.instructionPanel}>
                <span className={styles.stepText}>Phase 2 — Feel the collapse</span>
                <h2 className={styles.title}>The Act of Measurement</h2>
                <p className={styles.description}>
                    {isMeasured 
                        ? `The wave function collapsed to |${measuredValue}⟩! Notice how the state arrow snapped to the pole.` 
                        : "The qubit is in equal superposition |+⟩. What will it be when you measure it?"}
                </p>

                {!isMeasured ? (
                    <button className={styles.measureBtn} onClick={onMeasure}>MEASURE</button>
                ) : (
                    <div className={styles.btnRow} style={{ marginBottom: 12 }}>
                        <button className={styles.optionBtn} onClick={onReset}>Reset & measure again</button>
                        <button className={styles.optionBtn} onClick={onRun50}>Run 50 times</button>
                    </div>
                )}

                {total > 0 && (
                    <>
                        <div className={styles.histogram}>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFill0} style={{ height: `${Math.max(5, (histogram[0]/total)*100)}%` }} />
                                    <div className={styles.barCount}>{histogram[0]}</div>
                                </div>
                                <div className={styles.barLabel}>|0⟩</div>
                            </div>
                            <div className={styles.barCol}>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFill1} style={{ height: `${Math.max(5, (histogram[1]/total)*100)}%` }} />
                                    <div className={styles.barCount}>{histogram[1]}</div>
                                </div>
                                <div className={styles.barLabel}>|1⟩</div>
                            </div>
                        </div>
                        {total >= 50 && (
                            <p style={{ fontSize: '0.8rem', color: '#ffb7c5', margin: '16px 0' }}>
                                Even though the qubit started in the same state every time, each measurement is truly random. This isn't ignorance — it's fundamental.
                            </p>
                        )}
                    </>
                )}

                <div className={styles.btnRow} style={{ marginTop: 24 }}>
                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>← Back</button>
                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext} disabled={total === 0}>Next Phase →</button>
                </div>
            </div>
        )
    }

    const renderSandbox = () => {
        let p0 = 0
        if (basis === 'Z') p0 = Math.pow(Math.cos(theta/2), 2) * 100
        else if (basis === 'X') p0 = 0.5 * (1 + Math.sin(theta) * Math.cos(phi)) * 100
        else if (basis === 'Y') p0 = 0.5 * (1 + Math.sin(theta) * Math.sin(phi)) * 100

        const alpha = Math.cos(theta/2).toFixed(2)
        const beta = Math.sin(theta/2).toFixed(2)
        const phiDeg = Math.round((phi / Math.PI) * 180)
        
        const total = histogram[0] + histogram[1]

        return (
            <div className={styles.instructionPanel}>
                <span className={styles.stepText}>Phase 3 — Born Rule & Basis</span>
                <h2 className={styles.title}>Probability Sandbox</h2>
                
                <p style={{fontSize: '0.8rem', color: '#ffb7c5', marginBottom: 8}}>
                    <strong>Step 1: Rotate the Qubit State Vector</strong>
                </p>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ fontFamily: 'Space Mono', color: '#5DA7DB', marginBottom: 4, fontSize: '0.85rem' }}>
                        |ψ⟩ = {alpha}|0⟩ + e^({phiDeg}i°){beta}|1⟩
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: 12 }}>
                        Prob({basis === 'Z' ? '0' : basis === 'X' ? '+' : '+i'}) = {p0.toFixed(1)}%
                    </div>
                    
                    <div style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#ccc', marginBottom: 4 }}>
                            <span>Amplitude (θ tilt: up/down)</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={100 - (theta / Math.PI) * 100} 
                            onChange={(e) => { setTheta(Math.PI * (1 - parseInt(e.target.value)/100)); onClearHistogram(); onReset(); }}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#ccc', marginBottom: 4 }}>
                            <span>Phase (φ rotation: left/right)</span>
                        </div>
                        <input 
                            type="range" min="0" max="360" 
                            value={phiDeg} 
                            onChange={(e) => { setPhi(parseInt(e.target.value) * (Math.PI / 180)); onClearHistogram(); onReset(); }}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <p style={{fontSize: '0.8rem', color: '#5DA7DB', marginBottom: 8}}>
                    <strong>Step 2: Choose Measurement Axis</strong>
                    <br/><span style={{opacity: 0.7, fontSize: '0.7rem'}}>This doesn't move the qubit—it just alters the perspective we measure from!</span>
                </p>
                <div className={styles.btnRow} style={{ marginBottom: 16, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 12 }}>
                    {(['Z', 'X', 'Y'] as Basis[]).map(b => (
                        <button 
                            key={b}
                            className={`${styles.optionBtn} ${basis === b ? styles.active : ''}`}
                            style={{ background: basis === b ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', fontWeight: basis === b ? 'bold' : 'normal' }}
                            onClick={() => { setBasis(b); onClearHistogram(); onReset(); }}
                        >
                            {b}-Basis
                        </button>
                    ))}
                </div>

                {!isMeasured ? (
                    <button className={styles.measureBtn} onClick={onMeasure} style={{ padding: '12px 0', fontSize: '1rem', letterSpacing: 0 }}>MEASURE (x1)</button>
                ) : (
                    <button className={styles.optionBtn} onClick={onReset} style={{ width: '100%', marginBottom: 12 }}>Reset Component</button>
                )}
                
                <button className={styles.optionBtn} onClick={onRun50} style={{ width: '100%', marginBottom: 12 }}>Run 50 shots</button>

                {total > 0 && (
                    <div className={styles.histogram} style={{ height: 80 }}>
                        <div className={styles.barCol}>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill0} style={{ height: `${Math.max(5, (histogram[0]/total)*100)}%` }} />
                                <div className={styles.barCount}>{histogram[0]}</div>
                            </div>
                            <div className={styles.barLabel}>{basis === 'Z' ? '|0⟩' : basis === 'X' ? '|+⟩' : '|i+⟩'}</div>
                        </div>
                        <div className={styles.barCol}>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill1} style={{ height: `${Math.max(5, (histogram[1]/total)*100)}%` }} />
                                <div className={styles.barCount}>{histogram[1]}</div>
                            </div>
                            <div className={styles.barLabel}>{basis === 'Z' ? '|1⟩' : basis === 'X' ? '|-⟩' : '|i-⟩'}</div>
                        </div>
                    </div>
                )}

                <div className={styles.btnRow} style={{ marginTop: 24 }}>
                    <button className={`${styles.navBtn} ${styles.backStepBtn}`} onClick={onBack}>← Back</button>
                    <button className={`${styles.navBtn} ${styles.nextStepBtn}`} onClick={onNext}>Start Quiz →</button>
                </div>
            </div>
        )
    }

    const MEASUREMENT_QUIZ: QuizQuestion[] = [
        {
            question: "If the state vector is exactly halfway between the North and South pole (|+⟩), what is P(0)?",
            answers: [
                { label: "100%", correct: false },
                { label: "50%", correct: true },
                { label: "0%", correct: false },
                { label: "Depends on phase φ", correct: false },
            ],
            explanation: "At the equator (|+⟩), the state has equal probability amplitudes for |0⟩ and |1⟩. The Born rule gives P(0) = |⟨0|+⟩|² = 50%."
        },
        {
            question: "A histogram shows 75 shots for |0⟩ and 25 shots for |1⟩. Where does the state vector likely point?",
            answers: [
                { label: "Closer to North Pole", correct: true },
                { label: "Closer to South Pole", correct: false },
                { label: "Exactly on Equator", correct: false },
                { label: "Cannot determine", correct: false },
            ],
            explanation: "75% probability of |0⟩ means the state vector is tilted toward the North Pole (|0⟩). The closer to the pole, the higher that outcome's probability."
        },
        {
            question: "If you prepare |0⟩ and measure in the X-basis, what do you get?",
            answers: [
                { label: "Always |+⟩", correct: false },
                { label: "Always |0⟩", correct: false },
                { label: "50% |+⟩ and 50% |-⟩", correct: true },
                { label: "Measurement fails", correct: false },
            ],
            explanation: "The state |0⟩ is an equal superposition of |+⟩ and |-⟩ in the X-basis. So measuring in X gives a 50/50 split — the basis you choose changes the outcome distribution."
        }
    ]

    const renderQuiz = () => {
        return (
            <QuizCard
                questions={MEASUREMENT_QUIZ}
                onComplete={() => onQuizAnswer(true)}
                onQuizResult={onQuizAnswer}
            />
        )
    }

    return (
        <div className={styles.container}>
        <ModuleHeader
            moduleNumber={4}
            moduleName="Measurement"
            phases={['Concept', 'Collapse', 'Probability', 'Quiz']}
            currentPhase={
                phase === 'concept' ? 0
                : phase === 'collapse' ? 1
                : phase === 'sandbox' ? 2
                : phase === 'quiz' ? 3
                : 3
            }
        />

            <div className={phase === 'concept' ? styles.centerBottom : styles.sidebar}>
                {phase === 'concept' && renderConcept()}
                {phase === 'collapse' && renderCollapse()}
                {phase === 'sandbox' && renderSandbox()}
                {phase === 'quiz' && renderQuiz()}
                {phase === 'complete' && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CompletionCard
                            emoji="👁️"
                            badgeName="Wave Collapser"
                            subtitle="You have mastered the irreversible act of quantum measurement."
                            nextRoute="/learn/entanglement"
                            nextLabel="Next: Entanglement →"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
