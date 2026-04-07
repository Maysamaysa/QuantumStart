import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './GatesOverlay.module.css'
import type { GatePhase, IntroStage } from './GatesModule'
import { applyGate1Q } from './gateLogic'
import { GATES } from '../../../config/gates'
import type { State1Q } from './gateLogic'
import { ModuleHeader } from '../../../components/ModuleHeader'

interface GatesOverlayProps {
    panelsVisible: boolean
    phase: GatePhase
    onPhaseComplete: (p: GatePhase) => void
    introStage: IntroStage
    setIntroStage: (v: IntroStage) => void
    unlockedGates: string[]
    unlockGate: (id: string) => void
    selectedGate: string | null
    setSelectedGate: (v: string | null) => void
    animState: State1Q
    setAnimState: (v: State1Q) => void
    challengeIdx: number
    setChallengeIdx: (v: number) => void
    wireState1: State1Q
    setWireState1: (v: State1Q) => void
    wireState2: State1Q
    setWireState2: (v: State1Q) => void
    isEntangled: boolean
    setIsEntangled: (v: boolean) => void
}


// ─── Phase 1 Intro ───
interface Phase1IntroProps {
    selectedGate: string | null
    setAnimState: (v: State1Q) => void
    introStage: IntroStage
    setIntroStage: (v: IntroStage) => void
}

function Phase1Intro({ selectedGate, setAnimState, introStage, setIntroStage }: Phase1IntroProps) {
    const currentStateRef = useRef<State1Q>([1, 0, 0, 0])

    useEffect(() => {
        if (!selectedGate) {
            const initial: State1Q = [1, 0, 0, 0]
            currentStateRef.current = initial
            setAnimState(initial)
        } else {
            const timer = setInterval(() => {
                const next = applyGate1Q(GATES[selectedGate as keyof typeof GATES] || GATES.H, currentStateRef.current)
                currentStateRef.current = next
                setAnimState(next)
            }, 3000)
            return () => clearInterval(timer)
        }
    }, [selectedGate])

    const [narrationStep, setNarrationStep] = useState(0)
    const [prevIntroStage, setPrevIntroStage] = useState(introStage)
    const narrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    if (introStage !== prevIntroStage) {
        setPrevIntroStage(introStage)
        if (introStage === 'primer') {
            setNarrationStep(0)
        }
    }

    useEffect(() => {
        return () => {
            if (narrationTimer.current) clearTimeout(narrationTimer.current)
        }
    }, [])

    return (
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' }}>
            {introStage === 'choice' && (
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '1.2rem', pointerEvents: 'auto',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <div className={styles.glassPanel} style={{ 
                        maxWidth: '460px', textAlign: 'center', padding: '2.5rem'
                    }}>
                        <h2 className={styles.title} style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
                            ⚡ Quantum Gates
                        </h2>
                        <p style={{ marginBottom: '2rem', lineHeight: 1.6, opacity: 0.85 }}>
                            Gates are the building blocks of quantum computation — 
                            they transform qubits in precise, reversible ways.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <button 
                                className={`${styles.btn} ${styles.btnPrimary}`} 
                                onClick={() => setIntroStage('primer')}
                            >
                                ↔ Show me the Visual Primer
                            </button>
                            <button className={styles.btn} onClick={() => setIntroStage('palette')}>
                                → Take me straight to the Gates
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {introStage === 'primer' && (
                <div style={{ 
                    position: 'absolute', bottom: '2rem', left: '50%', 
                    transform: 'translateX(-50%)', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    pointerEvents: 'auto', gap: '1rem',
                    maxWidth: '600px', width: '90%'
                }}>
                    <div className={styles.glassPanel} style={{ 
                        width: '100%', textAlign: 'center', padding: '1.5rem 2rem'
                    }}>
                        {/* Progress dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            {NARRATION.map((_, i) => (
                                <div key={i} style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: i <= narrationStep ? '#FFB7C5' : 'rgba(255,255,255,0.2)',
                                    boxShadow: i <= narrationStep ? '0 0 8px #FFB7C5' : 'none',
                                    transition: 'all 0.3s ease'
                                }} />
                            ))}
                        </div>
                        
                        <p style={{ 
                            fontSize: '1.05rem', lineHeight: 1.7, minHeight: '3rem',
                            transition: 'opacity 0.4s ease'
                        }}>
                            {NARRATION[narrationStep]}
                        </p>

                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', justifyContent: 'center' }}>
                            {narrationStep < NARRATION.length - 1 ? (
                                <button 
                                    className={styles.btn}
                                    onClick={() => setNarrationStep(prev => prev + 1)}
                                    style={{ width: 'auto', padding: '0.6rem 1.5rem' }}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button 
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={() => setIntroStage('palette')}
                                    style={{ width: 'auto', padding: '0.8rem 2rem' }}
                                >
                                    Continue to Gates →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Complete Summary ───
function GatesSummary() {
    const navigate = useNavigate()
    return (
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.glassPanel} style={{ maxWidth: '600px', textAlign: 'center' }}>
                <h1 className={styles.title} style={{ fontSize: '3rem' }}>Module 4 Complete!</h1>
                <p className={styles.subtitle}>You've mastered the Quantum Gates.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', margin: '2rem 0' }}>
                     {['H', 'X', 'Y', 'Z', 'CNOT'].map(g => (
                         <div key={g} style={{ background: '#C1E1C1', color: '#1A1B26', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold' }}>
                             {g} Mastered ✓
                         </div>
                     ))}
                </div>

                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => navigate('/learn')}
                    style={{ width: 'auto', padding: '1rem 2rem', pointerEvents: 'auto' }}
                >
                    Return to Hub
                </button>
            </div>
        </div>
    )
}


export function GatesOverlay(props: GatesOverlayProps) {
    const { phase } = props
    const phaseIndex = phase === 'phase1_intro' ? 0 : phase === 'phase2_challenges' ? 1 : phase === 'phase3_quiz' ? 2 : 2

    return (
        <div className={styles.overlayContainer} style={{ opacity: props.panelsVisible ? 1 : 0, transition: 'opacity 0.5s' }}>
            <ModuleHeader
                moduleNumber={6}
                moduleName="Quantum Gates"
                phases={['Explore', 'Challenges', 'Quiz']}
                currentPhase={phaseIndex}
            />
            {phase === 'phase1_intro' && <Phase1Intro {...props} />}
            {phase === 'complete' && <GatesSummary />}
        </div>
    )
}
