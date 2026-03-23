import { useState, useEffect, useCallback } from 'react'
import { useProgress } from '../../../context/ProgressContext'
import { useModuleCatSetup } from '../../../hooks/useModuleCatSetup'
import { useCatNPCTransition } from '../../../hooks/useCatNPCTransition'
import { ModuleCanvas } from '../../../components/ModuleCanvas'
import GatesScene from './GatesScene'
import { GatesOverlay } from './GatesOverlay'
import type { State1Q } from './gateLogic'

export type GatePhase = 'phase1_intro' | 'phase2_challenges' | 'phase3_quiz' | 'complete'

export function GatesModule() {
    const { completeModule } = useProgress()
    useModuleCatSetup('hidden', 'idle')

    const [phase, setPhase] = useState<GatePhase>('phase1_intro')
    const { panelsVisible } = useCatNPCTransition(true)

    // Shared state for 3D and UI
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

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            {/* R3F scene (lesson-specific objects) */}
            <ModuleCanvas camera={{ position: [0, 0, 11], fov: 55 }}>
                <GatesScene
                    phase={phase}
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

            {/* HTML overlay */}
            <GatesOverlay
                panelsVisible={panelsVisible}
                phase={phase}
                onPhaseComplete={handlePhaseComplete}
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
