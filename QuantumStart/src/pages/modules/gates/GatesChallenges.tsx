import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { applyGate1Q, formatStateString, INITIAL_STATE, stateToBloch } from './gateLogic'
import type { State1Q, State2Q } from './gateLogic'
import { GATES as MATH_GATES } from '../../../config/gates'

const GATE_COLORS: Record<string, { color: string, borderColor: string }> = {
    H: { color: '#7F77DD', borderColor: '#534AB7' },
    X: { color: '#E8593C', borderColor: '#993C1D' },
    Y: { color: '#EF9F27', borderColor: '#854F0B' },
    Z: { color: '#1D9E75', borderColor: '#0F6E56' },
    CNOT: { color: '#5DCAA5', borderColor: '#0F6E56' }
}

const CHALLENGES = [
    { text: "Challenge 1: Create Superposition", target: "|+⟩", hint: "Which gate creates a 50/50 chance of 0 or 1?" },
    { text: "Challenge 2: Flip then Superpose", target: "|−⟩", hint: "Try flipping it to |1⟩ first, then create superposition." },
    { text: "Challenge 3: Entangle two qubits", target: "Entangled", hint: "Put the first qubit in superposition, then use CNOT." }
]

function blochLabel(theta: number, _phi: number): string {
    const eps = 0.15
    if (theta < eps) return '|0⟩'
    if (Math.abs(theta - Math.PI) < eps) return '|1⟩'
    if (Math.abs(theta - Math.PI / 2) < eps) {
        if (Math.abs(_phi) < eps || Math.abs(_phi - Math.PI * 2) < eps) return '|+⟩'
        if (Math.abs(_phi - Math.PI) < eps) return '|−⟩'
        if (Math.abs(_phi - Math.PI / 2) < eps) return '|+i⟩'
        if (Math.abs(_phi - 3 * Math.PI / 2) < eps) return '|−i⟩'
    }
    const alpha = Math.cos(theta / 2)
    const beta = Math.sin(theta / 2)
    if (alpha > 0.99) return '|0⟩'
    if (beta > 0.99) return '|1⟩'
    return `${alpha.toFixed(2)}|0⟩+${beta.toFixed(2)}|1⟩`
}

export interface GatesChallengesProps {
    challengeIdx: number
    setChallengeIdx: (v: number) => void
    wireState1: State1Q
    setWireState1: (v: State1Q) => void
    wireState2: State1Q
    setWireState2: (v: State1Q) => void
    isEntangled: boolean
    setIsEntangled: (v: boolean) => void
    onComplete: () => void
}

export default function GatesChallenges(props: GatesChallengesProps) {
    const { challengeIdx, setChallengeIdx, wireState1, setWireState1, wireState2, setWireState2, isEntangled, setIsEntangled, onComplete } = props
    
    const [msg, setMsg] = useState(CHALLENGES[challengeIdx].hint)
    const [appliedGates, setAppliedGates] = useState<{ gate: string, targetQuBit: 1 | 2 }[]>([])
    
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef(0)

    // Reset everything when challenge changes
    useEffect(() => {
        setWireState1(INITIAL_STATE)
        setWireState2(INITIAL_STATE)
        setIsEntangled(false)
        setAppliedGates([])
        setMsg(CHALLENGES[challengeIdx].hint)
    }, [challengeIdx, setWireState1, setWireState2, setIsEntangled])

    const handleApplyGate = (gate: string, targetQuBit: 1 | 2 = 1) => {
        if (gate === 'CNOT' && challengeIdx === 2) {
            const stateH = formatStateString(wireState1)
            if (stateH === '|+⟩' || stateH === '|−⟩') {
                setIsEntangled(true)
                setAppliedGates(prev => [...prev, { gate: 'CNOT', targetQuBit: 1 }])
                setMsg("Nice! These two qubits are now entangled — measuring one instantly determines the other.")
                setTimeout(() => {
                    onComplete()
                }, 4000)
            } else {
                setMsg("Try putting the first qubit in superposition before using CNOT.")
            }
            return
        }

        const newState = applyGate1Q(MATH_GATES[gate as keyof typeof MATH_GATES], targetQuBit === 1 ? wireState1 : wireState2)
        if (targetQuBit === 1) setWireState1(newState)
        else setWireState2(newState)

        setAppliedGates(prev => [...prev, { gate, targetQuBit }])

        if (challengeIdx === 0) {
            if (formatStateString(newState) === '|+⟩') {
                setMsg("The universe and I agree: you're a natural! Challenge 1 Complete.")
                setTimeout(() => setChallengeIdx(1), 2000)
            } else {
                setMsg("Not quite |+⟩. Hint: The gate we need is named after Jacques Hadamard.")
            }
        } else if (challengeIdx === 1) {
            if (formatStateString(newState) === '|−⟩') {
                setMsg("Notice: X first, then H gives |−⟩. This is why gates don't commute! Challenge 2 Complete.")
                setTimeout(() => setChallengeIdx(2), 4000)
            } else if (formatStateString(newState) === '|1⟩') {
                 setMsg("Good step! Now what gate gives superposition?")
            } else {
                 setMsg("We need it to face the opposite phase. Try X then H.")
            }
        }
    }

    const handleReset = () => {
        setWireState1(INITIAL_STATE)
        setWireState2(INITIAL_STATE)
        setIsEntangled(false)
        setAppliedGates([])
        setMsg(CHALLENGES[challengeIdx].hint)
    }

    // Canvas rendering
    useEffect(() => {
        let req: number
        const render = () => {
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            const rect = canvas.parentElement?.getBoundingClientRect()
            if (!rect) return

            const dpr = window.devicePixelRatio || 1
            const w = rect.width
            const h = rect.height
            if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                canvas.width = Math.round(w * dpr)
                canvas.height = Math.round(h * dpr)
                canvas.style.width = w + 'px'
                canvas.style.height = h + 'px'
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, w, h)

            animRef.current += 0.05
            const pulse = (Math.sin(animRef.current) + 1) / 2

            const cx = w / 2
            const cy = h / 2
            const isDual = challengeIdx === 2
            
            const wireY1 = isDual ? cy - 60 : cy
            const wireY2 = isDual ? cy + 60 : cy
            const wireStartX = 40
            const wireEndX = w - 100

            // Draw Wires
            ctx.strokeStyle = 'rgba(93, 167, 219, 0.4)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(wireStartX, wireY1)
            ctx.lineTo(wireEndX, wireY1)
            ctx.stroke()

            if (isDual) {
                ctx.strokeStyle = 'rgba(196, 149, 90, 0.4)'
                ctx.beginPath()
                ctx.moveTo(wireStartX, wireY2)
                ctx.lineTo(wireEndX, wireY2)
                ctx.stroke()
                
                ctx.font = "bold 14px 'Space Mono', monospace"
                ctx.fillStyle = "rgba(255,255,255,0.7)"
                ctx.fillText("|0⟩", 10, wireY2 + 5)
            }

            // Initial state label
            ctx.font = "bold 14px 'Space Mono', monospace"
            ctx.fillStyle = "rgba(255,255,255,0.7)"
            ctx.fillText("|0⟩", 10, wireY1 + 5)

            // Draw Applied Gates
            const gateBoxSize = 40
            let currentX = wireStartX + 40
            
            appliedGates.forEach((item, i) => {
                const colors = GATE_COLORS[item.gate] || { color: '#ffffff', borderColor: '#ffffff' }
                
                if (item.gate === 'CNOT') {
                    // Control dot
                    ctx.fillStyle = colors.color
                    ctx.beginPath()
                    ctx.arc(currentX, wireY1, 6, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // Target cross
                    ctx.strokeStyle = colors.color
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.arc(currentX, wireY2, 12, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(currentX, wireY2 - 12)
                    ctx.lineTo(currentX, wireY2 + 12)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(currentX - 12, wireY2)
                    ctx.lineTo(currentX + 12, wireY2)
                    ctx.stroke()
                    
                    // Line
                    ctx.beginPath()
                    ctx.moveTo(currentX, wireY1)
                    ctx.lineTo(currentX, wireY2 - 12)
                    ctx.stroke()
                } else {
                    const y = item.targetQuBit === 1 ? wireY1 : wireY2
                    ctx.fillStyle = 'rgba(0,0,0,0.8)'
                    ctx.fillRect(currentX - gateBoxSize/2, y - gateBoxSize/2, gateBoxSize, gateBoxSize)
                    
                    ctx.strokeStyle = colors.borderColor
                    ctx.lineWidth = 2
                    ctx.strokeRect(currentX - gateBoxSize/2, y - gateBoxSize/2, gateBoxSize, gateBoxSize)
                    
                    ctx.font = "bold 16px 'DM Sans', sans-serif"
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillStyle = colors.color
                    ctx.fillText(item.gate, currentX, y)
                }
                
                currentX += 60
            })

            // Draw final state label
            const { theta, phi } = stateToBloch(wireState1)
            const lbl1 = blochLabel(theta, phi)
            ctx.font = "bold 16px 'Space Mono', monospace"
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            
            if (isEntangled) {
                // Entangled label
                ctx.fillStyle = `rgba(255, 183, 197, ${0.8 + 0.2 * pulse})`
                ctx.fillText("|Φ+⟩", wireEndX + 10, cy)
                
                // Entanglement glowing link
                ctx.strokeStyle = `rgba(255, 183, 197, ${0.4 + 0.2 * pulse})`
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.moveTo(wireEndX - 10, wireY1)
                ctx.lineTo(wireEndX - 10, wireY2)
                ctx.stroke()
            } else {
                ctx.fillStyle = "#5DA7DB"
                ctx.fillText(lbl1, wireEndX + 10, wireY1)
                if (isDual) {
                    const { theta: t2, phi: p2 } = stateToBloch(wireState2)
                    const lbl2 = blochLabel(t2, p2)
                    ctx.fillStyle = "#C4955A"
                    ctx.fillText(lbl2, wireEndX + 10, wireY2)
                }
            }

            req = requestAnimationFrame(render)
        }
        req = requestAnimationFrame(render)
        return () => cancelAnimationFrame(req)
    }, [wireState1, wireState2, appliedGates, isEntangled, challengeIdx])

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(5, 5, 15, 0.4)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
        }}>
            <div style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr',
                width: '85vw', maxWidth: '1000px', height: '65vh',
                background: 'rgba(15, 12, 30, 0.85)',
                backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                borderRadius: 24, padding: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
            }}>
                {/* LEFT: CANVAS */}
                <div style={{
                    position: 'relative', background: 'rgba(0,0,0,0.2)',
                    borderRadius: 16, overflow: 'hidden'
                }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }} />
                </div>

                {/* RIGHT: UI PANEL */}
                <div style={{
                    display: 'flex', flexDirection: 'column', padding: '24px',
                    color: '#fff', fontFamily: "'DM Sans', sans-serif"
                }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 28, margin: '0 0 12px 0', color: '#5DA7DB', fontWeight: 800 }}>
                            {CHALLENGES[challengeIdx].text}
                        </h2>
                        
                        <div style={{ 
                            background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24
                        }}>
                            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Target state:</span>
                            <span style={{ fontSize: 24, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#C1E1C1' }}>
                                {CHALLENGES[challengeIdx].target}
                            </span>
                        </div>

                        {/* GATE PALETTE */}
                        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                            APPLY GATE
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                            {['H', 'X', 'Y', 'Z', 'CNOT'].map(g => {
                                const btnColor = GATE_COLORS[g].color
                                // Only show CNOT in challenge 3
                                if (g === 'CNOT' && challengeIdx < 2) return null
                                return (
                                    <button key={g} onClick={() => handleApplyGate(g)} style={{
                                        background: `rgba(0,0,0,0.4)`,
                                        border: `1.5px solid ${btnColor}`,
                                        color: btnColor,
                                        padding: '10px 18px', borderRadius: 10,
                                        fontSize: 16, fontWeight: 700, fontFamily: 'monospace',
                                        cursor: 'pointer', transition: 'all 0.1s'
                                    }}>
                                        {g}
                                    </button>
                                )
                            })}
                        </div>
                        
                        {/* HINT */}
                        <div style={{ 
                            background: 'rgba(93, 167, 219, 0.1)', borderLeft: '3px solid #5DA7DB',
                            padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, lineHeight: 1.5,
                            color: 'rgba(255,255,255,0.85)', minHeight: 60
                        }}>
                            {msg}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                        <button onClick={handleReset} style={{
                            padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                            background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer'
                        }}>
                            Reset Try
                        </button>
                        <div style={{ flex: 1, textAlign: 'right', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                            Challenge {challengeIdx + 1} of 3
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
