/**
 * GatesTour.tsx — Split-pane gate tour with 2D Bloch sphere animation.
 * Ported from reference HTML, themed to app design system.
 */

import { useRef, useEffect, useState, useCallback } from 'react'

interface GateData {
    id: string
    name: string
    color: string
    borderColor: string
    ioColor: string
    outBg: string
    plain: string
    matrix: string[][]
    matrixTypes: string[][]
    io: [string, string][]
    blochStart: [number, number]
    blochEnd: [number, number]
    rotation: string
    isCNOT?: boolean
}

const GATES: GateData[] = [
    {
        id: 'H', name: 'Hadamard', color: '#7F77DD', borderColor: '#534AB7', ioColor: '#CECBF6', outBg: 'rgba(127,119,221,0.15)',
        plain: 'Takes a definite state (|0⟩ or |1⟩) and puts it into perfect superposition — exactly 50/50 probability of measuring either outcome. The "coin spinner" of quantum computing.',
        matrix: [['1/√2', '1/√2'], ['1/√2', '−1/√2']], matrixTypes: [['pos', 'pos'], ['pos', 'neg']],
        io: [['|0⟩', '|+⟩  (equal superposition)'], ['|1⟩', '|−⟩  (equal superposition)'], ['|+⟩', '|0⟩  (reverses back!)']],
        blochStart: [0, 0], blochEnd: [Math.PI / 2, 0], rotation: 'π around X+Z axis'
    },
    {
        id: 'X', name: 'Pauli-X (NOT)', color: '#E8593C', borderColor: '#993C1D', ioColor: '#F5C4B3', outBg: 'rgba(232,89,60,0.15)',
        plain: 'The quantum NOT gate. Flips |0⟩ to |1⟩ and vice versa — a 180° rotation around the X-axis of the Bloch sphere. Exactly like a classical NOT, but works on superpositions too.',
        matrix: [['0', '1'], ['1', '0']], matrixTypes: [['pos', 'pos'], ['pos', 'pos']],
        io: [['|0⟩', '|1⟩'], ['|1⟩', '|0⟩'], ['|+⟩', '|+⟩  (unchanged)']],
        blochStart: [0, 0], blochEnd: [Math.PI, 0], rotation: 'π around X axis'
    },
    {
        id: 'Y', name: 'Pauli-Y', color: '#EF9F27', borderColor: '#854F0B', ioColor: '#FAC775', outBg: 'rgba(239,159,39,0.15)',
        plain: 'Rotates the Bloch sphere 180° around the Y-axis. Flips the qubit like X does, but also applies a phase factor of i. Less intuitive than X, but essential for full control.',
        matrix: [['0', '−i'], ['i', '0']], matrixTypes: [['pos', 'img'], ['img', 'pos']],
        io: [['|0⟩', 'i|1⟩'], ['|1⟩', '−i|0⟩'], ['|+⟩', 'i|−⟩']],
        blochStart: [0, 0], blochEnd: [Math.PI, Math.PI / 2], rotation: 'π around Y axis'
    },
    {
        id: 'Z', name: 'Pauli-Z', color: '#1D9E75', borderColor: '#0F6E56', ioColor: '#9FE1CB', outBg: 'rgba(29,158,117,0.15)',
        plain: 'Leaves |0⟩ unchanged but flips the phase of |1⟩ to −|1⟩. Invisible to a simple measurement, but changes how the qubit interferes with others. A "phase flip" gate.',
        matrix: [['1', '0'], ['0', '−1']], matrixTypes: [['pos', 'pos'], ['pos', 'neg']],
        io: [['|0⟩', '|0⟩  (unchanged)'], ['|1⟩', '−|1⟩  (phase flip)'], ['|+⟩', '|−⟩']],
        blochStart: [Math.PI / 2, 0], blochEnd: [Math.PI / 2, Math.PI], rotation: 'π around Z axis'
    },
    {
        id: 'CNOT', name: 'CNOT', color: '#5DCAA5', borderColor: '#0F6E56', ioColor: '#9FE1CB', outBg: 'rgba(93,202,165,0.15)',
        plain: 'A two-qubit gate. The top qubit is the "control" — if it is |1⟩, the bottom qubit gets flipped. If control is |0⟩, nothing happens. This creates entanglement.',
        matrix: [['1', '0', '0', '0'], ['0', '1', '0', '0'], ['0', '0', '0', '1'], ['0', '0', '1', '0']],
        matrixTypes: [['pos', 'pos', 'pos', 'pos'], ['pos', 'pos', 'pos', 'pos'], ['pos', 'pos', 'pos', 'pos'], ['pos', 'pos', 'pos', 'pos']],
        io: [['|00⟩', '|00⟩'], ['|01⟩', '|01⟩'], ['|10⟩', '|11⟩  (target flipped)'], ['|11⟩', '|10⟩  (target flipped)']],
        blochStart: [0, 0], blochEnd: [0, 0], rotation: 'conditional X on target', isCNOT: true
    }
]

// Maps Bloch sphere angles to ket label
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
    // Generic intermediate label
    const alpha = Math.cos(theta / 2)
    const beta = Math.sin(theta / 2)
    if (alpha > 0.99) return '|0⟩'
    if (beta > 0.99) return '|1⟩'
    return `${alpha.toFixed(2)}|0⟩+${beta.toFixed(2)}|1⟩`
}

function easeInOut(x: number) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2 }

interface GatesTourProps {
    onComplete: () => void
}

export default function GatesTour({ onComplete }: GatesTourProps) {
    const [current, setCurrent] = useState(0)
    const [visited, setVisited] = useState<Set<number>>(new Set())
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef(0)
    const orbTRef = useRef(0)

    const gate = GATES[current]
    const isLast = current === GATES.length - 1

    const goTo = useCallback((i: number) => {
        setVisited(prev => new Set(prev).add(current))
        setCurrent(i)
    }, [current])

    const navigate = useCallback((dir: number) => {
        const next = current + dir
        if (next < 0) return
        if (next >= GATES.length) { onComplete(); return }
        setVisited(prev => new Set(prev).add(current))
        setCurrent(next)
    }, [current, onComplete])

    // Canvas animation
    const draw = useCallback(() => {
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

        orbTRef.current += 0.018
        const g = GATES[current]

        if (g.isCNOT) {
            drawCNOTScene(ctx, w, h, g)
        } else {
            drawBlochSphere(ctx, w / 2, h / 2 - 10, Math.min(w, h) * 0.28, g)
        }

        animRef.current = requestAnimationFrame(draw)
    }, [current])

    function drawBlochSphere(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, g: GateData) {
        const orbT = orbTRef.current
        // Sphere outline
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
        // Equator ellipse
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2); ctx.stroke()
        // Axes
        const axes = [
            { x: 0, y: -R * 1.15, label: '|0⟩', color: 'rgba(255,255,255,0.5)' },
            { x: 0, y: R * 1.15, label: '|1⟩', color: 'rgba(255,255,255,0.3)' },
            { x: R * 1.15, y: 0, label: 'X', color: 'rgba(255,255,255,0.2)' },
            { x: -R * 1.1, y: 0, label: '', color: 'rgba(255,255,255,0.2)' }
        ]
        axes.forEach(a => {
            ctx.strokeStyle = a.color; ctx.lineWidth = 0.5
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + a.x, cy + a.y); ctx.stroke()
            if (a.label) {
                ctx.font = "11px 'DM Sans', system-ui, sans-serif"; ctx.fillStyle = a.color; ctx.textAlign = 'center'
                ctx.fillText(a.label, cx + a.x, cy + a.y + (a.y > 0 ? 14 : -6))
            }
        })
        // Animated vector
        const loopT = orbT % (Math.PI * 2)
        const animLoop = Math.sin(loopT) * 0.5 + 0.5
        const ep = easeInOut(animLoop)
        const [st, sp] = g.blochStart, [et, ephi] = g.blochEnd
        const theta = st + (et - st) * ep, phi = sp + (ephi - sp) * ep
        const vx = Math.sin(theta) * Math.cos(phi), vy = -Math.cos(theta), vz = Math.sin(theta) * Math.sin(phi)
        const projX = cx + vx * R, projY = cy + vy * R + vz * R * 0.15
        // Trail
        for (let i = 0; i < 18; i++) {
            const tp = Math.max(0, animLoop - i * 0.035)
            const tep = easeInOut(Math.sin(tp * Math.PI * 2) * 0.5 + 0.5)
            const tth = st + (et - st) * tep, tph = sp + (ephi - sp) * tep
            const tvx = Math.sin(tth) * Math.cos(tph), tvy = -Math.cos(tth), tvz = Math.sin(tth) * Math.sin(tph)
            ctx.beginPath(); ctx.arc(cx + tvx * R, cy + tvy * R + tvz * R * 0.15, 2.5 * (1 - i / 18), 0, Math.PI * 2)
            ctx.fillStyle = g.color + Math.floor(0.4 * (1 - i / 18) * 255).toString(16).padStart(2, '0')
            ctx.fill()
        }
        // Vector line
        ctx.strokeStyle = g.color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(projX, projY); ctx.stroke()
        // Tip
        ctx.beginPath(); ctx.arc(projX, projY, 7, 0, Math.PI * 2); ctx.fillStyle = g.color; ctx.fill()
        ctx.beginPath(); ctx.arc(projX, projY, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill()
        // Arc
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.setLineDash([2, 4])
        ctx.beginPath(); ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (theta > 0 ? theta : 0.01))
        ctx.stroke(); ctx.setLineDash([])
        // Rotation label
        ctx.font = "11px 'DM Sans', system-ui, sans-serif"; ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText(g.rotation, cx, cy + R + 30)
        // Center dot
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill()

        // ─── Dynamic qubit state label ───
        const currentLabel = blochLabel(theta, phi)
        // Label background pill
        const lblX = projX + 18, lblY = projY - 14
        ctx.font = "bold 13px 'DM Sans', system-ui, sans-serif"
        const lblW = ctx.measureText(currentLabel).width + 16
        ctx.fillStyle = g.color + '30'
        ctx.beginPath()
        ctx.roundRect(lblX - 8, lblY - 12, lblW, 22, 6)
        ctx.fill()
        ctx.strokeStyle = g.color + '60'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(lblX - 8, lblY - 12, lblW, 22, 6)
        ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'left'
        ctx.fillText(currentLabel, lblX, lblY + 2)
    }

    function drawCNOTScene(ctx: CanvasRenderingContext2D, w: number, h: number, g: GateData) {
        const orbT = orbTRef.current
        const cx = w / 2, cy = h / 2
        const wireSpread = Math.min(w * 0.35, 120)
        const wireY1 = cy - 50, wireY2 = cy + 50, wireL = cx - wireSpread, wireR = cx + wireSpread
        const phase = Math.sin(orbT % (Math.PI * 2)) * 0.5 + 0.5
        // Wires
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(wireL, wireY1); ctx.lineTo(wireR, wireY1); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(wireL, wireY2); ctx.lineTo(wireR, wireY2); ctx.stroke()
        // Vertical connection
        ctx.strokeStyle = g.color; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(cx, wireY1 + 10); ctx.lineTo(cx, wireY2 - 14); ctx.stroke()
        // Control dot
        ctx.fillStyle = g.color
        ctx.beginPath(); ctx.arc(cx, wireY1, 10, 0, Math.PI * 2); ctx.fill()
        // Target circle + cross
        ctx.strokeStyle = g.color; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(cx, wireY2, 14, 0, Math.PI * 2); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(cx, wireY2 - 14); ctx.lineTo(cx, wireY2 + 14); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(cx - 14, wireY2); ctx.lineTo(cx + 14, wireY2); ctx.stroke()
        // Animated orbs
        const ep = easeInOut(phase)
        const orbX = wireL + (wireR - wireL) * ep
        const passedGate = ep > 0.5
        ctx.beginPath(); ctx.arc(orbX, wireY1, 7, 0, Math.PI * 2); ctx.fillStyle = '#378ADD'; ctx.fill()
        ctx.beginPath(); ctx.arc(orbX, wireY2, 7, 0, Math.PI * 2)
        ctx.fillStyle = passedGate ? g.color : 'rgba(255,255,255,0.3)'; ctx.fill()
        // Static labels
        ctx.font = "12px 'DM Sans', system-ui, sans-serif"; ctx.textAlign = 'left'
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillText('control', wireL - 4, wireY1 - 14)
        ctx.fillText('target', wireL - 4, wireY2 - 14)

        // ─── Dynamic qubit state labels (follow orbs) ───
        const ctrlLabel = '|1⟩'
        const targetLabel = passedGate ? '|0⟩ → |1⟩' : '|0⟩'
        ctx.font = "bold 12px 'DM Sans', system-ui, sans-serif"
        // Control orb label
        const cl = ctx.measureText(ctrlLabel).width + 12
        ctx.fillStyle = 'rgba(55,138,221,0.25)'
        ctx.beginPath(); ctx.roundRect(orbX - cl / 2, wireY1 - 28, cl, 20, 5); ctx.fill()
        ctx.strokeStyle = 'rgba(55,138,221,0.5)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.roundRect(orbX - cl / 2, wireY1 - 28, cl, 20, 5); ctx.stroke()
        ctx.fillStyle = '#85B7EB'; ctx.textAlign = 'center'
        ctx.fillText(ctrlLabel, orbX, wireY1 - 14)
        // Target orb label
        const tl = ctx.measureText(targetLabel).width + 12
        const tColor = passedGate ? g.color : 'rgba(255,255,255,0.4)'
        ctx.fillStyle = (passedGate ? g.color : 'rgba(255,255,255,0.15)') + (passedGate ? '30' : '')
        ctx.beginPath(); ctx.roundRect(orbX - tl / 2, wireY2 + 14, tl, 20, 5); ctx.fill()
        ctx.strokeStyle = tColor + (passedGate ? '60' : ''); ctx.lineWidth = 1
        ctx.beginPath(); ctx.roundRect(orbX - tl / 2, wireY2 + 14, tl, 20, 5); ctx.stroke()
        ctx.fillStyle = passedGate ? '#fff' : 'rgba(255,255,255,0.5)'; ctx.textAlign = 'center'
        ctx.fillText(targetLabel, orbX, wireY2 + 28)

        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.font = "11px 'DM Sans', system-ui, sans-serif"
        ctx.fillText('if control = |1⟩, target flips', cx, wireY2 + 56)
    }

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(animRef.current)
    }, [draw])

    // Color class helper
    const typeColor = (t: string) => {
        if (t === 'pos') return '#9FE1CB'
        if (t === 'neg') return '#F0997B'
        if (t === 'img') return '#FAC775'
        return '#AFA9EC'
    }

    const cols = gate.matrix[0].length

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, pointerEvents: 'auto',
            padding: '60px 28px 20px'
        }}>
            {/* Single glassmorphic card */}
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                background: 'rgba(18,14,38,0.45)',
                backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
            }}>
                {/* Gate Pills */}
                <div style={{
                    display: 'flex', gap: 6, padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                    {GATES.map((g, i) => (
                        <button key={g.id} onClick={() => goTo(i)} style={{
                            padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', system-ui, sans-serif",
                            color: i === current ? '#fff' : visited.has(i) ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
                            background: i === current ? 'rgba(255,255,255,0.15)' : visited.has(i) ? 'rgba(93,202,165,0.15)' : 'rgba(255,255,255,0.05)',
                            border: i === current ? '1px solid rgba(255,255,255,0.3)' : visited.has(i) ? '1px solid rgba(93,202,165,0.3)' : '1px solid transparent'
                        }}>
                            {g.id}
                        </button>
                    ))}
                </div>

                {/* Split pane */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', flex: 1, minHeight: 0 }}>
                    {/* Left: Canvas */}
                    <div style={{
                        position: 'relative',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        overflow: 'hidden'
                    }}>
                        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
                    </div>

                    {/* Right: Info */}
                    <div style={{
                        padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14,
                        overflowY: 'auto', minHeight: 0
                    }}>
                        {/* Name + badge */}
                        <div>
                            <span style={{ fontSize: 22, fontWeight: 500, color: '#fff' }}>{gate.name}</span>
                            <span style={{
                                display: 'inline-block', padding: '3px 12px', borderRadius: 6,
                                fontSize: 18, fontWeight: 700, fontFamily: 'monospace', marginLeft: 8,
                                background: gate.outBg, color: gate.color
                            }}>{gate.id}</span>
                        </div>

                        {/* Description */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>WHAT IT DOES</div>
                            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{gate.plain}</div>
                        </div>

                        {/* Matrix + Circuit */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>MATRIX</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.2)', lineHeight: 1 }}>[</span>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2,
                                        background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)',
                                        borderRadius: 8, padding: '8px 10px', fontFamily: 'monospace', fontSize: 13
                                    }}>
                                        {gate.matrix.flat().map((v, i) => {
                                            const r = Math.floor(i / cols), c = i % cols
                                            return <span key={i} style={{ color: typeColor(gate.matrixTypes[r][c]), textAlign: 'center', minWidth: 28 }}>{v}</span>
                                        })}
                                    </div>
                                    <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.2)', lineHeight: 1 }}>]</span>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>CIRCUIT SYMBOL</div>
                                {gate.isCNOT ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ height: 2, width: 22, background: 'rgba(255,255,255,0.25)' }} />
                                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: gate.color }} />
                                            <div style={{ height: 2, width: 60, background: 'rgba(255,255,255,0.25)' }} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ height: 2, width: 22, background: 'rgba(255,255,255,0.25)' }} />
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                <div style={{ position: 'absolute', left: 7, top: -18, width: 2, height: 18, background: gate.color }} />
                                                <div style={{
                                                    width: 20, height: 20, borderRadius: '50%', border: `2px solid ${gate.color}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <span style={{ fontSize: 14, color: gate.color, fontWeight: 700, lineHeight: 1 }}>+</span>
                                                </div>
                                            </div>
                                            <div style={{ height: 2, width: 53, background: 'rgba(255,255,255,0.25)' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ height: 2, width: 22, background: 'rgba(255,255,255,0.25)' }} />
                                        <div style={{
                                            padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontSize: 14,
                                            fontWeight: 700, border: `1.5px solid ${gate.borderColor}`,
                                            color: gate.color, background: 'rgba(0,0,0,0.3)'
                                        }}>{gate.id}</div>
                                        <div style={{ height: 2, width: 22, background: 'rgba(255,255,255,0.25)' }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* I/O table */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>INPUT → OUTPUT</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {gate.io.map(([inp, out], i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'monospace' }}>
                                        <span style={{ color: '#85B7EB', background: 'rgba(55,138,221,0.15)', padding: '3px 8px', borderRadius: 4 }}>{inp}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
                                        <span style={{ color: gate.ioColor, background: gate.outBg, padding: '3px 8px', borderRadius: 4 }}>{out}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        disabled={current === 0}
                        style={{
                            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: current === 0 ? 'default' : 'pointer',
                            border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: 'rgba(255,255,255,0.7)',
                            opacity: current === 0 ? 0.2 : 1, fontFamily: "'DM Sans', system-ui, sans-serif"
                        }}
                    >
                        ← Previous
                    </button>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{current + 1} of {GATES.length}</span>
                    <button
                        onClick={() => navigate(1)}
                        style={{
                            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            border: '1px solid #7F77DD', background: '#7F77DD', color: '#fff',
                            fontFamily: "'DM Sans', system-ui, sans-serif"
                        }}
                    >
                        {isLast ? 'Begin challenges →' : 'Next gate →'}
                    </button>
                </div>
            </div>
        </div>
    )
}

