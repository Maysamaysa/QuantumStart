/**
 * QubitModule.tsx — Shell for Module 1 "What is a Qubit?"
 */

import { useState, useCallback, useEffect } from 'react'
import { useProgress } from '../../../context/hooks'
import { ModuleCanvas } from '../../../components/ModuleCanvas'
import QubitScene from './QubitScene'
import { QubitOverlay } from './QubitOverlay'
import type { Phase, Track } from './QubitScene'

export function QubitModule() {
    const { completeModule } = useProgress()

    const [phase, setPhase] = useState<Phase>('hook')
    const [track, setTrack] = useState<Track>(null)
    const [panelsVisible, setPanelsVisible] = useState(false)
    useEffect(() => {
        const id = setTimeout(() => setPanelsVisible(true), 500)
        return () => clearTimeout(id)
    }, [])

    const [sphereClicked, setSphereClicked] = useState(false)
    const [mazeMode, setMazeMode] = useState<'idle' | 'classical' | 'quantum'>('idle')
    const [coinClickedCompare, setCoinClickedCompare] = useState(false)
    const [qubitClickedCompare, setQubitClickedCompare] = useState(false)
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)
    const [showParticles, setShowParticles] = useState(false)
    const [equationStep, setEquationStep] = useState(-1)

    const handleTrackSelect = useCallback((t: 'blue' | 'amber') => {
        setTrack(t)
        const id = setTimeout(() => setPhase('lesson'), 2200)
        return () => clearTimeout(id)
    }, [])


    const handleLessonComplete = useCallback(() => {
        setPhase('compare')
        setMazeMode('idle')
        setCoinClickedCompare(false)
        setQubitClickedCompare(false)
    }, [])

    const handleCompareComplete = useCallback(() => {
        setPhase('quiz')
        setSphereClicked(false)
        setQuizCorrect(null)
    }, [])

    const handleQuizResult = useCallback((correct: boolean) => {
        setQuizCorrect(correct)
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1800)
    }, [])

    const handleQuizComplete = useCallback(() => {
        setPhase('complete')
        if (track) {
            completeModule('qubit', track)
        }
    }, [completeModule, track])

    const handleSphereClick = useCallback(() => {
        if (phase === 'compare') setQubitClickedCompare(true)
        if (phase === 'quiz') setSphereClicked(true)
    }, [phase])

    const handleCoinClick = useCallback(() => {
        if (phase === 'compare') setCoinClickedCompare(true)
    }, [phase])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            {/* R3F scene (lesson-specific objects) */}
            <ModuleCanvas camera={{ position: [0, 0, 11], fov: 55 }}>
                <QubitScene
                    track={track}
                    phase={phase}
                    mazeMode={mazeMode}
                    onCoinClick={handleCoinClick}
                    onSphereClick={handleSphereClick}
                    quizCorrect={quizCorrect}
                    showParticles={showParticles}
                    equationStep={equationStep}
                />
            </ModuleCanvas>

            {/* HTML overlay */}
            <QubitOverlay
                panelsVisible={panelsVisible}
                track={track}
                phase={phase}
                onTrackSelect={handleTrackSelect}
                onLessonComplete={handleLessonComplete}
                onCompareComplete={handleCompareComplete}
                onQuizComplete={handleQuizComplete}
                onQuizResult={handleQuizResult}
                sphereClicked={sphereClicked}
                mazeMode={mazeMode}
                setMazeMode={setMazeMode}
                coinClickedCompare={coinClickedCompare}
                qubitClickedCompare={qubitClickedCompare}
                setEquationStep={setEquationStep}
            />
        </div>
    )
}
