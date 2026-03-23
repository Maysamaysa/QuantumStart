/**
 * SuperpositionModule.tsx — Shell for Module 2 "Superposition"
 */

import { useState, useCallback } from 'react'
import { useProgress } from '../../../context/ProgressContext'
import { useCat } from '../../../context/CatContext'
import { useCatNPCTransition } from '../../../hooks/useCatNPCTransition'
import { useModuleCatSetup } from '../../../hooks/useModuleCatSetup'
import { ModuleCanvas } from '../../../components/ModuleCanvas'
import SuperpositionScene from './SuperpositionScene'
import { SuperpositionOverlay } from './SuperpositionOverlay'
import type { Phase, Track } from './SuperpositionScene'

export function SuperpositionModule() {
    const { setQubitState } = useCat()
    const { completeModule } = useProgress()
    useModuleCatSetup('hidden', 'idle')

    const [phase, setPhase] = useState<Phase>('hook')
    const [track, setTrack] = useState<Track>(null)
    const [catSettled, setCatSettled] = useState(false)
    const { panelsVisible } = useCatNPCTransition(catSettled)

    const [hasTransformed, setHasTransformed] = useState(false)
    const [gateActive, setGateActive] = useState(false)
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)
    const [showParticles, setShowParticles] = useState(false)
    const [catRetreat, setCatRetreat] = useState(false)
    const [perfectScore, setPerfectScore] = useState(true)

    const handleTrackSelect = useCallback((t: 'blue' | 'amber') => {
        setTrack(t)
        setQubitState(t)
        const id = setTimeout(() => setPhase('lesson'), 2200)
        return () => clearTimeout(id)
    }, [setQubitState])

    const handleCatSettled = useCallback(() => setCatSettled(true), [])

    const handleLessonComplete = useCallback(() => {
        setPhase('quiz')
        setQuizCorrect(null)
        setPerfectScore(true)
    }, [])

    const handleQuizResult = useCallback((correct: boolean) => {
        setQuizCorrect(correct)
        if (!correct) setPerfectScore(false)
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1800)
        if (!correct) { 
            setCatRetreat(true)
            setTimeout(() => setCatRetreat(false), 2000) 
        } else {
            setCatRetreat(false)
        }
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
                    onCatSettled={handleCatSettled}
                    onGateTrigger={handleGateTrigger}
                    gateActive={gateActive}
                    hasTransformed={hasTransformed}
                    onTransform={() => setHasTransformed(true)}
                    quizCorrect={quizCorrect}
                    showParticles={showParticles}
                    catRetreat={catRetreat}
                />
            </ModuleCanvas>

            <SuperpositionOverlay
                panelsVisible={panelsVisible}
                track={track}
                phase={phase}
                hasTransformed={hasTransformed}
                onTrackSelect={handleTrackSelect}
                onLessonComplete={handleLessonComplete}
                onQuizComplete={handleQuizComplete}
                onQuizResult={handleQuizResult}
            />
        </div>
    )
}
