/**
 * PortalCanvas2D.tsx — 2D canvas animation comparing Classical vs Quantum gates.
 * Ported from reference HTML and themed to match the app's design system.
 */

import { useRef, useEffect, useCallback } from 'react'

export default function PortalCanvas2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef<number>(0)
    const tRef = useRef(0)

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.parentElement?.getBoundingClientRect()
        if (!rect) return

        const dpr = window.devicePixelRatio || 1
        const targetW = Math.round(rect.width * dpr)
        const targetH = Math.round(rect.height * dpr)
        if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW
            canvas.height = targetH
            canvas.style.width = rect.width + 'px'
            canvas.style.height = rect.height + 'px'
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const W = rect.width
        const H = rect.height
        const t = tRef.current

        // ─── CONFIG ────────────────────────────────
        const GATE_W = 140
        const GATE_H = 300
        const GATE_Y = H / 2 - GATE_H / 2 - 10
        const CL_GX = W * 0.28
        const QT_GX = W * 0.72
        const CYCLE = 150

        // ─── THEME COLORS ──────────────────────────
        const BG_CARD = '#24253a'
        const CL_ORB = '#E8935A'
        const CL_INNER = '#FAC775'
        const CL_ACCENT = '#C4955A'
        const CL_X = '#E24B4A'
        const QT_PRIMARY = '#5DA7DB'
        const QT_TRANSFORMED = '#A67B5B'
        const QT_INNER = '#85B7EB'
        const QT_TRANS_INNER = '#CECBF6'
        const QT_ACCENT = '#5DA7DB'
        const LABEL_COLOR = '#F8F9FF'
        const SUBLABEL_CL = 'rgba(196,149,90,0.8)'
        const SUBLABEL_QT = 'rgba(93,167,219,0.8)'

        // ─── HELPERS ───────────────────────────────
        function easeInOut(x: number) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2 }

        // ─── CLEAR ─────────────────────────────────
        ctx.clearRect(0, 0, W, H)

        // ─── STARS ─────────────────────────────────
        const stars = [
            [0.05, 0.1], [0.15, 0.05], [0.25, 0.18], [0.08, 0.35], [0.18, 0.55], [0.03, 0.7],
            [0.12, 0.85], [0.22, 0.75], [0.3, 0.9], [0.35, 0.08], [0.45, 0.15], [0.55, 0.05],
            [0.65, 0.12], [0.75, 0.08], [0.85, 0.15], [0.92, 0.05], [0.97, 0.3], [0.88, 0.45],
            [0.95, 0.6], [0.82, 0.72], [0.9, 0.88], [0.72, 0.82], [0.62, 0.92], [0.48, 0.88],
            [0.38, 0.78], [0.52, 0.72], [0.42, 0.55], [0.58, 0.48]
        ]
        stars.forEach(([sx, sy], i) => {
            const pulse = 0.5 + 0.5 * Math.sin(t * 0.8 + i * 1.3)
            const r = (0.8 + 0.6 * pulse) * (i % 3 === 0 ? 1.4 : 1)
            ctx.beginPath()
            ctx.arc(sx * W, sy * H, r, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.4 * pulse).toFixed(2) + ')'
            ctx.fill()
        })

        // ─── DIVIDER ───────────────────────────────
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 6])
        ctx.beginPath()
        ctx.moveTo(W / 2, 20)
        ctx.lineTo(W / 2, H - 20)
        ctx.stroke()
        ctx.setLineDash([])

        // ─── DRAW GATE ─────────────────────────────
        function drawGate(x: number, y: number, w: number, h: number, borderColor: string, accentColor: string, label: string, sublabel: string, sublabelColor: string) {
            if (!ctx) return
            const barH = 7
            const rr = 4
            ctx.fillStyle = BG_CARD
            ctx.strokeStyle = borderColor
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(x - w / 2 + rr, y)
            ctx.lineTo(x + w / 2 - rr, y)
            ctx.quadraticCurveTo(x + w / 2, y, x + w / 2, y + rr)
            ctx.lineTo(x + w / 2, y + h - rr)
            ctx.quadraticCurveTo(x + w / 2, y + h, x + w / 2 - rr, y + h)
            ctx.lineTo(x - w / 2 + rr, y + h)
            ctx.quadraticCurveTo(x - w / 2, y + h, x - w / 2, y + h - rr)
            ctx.lineTo(x - w / 2, y + rr)
            ctx.quadraticCurveTo(x - w / 2, y, x - w / 2 + rr, y)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = accentColor
            ctx.fillRect(x - w / 2, y, w, barH)
            ctx.fillRect(x - w / 2, y + h - barH, w, barH)

            ctx.font = "600 14px 'DM Sans', system-ui, sans-serif"
            ctx.textAlign = 'center'
            ctx.fillStyle = LABEL_COLOR
            ctx.fillText(label, x, y - 18)

            ctx.font = "500 11px 'DM Sans', system-ui, sans-serif"
            ctx.fillStyle = sublabelColor
            ctx.fillText(sublabel, x, y + h + 18)
        }

        drawGate(CL_GX, GATE_Y, GATE_W, GATE_H, 'rgba(196,149,90,0.6)', CL_ACCENT, 'Classical gate', 'irreversible · one-way', SUBLABEL_CL)
        drawGate(QT_GX, GATE_Y, GATE_W, GATE_H, 'rgba(93,167,219,0.7)', QT_ACCENT, 'Quantum gate', 'reversible · two-way', SUBLABEL_QT)

        // ─── QUANTUM GLOW ──────────────────────────
        const qp = ((t + CYCLE * 0.15) % CYCLE) / CYCLE
        const inGate = (qp > 0.25 && qp < 0.42) || (qp > 0.75 && qp < 0.88)
        if (inGate) {
            const ep = qp < 0.5 ? (qp - 0.25) / 0.17 : (qp - 0.75) / 0.13
            ctx.save()
            ctx.globalAlpha = Math.sin(ep * Math.PI) * 0.2
            ctx.fillStyle = QT_PRIMARY
            ctx.fillRect(QT_GX - GATE_W / 2, GATE_Y, GATE_W, GATE_H)
            ctx.restore()
        }

        // ─── CLASSICAL ORB ─────────────────────────
        const cp = (t % CYCLE) / CYCLE
        const clMidY = GATE_Y + GATE_H / 2
        const clStartX = CL_GX - 130
        const clGateEnterX = CL_GX - GATE_W / 2

        if (cp < 0.35) {
            const ep = easeInOut(cp / 0.35)
            const x = clStartX + (clGateEnterX - clStartX) * ep
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath()
                ctx.arc(x - i * 18, clMidY, 13 * (1 - i * 0.25), 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(232,147,90,' + (0.15 - i * 0.04).toFixed(2) + ')'
                ctx.fill()
            }
            ctx.strokeStyle = 'rgba(196,149,90,0.4)'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(x, clMidY, 18, 0, Math.PI * 2)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(x, clMidY, 13, 0, Math.PI * 2)
            ctx.fillStyle = CL_ORB
            ctx.fill()
            ctx.beginPath()
            ctx.arc(x, clMidY, 6, 0, Math.PI * 2)
            ctx.fillStyle = CL_INNER
            ctx.fill()
        } else if (cp < 0.65) {
            const ep = (cp - 0.35) / 0.30
            const scale = 1 - easeInOut(ep)
            const x = CL_GX - GATE_W / 2 + GATE_W * easeInOut(ep) * 0.5
            if (scale > 0.02) {
                ctx.save()
                ctx.globalAlpha = scale
                ctx.beginPath()
                ctx.arc(x, clMidY, 13 * scale, 0, Math.PI * 2)
                ctx.fillStyle = CL_ORB
                ctx.fill()
                ctx.restore()
            }
            if (ep > 0.5) {
                const xp = easeInOut((ep - 0.5) / 0.5)
                const xs = 10 + xp * 16
                const ys = 10 + xp * 16
                ctx.save()
                ctx.globalAlpha = 0.7 * xp
                ctx.strokeStyle = CL_X
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(CL_GX - xs / 2, clMidY - ys / 2)
                ctx.lineTo(CL_GX + xs / 2, clMidY + ys / 2)
                ctx.moveTo(CL_GX + xs / 2, clMidY - ys / 2)
                ctx.lineTo(CL_GX - xs / 2, clMidY + ys / 2)
                ctx.stroke()
                ctx.restore()
            }
        } else {
            const ep = (cp - 0.65) / 0.35
            const xs = 16 * (1 - easeInOut(ep))
            const ys = 16 * (1 - easeInOut(ep))
            ctx.save()
            ctx.globalAlpha = (1 - easeInOut(ep)) * 0.6
            ctx.strokeStyle = CL_X
            ctx.lineWidth = 2
            if (xs > 0.5) {
                ctx.beginPath()
                ctx.moveTo(CL_GX - xs / 2, clMidY - ys / 2)
                ctx.lineTo(CL_GX + xs / 2, clMidY + ys / 2)
                ctx.moveTo(CL_GX + xs / 2, clMidY - ys / 2)
                ctx.lineTo(CL_GX - xs / 2, clMidY + ys / 2)
                ctx.stroke()
            }
            ctx.restore()
        }

        // ─── QUANTUM ORB ───────────────────────────
        const qtMidY = GATE_Y + GATE_H / 2
        const qtStartX = QT_GX - 130
        const qtGateL = QT_GX - GATE_W / 2
        const qtGateR = QT_GX + GATE_W / 2
        const qtEndX = QT_GX + 130

        let qx: number
        let qColor: string
        let qInnerColor: string

        if (qp < 0.25) {
            const ep = easeInOut(qp / 0.25)
            qx = qtStartX + (qtGateL - qtStartX) * ep
            qColor = QT_PRIMARY
            qInnerColor = QT_INNER
        } else if (qp < 0.42) {
            const ep = easeInOut((qp - 0.25) / 0.17)
            qx = qtGateL + (qtGateR - qtGateL) * ep
            const r = Math.round(93 + ep * 73)
            const g = Math.round(167 - ep * 44)
            const b = Math.round(219 - ep * 128)
            qColor = 'rgb(' + r + ',' + g + ',' + b + ')'
            qInnerColor = QT_TRANS_INNER
        } else if (qp < 0.58) {
            const ep = easeInOut((qp - 0.42) / 0.16)
            qx = qtGateR + (qtEndX - qtGateR) * ep
            qColor = QT_TRANSFORMED
            qInnerColor = QT_TRANS_INNER
            ctx.save()
            for (let i = 1; i <= 4; i++) {
                ctx.beginPath()
                ctx.arc(qx - i * 16, qtMidY, 13 * (1 - i * 0.2), 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(166,123,91,' + (0.12 - i * 0.02).toFixed(2) + ')'
                ctx.fill()
            }
            ctx.restore()
        } else if (qp < 0.75) {
            const ep = easeInOut((qp - 0.58) / 0.17)
            qx = qtEndX - (qtEndX - qtGateR) * ep
            qColor = QT_TRANSFORMED
            qInnerColor = QT_TRANS_INNER
        } else if (qp < 0.88) {
            const ep = easeInOut((qp - 0.75) / 0.13)
            qx = qtGateR - (qtGateR - qtGateL) * ep
            const r = Math.round(166 - ep * 73)
            const g = Math.round(123 + ep * 44)
            const b = Math.round(91 + ep * 128)
            qColor = 'rgb(' + r + ',' + g + ',' + b + ')'
            qInnerColor = QT_INNER
        } else {
            const ep = easeInOut((qp - 0.88) / 0.12)
            qx = qtGateL - (qtGateL - qtStartX) * ep
            qColor = QT_PRIMARY
            qInnerColor = QT_INNER
        }

        // Outer ring
        let ringAlpha: string
        if (qColor.startsWith('rgb(')) {
            ringAlpha = qColor.replace('rgb(', 'rgba(').replace(')', ',0.35)')
        } else {
            ringAlpha = qColor + '59'
        }
        ctx.strokeStyle = ringAlpha
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(qx, qtMidY, 18, 0, Math.PI * 2)
        ctx.stroke()
        // Orb body
        ctx.beginPath()
        ctx.arc(qx, qtMidY, 13, 0, Math.PI * 2)
        ctx.fillStyle = qColor
        ctx.fill()
        // Inner dot
        ctx.beginPath()
        ctx.arc(qx, qtMidY, 5.5, 0, Math.PI * 2)
        ctx.fillStyle = qInnerColor
        ctx.fill()

        // Spin particles when transformed & exiting
        if (qp >= 0.42 && qp < 0.58) {
            const spinT = (qp - 0.42) / 0.16
            for (let i = 0; i < 6; i++) {
                const angle = spinT * Math.PI * 4 + i * Math.PI / 3
                ctx.beginPath()
                ctx.arc(qx + Math.cos(angle) * 20, qtMidY + Math.sin(angle) * 7, 2, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(206,203,246,' + (0.5 + 0.4 * Math.sin(angle + t * 0.1)).toFixed(2) + ')'
                ctx.fill()
            }
        }

        // "Reversing" label
        if (qp > 0.58) {
            ctx.font = "500 11px 'DM Sans', system-ui, sans-serif"
            ctx.textAlign = 'center'
            ctx.fillStyle = 'rgba(193,225,193,0.8)'
            ctx.fillText('\u21BA reversing', QT_GX, GATE_Y + GATE_H + 36)
        }

        // ─── LOOP ──────────────────────────────────
        tRef.current += 0.4
        animRef.current = requestAnimationFrame(draw)
    }, [])

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw)
        const handleResize = () => {
            if (canvasRef.current) canvasRef.current.width = 0
        }
        window.addEventListener('resize', handleResize)
        return () => {
            cancelAnimationFrame(animRef.current)
            window.removeEventListener('resize', handleResize)
        }
    }, [draw])

    return (
        <div style= {{
        position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                    alignItems: 'center',
                        justifyContent: 'center',
                            zIndex: 5
    }
}>
    <div style={
    {
        width: '100%',
            maxWidth: 860,
                height: '60vh',
                    maxHeight: 420,
                        borderRadius: 16,
                            overflow: 'hidden'
    }
}>
    <canvas
                    ref={ canvasRef }
style = {{ display: 'block', width: '100%', height: '100%' }}
                />
    </div>
    </div>
    )
}
