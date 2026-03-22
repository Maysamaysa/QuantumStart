/**
 * QubitModule.tsx — Shell for Module 1 "What is a Qubit?"
 */

import { useState, useCallback } from 'react'
import { useProgress } from '../../../context/ProgressContext'
import { useCat } from '../../../context/CatContext'
import { useCatNPCTransition } from '../../../hooks/useCatNPCTransition'
import { useModuleCatSetup } from '../../../hooks/useModuleCatSetup'
import { ModuleCanvas } from '../../../components/ModuleCanvas'
import QubitScene from './QubitScene'
import { QubitOverlay } from './QubitOverlay'
import type { Phase, Track } from './QubitScene'

export function QubitModule() {
    const { setQubitState } = useCat()
    const { completeModule } = useProgress()
    useModuleCatSetup('corner', 'idle')

    const [phase, setPhase] = useState<Phase>('hook')
    const [track, setTrack] = useState<Track>(null)
    const [catSettled, setCatSettled] = useState(false)
    const { panelsVisible } = useCatNPCTransition(catSettled)

    const [sphereClicked, setSphereClicked] = useState(false)
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)
    const [showParticles, setShowParticles] = useState(false)
    const [catRetreat, setCatRetreat] = useState(false)

    const handleTrackSelect = useCallback((t: 'blue' | 'amber') => {
        setTrack(t)
        setQubitState(t)
        const id = setTimeout(() => setPhase('lesson'), 2200)
        return () => clearTimeout(id)
    }, [setQubitState])

    const handleCatSettled = useCallback(() => setCatSettled(true), [])

    const handleLessonComplete = useCallback(() => {
        setPhase('quiz')
        setSphereClicked(false)
        setQuizCorrect(null)
    }, [])

    const handleQuizResult = useCallback((correct: boolean) => {
        setQuizCorrect(correct)
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1800)
        if (!correct) { setCatRetreat(true); setTimeout(() => setCatRetreat(false), 2000) }
        else setCatRetreat(false)
    }, [])

    const handleQuizComplete = useCallback(() => {
        setPhase('complete')
        if (track) {
            completeModule('qubit', track)
        }
    }, [completeModule, track])

    const handleSphereClick = useCallback(() => {
        if (phase === 'quiz') setSphereClicked(true)
    }, [phase])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            {/* R3F scene (lesson-specific objects) */}
            <ModuleCanvas camera={{ position: [0, 0, 11], fov: 55 }}>
                <QubitScene
                    track={track}
                    phase={phase}
                    onCatSettled={handleCatSettled}
                    onCoinClick={() => { /* coin flip handled inside scene */ }}
                    onSphereClick={handleSphereClick}
                    quizCorrect={quizCorrect}
                    showParticles={showParticles}
                    catRetreat={catRetreat}
                />
            </ModuleCanvas>

            {/* HTML overlay */}
            <QubitOverlay
                panelsVisible={panelsVisible}
                track={track}
                phase={phase}
                onTrackSelect={handleTrackSelect}
                onLessonComplete={handleLessonComplete}
                onQuizComplete={handleQuizComplete}
                onQuizResult={handleQuizResult}
                sphereClicked={sphereClicked}
            />
        </div>
    )
}
