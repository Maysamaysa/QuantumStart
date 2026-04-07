import { useState, useEffect, useCallback } from 'react'
import { useProgress } from '../../../context/hooks'
import { ModuleCanvas } from '../../../components/ModuleCanvas'
import GatesScene from './GatesScene'
import { GatesOverlay } from './GatesOverlay'
import PortalCanvas2D from './PortalCanvas2D'
import GatesTour from './GatesTour'
import GatesChallenges from './GatesChallenges'
import GatesQuiz from './GatesQuiz'
import type { State1Q } from './gateLogic'

export type GatePhase = 'phase1_intro' | 'phase2_challenges' | 'phase3_quiz' | 'complete'
export type IntroStage = 'choice' | 'primer' | 'palette'

export function GatesModule() {
    const { completeModule } = useProgress()

    const [phase, setPhase] = useState<GatePhase>('phase1_intro')
    const [panelsVisible] = useState(true)

    // Shared state for 3D and UI
    const [introStage, setIntroStage] = useState<IntroStage>('choice')
    const [selectedGate, setSelectedGate] = useState<string | null>(null)
    const [animState, setAnimState] = useState<State1Q>([1, 0, 0, 0])
    const [challengeIdx, setChallengeIdx] = useState(0)
    const [wireState1, setWireState1] = useState<State1Q>([1, 0, 0, 0])
    const [wireState2, setWireState2] = useState<State1Q>([1, 0, 0, 0])
    const [isEntangled, setIsEntangled] = useState(false)

    // Using local storage for un-locked gates
    const [unlockedGates, setUnlockedGates] = useState<string[]>(() => {
        const stored = localStorage.getItem('quantum_lotus_unlocked_gates')
        return stored ? JSON.parse(stored) : ['H']
    })

    const unlockGate = useCallback((gateId: string) => {
        setUnlockedGates(prev => {
            if (prev.includes(gateId)) return prev
            const next = [...prev, gateId]
            localStorage.setItem('quantum_lotus_unlocked_gates', JSON.stringify(next))
            return next
        })
    }, [])

    useEffect(() => {
        // Keep panelsVisible transition behaviour consistent
    }, [])


    const handlePhaseComplete = useCallback((completedPhase: GatePhase) => {
        if (completedPhase === 'phase1_intro') setPhase('phase2_challenges')
        else if (completedPhase === 'phase2_challenges') setPhase('phase3_quiz')
        else if (completedPhase === 'phase3_quiz') {
            setPhase('complete')
            completeModule('gates', 'blue')
        }
    }, [completeModule])

    const showCanvas2D = phase === 'phase1_intro' && introStage === 'primer'
    const showTour = phase === 'phase1_intro' && introStage === 'palette'
    const showChallenges = phase === 'phase2_challenges'
    const showQuiz = phase === 'phase3_quiz'
    const hideR3F = showCanvas2D || showTour || showChallenges || showQuiz

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            {/* R3F scene — hidden during primer/palette (2D takes over) */}
            <div style={{ opacity: hideR3F ? 0 : 1, transition: 'opacity 0.4s ease', position: 'absolute', inset: 0 }}>
                <ModuleCanvas camera={{ position: [0, 0, 11], fov: 55 }}>
                    <GatesScene
                        phase={phase}
                        introStage={introStage}
                        unlockedGates={unlockedGates}
                        selectedGate={selectedGate}
                        onSelectGate={setSelectedGate}
                        animState={animState}
                        challengeIdx={challengeIdx}
                        wireState1={wireState1}
                        wireState2={wireState2}
                        isEntangled={isEntangled}
                    />
                </ModuleCanvas>
            </div>

            {/* 2D Canvas — primer stage */}
            {showCanvas2D && <PortalCanvas2D />}

            {/* Gate Tour — palette stage */}
            {showTour && <GatesTour onComplete={() => handlePhaseComplete('phase1_intro')} />}

            {/* Challenges */}
            {showChallenges && (
                <GatesChallenges
                    challengeIdx={challengeIdx}
                    setChallengeIdx={setChallengeIdx}
                    wireState1={wireState1}
                    setWireState1={setWireState1}
                    wireState2={wireState2}
                    setWireState2={setWireState2}
                    isEntangled={isEntangled}
                    setIsEntangled={setIsEntangled}
                    onComplete={() => handlePhaseComplete('phase2_challenges')}
                />
            )}

            {/* Final Quiz */}
            {showQuiz && (
                <GatesQuiz onComplete={() => handlePhaseComplete('phase3_quiz')} />
            )}

            {/* HTML overlay */}
            <GatesOverlay
                panelsVisible={panelsVisible}
                phase={phase}
                onPhaseComplete={handlePhaseComplete}
                introStage={introStage}
                setIntroStage={setIntroStage}
                unlockedGates={unlockedGates}
                unlockGate={unlockGate}
                selectedGate={selectedGate}
                setSelectedGate={setSelectedGate}
                animState={animState}
                setAnimState={setAnimState}
                challengeIdx={challengeIdx}
                setChallengeIdx={setChallengeIdx}
                wireState1={wireState1}
                setWireState1={setWireState1}
                wireState2={wireState2}
                setWireState2={setWireState2}
                isEntangled={isEntangled}
                setIsEntangled={setIsEntangled}
            />
        </div>
    )
}
