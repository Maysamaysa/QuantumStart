import { useState, useCallback, useMemo } from 'react'
import { ACESFilmicToneMapping } from 'three'
import { AlgorithmsScene } from './AlgorithmsScene'
import { AlgorithmsOverlay } from './AlgorithmsOverlay'
import { useProgress } from '../../../context/ProgressContext'
import { useCatNPCTransition } from '../../../hooks/useCatNPCTransition'
import { useModuleCatSetup } from '../../../hooks/useModuleCatSetup'
import { ModuleCanvas } from '../../../components/ModuleCanvas'
import { simulateCircuit, type CircuitOp, getInitialState } from './circuitLogic'

import { type AlgoPhase } from './algoTypes'

export function AlgorithmsModule() {
    const { completeModule } = useProgress()
    useModuleCatSetup('hidden', 'idle')
    const [phase, setPhase] = useState<AlgoPhase>('phase0_intro')
    // Get a random winning box between 0 to 3, memoized so it only happens once per mount
    const winningBox = useMemo(() => Math.floor(Math.random() * 4), [])
    
    // Phase 1 constraints state
    const [guessedBox, setGuessedBox] = useState<number | null>(null)
    
    // Quantum state
    const [qState, setQState] = useState<number[]>(getInitialState())
    // For average line animation
    const [showAverage, setShowAverage] = useState(false)
    const [builderFeedback, setBuilderFeedback] = useState<string | null>(null)
    
    // We'll use panelsVisible for UI transitions
    const { panelsVisible } = useCatNPCTransition(true)

    const handlePhaseComplete = useCallback((completedPhase: AlgoPhase) => {
        if (completedPhase === 'phase0_intro') setPhase('phase1_classical')
        else if (completedPhase === 'phase1_classical') setPhase('phase2_superposition')
        else if (completedPhase === 'phase2_superposition') setPhase('phase3_oracle')
        else if (completedPhase === 'phase3_oracle') setPhase('phase4_amplification')
        else if (completedPhase === 'phase4_amplification') {
            setPhase('phase5_builder')
            // Reset state for builder
            setQState(getInitialState())
        }
        else if (completedPhase === 'phase5_builder') {
            setPhase('phase6_quiz')
        }
        else if (completedPhase === 'phase6_quiz') {
            setPhase('complete')
            completeModule('algorithms', 'blue') 
        }
    }, [completeModule])

    const handleRunCircuit = useCallback((steps: CircuitOp[]) => {
        const finalState = simulateCircuit(steps, winningBox)
        setQState(finalState)

        // Check correctness: valid Grover sequence is H → Oracle → Amplifier
        const isCorrect = steps.length === 3 &&
                          steps[0].gate === 'H' &&
                          steps[1].gate === 'Oracle' &&
                          steps[2].gate === 'Amplifier';
        
        if (isCorrect) {
            setBuilderFeedback("Perfect! The measurement isolates the target state! The Cat gets the Golden Treat!")
            setTimeout(() => setPhase('phase6_quiz'), 4000)
        } else {
            const hasOracle = steps.find(s => s.gate === 'Oracle')
            const hasAmp = steps.find(s => s.gate === 'Amplifier')
            const hasH = steps.find(s => s.gate === 'H')

            if (hasAmp && !hasOracle) {
                setBuilderFeedback("The Amplifier didn't do what you expected. It needs a negative phase to bounce off of! Use the Oracle first.")
            } else if (hasOracle && !hasH) {
                setBuilderFeedback("The Oracle flipped the phase, but without Superposition first, we still have only 1 possibility to check.")
            } else {
                setBuilderFeedback("Hmm, that didn't isolate the target state. Remember the order: Superposition -> Oracle -> Amplifier.")
            }
        }
    }, [winningBox])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <ModuleCanvas
                camera={{ position: [0, 0, 15], fov: 50 }}
                gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
            >
                <ambientLight intensity={2.5} />
                <directionalLight position={[5, 10, 5]} intensity={3.5} />
                <pointLight position={[-5, 5, 5]} intensity={2.0} color="#ffffff" />
                <AlgorithmsScene 
                    phase={phase} 
                    winningBox={winningBox} 
                    guessedBox={guessedBox}
                    onGuessBox={setGuessedBox}
                    qState={qState}
                    showAverage={showAverage}
                />
            </ModuleCanvas>

            <AlgorithmsOverlay 
                phase={phase} 
                winningBox={winningBox} 
                guessedBox={guessedBox}
                qState={qState}
                onApplyState={(newState) => setQState(newState)}
                showAverage={showAverage}
                setShowAverage={setShowAverage}
                onComplete={handlePhaseComplete} 
                panelsVisible={panelsVisible}
                builderFeedback={builderFeedback}
                onRunCircuit={handleRunCircuit}
            />
        </div>
    )
}
