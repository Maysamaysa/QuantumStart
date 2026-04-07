import { useState, useCallback, useRef } from 'react'
import MeasurementScene from './MeasurementScene'
import { MeasurementOverlay } from './MeasurementOverlay'
import { useProgress } from '../../../context/hooks'
import { ModuleCanvas } from '../../../components/ModuleCanvas'

export type Phase = 'concept' | 'collapse' | 'sandbox' | 'quiz' | 'complete'
export type Basis = 'Z' | 'X' | 'Y'

export function MeasurementModule() {
    const { completeModule } = useProgress()
    const run50IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const [phase, setPhase] = useState<Phase>('concept')
    const [step, setStep] = useState(1)

    const [theta, setTheta] = useState(Math.PI / 2)
    const [phi, setPhi] = useState(0)

    const [measuredValue, setMeasuredValue] = useState<0 | 1 | null>(null)
    const [isMeasured, setIsMeasured] = useState(false)
    const [histogram, setHistogram] = useState({ 0: 0, 1: 0 })
    
    const [basis, setBasis] = useState<Basis>('Z')
    const [quizQuestion, setQuizQuestion] = useState(1)

    const handleNext = useCallback(() => {
        if (phase === 'concept') {
            if (step < 3) setStep(step + 1)
            else { setPhase('collapse'); setStep(1); }
        } else if (phase === 'collapse') {
            setPhase('sandbox')
            setStep(1)
        } else if (phase === 'sandbox') {
            setPhase('quiz')
            setStep(1)
        }
    }, [phase, step])

    const handleBack = useCallback(() => {
        if (phase === 'concept' && step > 1) {
            setStep(step - 1)
        } else if (phase === 'collapse') {
            setPhase('concept')
            setStep(3)
        } else if (phase === 'sandbox') {
            setPhase('collapse')
            setStep(1)
        }
    }, [phase, step])

    const getProb0 = useCallback(() => {
        if (basis === 'Z') return Math.pow(Math.cos(theta / 2), 2)
        if (basis === 'X') return 0.5 * (1 + Math.sin(theta) * Math.cos(phi))
        if (basis === 'Y') return 0.5 * (1 + Math.sin(theta) * Math.sin(phi))
        return 0.5
    }, [theta, phi, basis])

    const performMeasurement = useCallback(() => {
        const p0 = getProb0()
        const outcome = Math.random() < p0 ? 0 : 1
        setMeasuredValue(outcome)
        setIsMeasured(true)
        setHistogram(prev => ({ ...prev, [outcome]: prev[outcome] + 1 }))
    }, [getProb0])

    const handleMeasure = useCallback(() => {
        if (isMeasured) return
        performMeasurement()
    }, [isMeasured, performMeasurement])

    const handleReset = useCallback(() => {
        setIsMeasured(false)
        setMeasuredValue(null)
    }, [])

    const handleRun50 = useCallback(() => {
        handleReset()
        if (run50IntervalRef.current) clearInterval(run50IntervalRef.current)
        let shots = 0
        run50IntervalRef.current = setInterval(() => {
            if (shots >= 50) {
                clearInterval(run50IntervalRef.current!)
                run50IntervalRef.current = null
                return
            }
            const p0 = getProb0()
            const outcome = Math.random() < p0 ? 0 : 1
            setHistogram(prev => ({ ...prev, [outcome]: prev[outcome] + 1 }))
            shots++
        }, 30)
    }, [getProb0, handleReset])

    const handleQuizAnswer = useCallback((correct: boolean) => {
        if (correct) {
            if (quizQuestion < 3) {
                setQuizQuestion(q => q + 1)
            } else {
                setPhase('complete')
                completeModule('measurement', 'blue', true)
            }
        }
    }, [quizQuestion, completeModule])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', pointerEvents: 'auto' }}>
            <ModuleCanvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                style={{ pointerEvents: 'auto' }}
            >
                <ambientLight intensity={1.2} />
                <directionalLight position={[5, 5, 5]} intensity={1.8} />
                <MeasurementScene 
                    phase={phase} 
                    step={step} 
                    theta={theta} 
                    phi={phi}
                    isMeasured={isMeasured}
                    measuredValue={measuredValue}
                    basis={basis}
                />
            </ModuleCanvas>

            <MeasurementOverlay 
                phase={phase}
                step={step}
                theta={theta}
                setTheta={setTheta}
                phi={phi}
                setPhi={setPhi}
                isMeasured={isMeasured}
                measuredValue={measuredValue}
                basis={basis}
                setBasis={setBasis}
                histogram={histogram}
                quizQuestion={quizQuestion}
                onMeasure={handleMeasure}
                onReset={handleReset}
                onRun50={handleRun50}
                onClearHistogram={() => setHistogram({0:0, 1:0})}
                onNext={handleNext}
                onBack={handleBack}
                onQuizAnswer={handleQuizAnswer}
            />
        </div>
    )
}
