/**
 * SuperpositionModule.tsx — Shell for Module 2 "Superposition"
 */

import { useState, useCallback } from 'react'
import { useProgress } from '../../../context/ProgressContext'
import { useModuleCatSetup } from '../../../hooks/useModuleCatSetup'
import { ModuleCanvas } from '../../../components/ModuleCanvas'
import SuperpositionScene from './SuperpositionScene'
import { SuperpositionOverlay } from './SuperpositionOverlay'
import type { Phase, Track } from './SuperpositionScene'

export function SuperpositionModule() {
    const { completeModule } = useProgress()
    useModuleCatSetup('hidden', 'idle')

    const [phase, setPhase] = useState<Phase>('hook')
    const [track, setTrack] = useState<Track>(null)

    const [hasTransformed, setHasTransformed] = useState(false)
    const [hasPassedSecondGate, setHasPassedSecondGate] = useState(false)
    const [gateActive, setGateActive] = useState(false)
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)
    const [showParticles, setShowParticles] = useState(false)
    const [perfectScore, setPerfectScore] = useState(true)

    // Ensure dialog panels can show instantly since there's no cat
    const panelsVisible = true

    const handleTrackSelect = useCallback((t: 'blue' | 'amber') => {
        setTrack(t)
        const id = setTimeout(() => setPhase('lesson'), 2200)
        return () => clearTimeout(id)
    }, [])

    const handleLessonComplete = useCallback(() => {
        setPhase('sandbox')
    }, [])
    
    const handleCompareComplete = useCallback(() => {
        setPhase('quiz')
        setQuizCorrect(null)
        setPerfectScore(true)
    }, [])

    const handleQuizResult = useCallback((correct: boolean) => {
        setQuizCorrect(correct)
        if (!correct) setPerfectScore(false)
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1800)
    }, [])

    const handleQuizComplete = useCallback(() => {
        setPhase('complete')
        if (track) {
            completeModule('superposition', track, perfectScore)
        }
    }, [completeModule, track, perfectScore])

    const handleGateTrigger = useCallback(() => {
        setGateActive(true)
        setTimeout(() => setGateActive(false), 2500)
    }, [])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            <ModuleCanvas camera={{ position: [0, 0, 11], fov: 55 }}>
                <SuperpositionScene
                    track={track}
                    phase={phase}
                    onGateTrigger={handleGateTrigger}
                    gateActive={gateActive}
                    hasTransformed={hasTransformed}
                    onTransform={() => setHasTransformed(true)}
                    hasPassedSecondGate={hasPassedSecondGate}
                    onSecondGatePass={() => setHasPassedSecondGate(true)}
                    quizCorrect={quizCorrect}
                    showParticles={showParticles}
                />
            </ModuleCanvas>

            <SuperpositionOverlay
                panelsVisible={panelsVisible}
                track={track}
                phase={phase}
                hasTransformed={hasTransformed}
                hasPassedSecondGate={hasPassedSecondGate}
                onTrackSelect={handleTrackSelect}
                onLessonComplete={handleLessonComplete}
                onCompareComplete={handleCompareComplete}
                onQuizComplete={handleQuizComplete}
                onQuizResult={handleQuizResult}
            />
        </div>
    )
}
