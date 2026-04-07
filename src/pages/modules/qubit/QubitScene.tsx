/**
 * QubitScene.tsx — R3F scene for "What is a Qubit?"
 *
 * ─── MODEL SIZE CONFIG ────────────────────────────────────────────
 *  Cat NPC:    <group scale={CAT_SCALE}>  (outer group)
 *              <primitive scale={CAT_GLB_SCALE}> (koi_cat.glb inner)
 *  Coin:       CylinderGeometry args={[COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 36]}
 *  Qubit:      SphereGeometry args={[QUBIT_RADIUS, 32, 32]}
 *  Orbit rings:TorusGeometry args={[ORBIT_RADIUS, 0.018, 8, 64]}
 *  Lotus pad:  CylinderGeometry args={[PAD_RADIUS, PAD_RADIUS, 0.06, 32]}
 * ──────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
// import { color } from 'three/tsl'

export type Phase = 'hook' | 'lesson' | 'compare' | 'quiz' | 'complete'
export type Track = 'blue' | 'amber' | null

// ─── SIZE CONSTANTS (edit here to resize scene objects) ───────────────────────
const COIN_RADIUS = 1.42
const COIN_HEIGHT = 0.15
const QUBIT_RADIUS = 1.25
const ORBIT_RADIUS = 1.7

// ─── MODEL POSITIONS ──────────────────────────────────────────────────────────
const COIN_X = -6.0
const COIN_Y = 0.2
const QUBIT_X = 6.0
const QUBIT_Y = 0.2

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface QubitSceneProps {
    track: Track
    phase: Phase
    onCoinClick: () => void
    onSphereClick: () => void
    quizCorrect?: boolean | null
    showParticles?: boolean
    mazeMode?: 'idle' | 'classical' | 'quantum'
}

// ─── INTERACTIVE LABEL ────────────────────────────────────────────────────────
function InteractiveLabel({ position, text, active }: { position: [number, number, number]; text: string; active: boolean }) {
    if (!active) return null
    return (
        <Html position={position} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{
                color: '#FFB7C5',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'rgba(255,183,197,0.1)',
                border: '1px solid rgba(255,183,197,0.3)',
                padding: '4px 12px',
                borderRadius: '20px',
                backdropFilter: 'blur(4px)',
                animation: 'pulse 2s infinite ease-in-out',
                whiteSpace: 'nowrap'
            }}>
                {text}
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 0.4; transform: scale(0.95); }
                        50% { opacity: 1; transform: scale(1.05); }
                    }
                `}</style>
            </div>
        </Html>
    )
}

// ─── FLOATING EQUATION (Amber track) ──────────────────────────────────────────
function FloatingEquation({ active, step }: { active: boolean; step: number }) {
    if (!active) return null
    
    const parts = [
        { lab: '|ψ⟩', desc: 'The State Vector', tip: 'Represents the current condition of our qubit.' },
        { lab: '=', desc: 'Equals', tip: '' },
        { lab: 'α', desc: 'Alpha (Amplitude)', tip: '|α|² is the probability of finding the qubit in state 0.' },
        { lab: '|0⟩', desc: 'Zero State', tip: 'The "Heads" equivalent in quantum.' },
        { lab: '+', desc: 'Superposition', tip: 'Connecting both possibilities into one state.' },
        { lab: 'β', desc: 'Beta (Amplitude)', tip: '|β|² is the probability of finding the qubit in state 1.' },
        { lab: '|1⟩', desc: 'One State', tip: 'The "Tails" equivalent in quantum.' },
    ]

    return (
        <Html position={[0, 2.8, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '2.5rem', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>
                    {parts.map((p, i) => (
                        <span key={i} style={{ 
                            color: i <= step ? '#C4955A' : 'rgba(255,255,255,0.15)',
                            textShadow: i <= step ? '0 0 20px rgba(196,149,90,0.6)' : 'none',
                            transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                            transform: i === step ? 'scale(1.2)' : 'scale(1)'
                        }}>
                            {p.lab}
                        </span>
                    ))}
                </div>
                {step >= 0 && parts[step] && parts[step].desc && (
                    <div style={{ 
                        background: 'rgba(14,15,26,0.9)',
                        padding: '8px 20px',
                        borderRadius: '10px',
                        border: '1px solid rgba(196,149,90,0.5)',
                        textAlign: 'center',
                        width: '420px',
                        backdropFilter: 'blur(16px)',
                        animation: 'fadeIn 0.5s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{ color: '#C4955A', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{parts[step].desc}:</div>
                        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: '1.4', textAlign: 'left' }}>{parts[step].tip}</div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Html>
    )
}

// ─── SCENE DIMMER ─────────────────────────────────────────────────────────────
function SceneDimmer({ active, opacity = 0.55 }: { active: boolean; opacity?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    useFrame((_s, delta) => {
        if (!meshRef.current) return
        const mat = meshRef.current.material as THREE.MeshBasicMaterial
        const target = active ? opacity : 0
        mat.opacity += (target - mat.opacity) * delta * 3
    })
    return (
        <mesh ref={meshRef} position={[0, 0, 1]} renderOrder={10}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#080912" transparent opacity={0} depthTest={false} />
        </mesh>
    )
}

// ─── COMPARE SPOTLIGHTS ───────────────────────────────────────────────────────
function CompareSpotlights({ active }: { active: boolean }) {
    const pt1 = useRef<THREE.PointLight>(null)
    const pt2 = useRef<THREE.PointLight>(null)
    
    useFrame((_s, delta) => {
        const targetPoint = active ? 4 : 0
        if (pt1.current) pt1.current.intensity += (targetPoint - pt1.current.intensity) * delta * 4
        if (pt2.current) pt2.current.intensity += (targetPoint - pt2.current.intensity) * delta * 4
    })

    return (
        <>
            <pointLight ref={pt1} position={[COIN_X, 2.5, 1]} distance={8} color="#ffffff" decay={2} intensity={0} />
            <pointLight ref={pt2} position={[QUBIT_X, 2.5, 1]} distance={8} color="#ffffff" decay={2} intensity={0} />
        </>
    )
}

// ─── MAZE VISUAL ──────────────────────────────────────────────────────────────
function MazeVisual({ mode, active }: { mode: 'idle' | 'classical' | 'quantum'; active: boolean }) {
    const { nodes, edges } = useMemo(() => {
        const _nodes: THREE.Vector3[] = []
        const _edges: { from: number; to: number; layer: number }[] = []
        _nodes.push(new THREE.Vector3(0, 1.8, 0))
        let lastLayer = [0]
        for (let d = 1; d <= 3; d++) {
            const currLayer = []
            const count = Math.pow(2, d)
            const spacing = 5.0 / count
            const startX = -2.5 + spacing / 2
            for (let i = 0; i < count; i++) {
                _nodes.push(new THREE.Vector3(startX + i * spacing, 1.8 - d * 1.3, 0))
                const newIdx = _nodes.length - 1
                currLayer.push(newIdx)
                _edges.push({ from: lastLayer[Math.floor(i / 2)], to: newIdx, layer: d })
            }
            lastLayer = currLayer
        }
        return { nodes: _nodes, edges: _edges }
    }, [])

    const dotsRef = useRef<THREE.InstancedMesh>(null)
    const classicalDotRef = useRef<THREE.Mesh>(null)
    const t = useRef(0)
    
    const [classPath] = useState(() => {
        const p = []
        p.push(0, 1, 3, 7, 3, 1, 0)
        p.push(0, 2, 5, 11, 5, 2, 0)
        p.push(0, 1, 4, 9, 4, 1, 0)
        p.push(0, 2, 6, 14, 14, 14, 14, 14, 14) // target hold
        return p
    })

    const dummy = useMemo(() => new THREE.Object3D(), [])

    useFrame((_s, delta) => {
        if (!active) return

        if (mode === 'classical') {
            t.current += delta * 3.5 
            const cycle = t.current % classPath.length
            const idx = Math.floor(cycle)
            const nextIdx = Math.min(idx + 1, classPath.length - 1)
            const frac = cycle - idx
            
            if (classicalDotRef.current) {
                classicalDotRef.current.position.lerpVectors(nodes[classPath[idx]], nodes[classPath[nextIdx]], frac)
                classicalDotRef.current.visible = true
            }
            if (dotsRef.current) dotsRef.current.visible = false
            
        } else if (mode === 'quantum') {
            t.current += delta * 0.5 
            const progress = t.current % 1.0
            
            if (dotsRef.current) {
                dotsRef.current.visible = true
                edges.forEach((e, i) => {
                    const startP = (e.layer - 1) * 0.333
                    const endP = e.layer * 0.333
                    if (progress >= startP && progress <= endP) {
                        const localFrac = (progress - startP) / 0.333
                        dummy.position.lerpVectors(nodes[e.from], nodes[e.to], localFrac)
                        dummy.scale.setScalar(1.0)
                    } else if (progress > endP) {
                        dummy.position.copy(nodes[e.to])
                        dummy.scale.setScalar(Math.max(0, 1.0 - (progress - endP) * 3))
                    } else {
                        dummy.scale.setScalar(0)
                    }
                    dummy.updateMatrix()
                    dotsRef.current!.setMatrixAt(i, dummy.matrix)
                    dotsRef.current!.setColorAt(i, new THREE.Color("#5DA7DB"))
                })
                dotsRef.current.instanceMatrix.needsUpdate = true
                dotsRef.current.instanceColor!.needsUpdate = true
            }
            if (classicalDotRef.current) classicalDotRef.current.visible = false
        } else {
            if (classicalDotRef.current) classicalDotRef.current.visible = false
            if (dotsRef.current) dotsRef.current.visible = false
        }
    })

    if (!active) return null

    return (
        <group position={[0, 1.2, 0]} scale={1.6}>
            <Html center position={[0, 2.5, 0]}>
                <div style={{ color: mode === 'classical' ? '#C4955A' : mode === 'quantum' ? '#5DA7DB' : 'rgba(10,10,20,0.8)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.6)', padding: '4px 12px', borderRadius: '12px', border: `1px solid ${mode === 'classical' ? '#C4955A' : mode === 'quantum' ? '#5DA7DB' : '#555'}`, transition: 'all 0.3s', backdropFilter: 'blur(4px)' }}>
                    {mode === 'classical' ? 'CLASSICAL TRIAL & ERROR' : mode === 'quantum' ? 'QUANTUM PARALLELISM' : 'MAZE ALGORITHM'}
                </div>
            </Html>

            {edges.map((e, idx) => (
                <Line
                    key={idx}
                    points={[nodes[e.from], nodes[e.to]]}
                    color={mode === 'quantum' ? "#5DA7DB" : mode === 'classical' ? "#C4955A" : "#111111"}
                    lineWidth={3.5}
                    transparent
                    opacity={mode === 'idle' ? 0.4 : 0.7}
                />
            ))}

            <mesh position={nodes[14]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#3ac878" emissive="#3ac878" emissiveIntensity={2} />
            </mesh>
            <mesh position={nodes[14]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#3ac878" emissive="#3ac878" emissiveIntensity={0.5} transparent opacity={0.4} wireframe />
            </mesh>

            <mesh ref={classicalDotRef} visible={false}>
                <sphereGeometry args={[0.14, 16, 16]} />
                <meshStandardMaterial color="#C4955A" emissive="#C4955A" emissiveIntensity={3} />
            </mesh>

            <instancedMesh ref={dotsRef} args={[undefined, undefined, edges.length]} visible={false}>
                <sphereGeometry args={[0.09, 16, 16]} />
                <meshStandardMaterial color="#5DA7DB" emissive="#5DA7DB" emissiveIntensity={3} />
            </instancedMesh>
        </group>
    )
}

// ─── COIN (classical bit) ─────────────────────────────────────────────────────
function CoinMesh({ onClick, phase }: { onClick: () => void; phase: Phase }) {
    const ref = useRef<THREE.Group>(null)
    const [face, setFace] = useState<0 | 1>(0)
    const [flipping, setFlipping] = useState(false)
    const [hovered, setHovered] = useState(false)
    const flipProgress = useRef(0)
    const startRot = useRef(0)

    const handleClick = () => {
        if (flipping) return
        setFlipping(true)
        flipProgress.current = 0
        startRot.current = ref.current?.rotation.x || 0
        onClick()
    }

    useFrame((_s, delta) => {
        if (!ref.current) return
        ref.current.position.y = Math.sin(_s.clock.getElapsedTime() * 0.9 + 1) * 0.08

        if (flipping) {
            flipProgress.current = Math.min(flipProgress.current + delta * 3.5, 1)
            const ease = 1 - Math.pow(1 - flipProgress.current, 3)
            ref.current.rotation.x = startRot.current + ease * Math.PI

            if (flipProgress.current >= 1) {
                setFlipping(false)
                setFace(f => f === 0 ? 1 : 0)
                ref.current.rotation.x = (startRot.current + Math.PI) % (Math.PI * 2)
            }
        }
    })

    const col0 = '#C4955A'
    const col1 = '#A0A0A0'
    const edgeCol = hovered ? '#ffd580' : '#444'

    return (
        <group position={[COIN_X, COIN_Y, 0]}>
            <InteractiveLabel position={[0, COIN_RADIUS + 0.5, 0]} text="Click to flip" active={phase === 'lesson' || phase === 'compare'} />
            <group ref={ref}>
                <mesh onClick={handleClick}
                    onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
                    onPointerLeave={() => { setHovered(false); document.body.style.cursor = '' }}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[COIN_RADIUS, COIN_RADIUS, COIN_HEIGHT, 48]} />
                    <meshStandardMaterial color={edgeCol} metalness={0.9} roughness={0.1} />
                </mesh>

                <mesh position={[0, 0, COIN_HEIGHT / 2 + 0.005]}>
                    <circleGeometry args={[COIN_RADIUS, 32]} />
                    <meshStandardMaterial color={col0} emissive={col0} emissiveIntensity={0.5} roughness={0.2} transparent opacity={0.95} />
                    <Text position={[0, 0, 0.03]} fontSize={COIN_RADIUS * 0.75} color="white" anchorX="center" anchorY="middle">0</Text>
                </mesh>

                <mesh position={[0, 0, -COIN_HEIGHT / 2 - 0.005]} rotation={[Math.PI, 0, 0]}>
                    <circleGeometry args={[COIN_RADIUS, 32]} />
                    <meshStandardMaterial color={col1} emissive={col1} emissiveIntensity={0.5} roughness={0.2} transparent opacity={0.95} />
                    <Text position={[0, 0, 0.03]} fontSize={COIN_RADIUS * 0.75} color="#222" anchorX="center" anchorY="middle">1</Text>
                </mesh>
            </group>
            
            {phase !== 'hook' && (
                <Html center position={[0, -COIN_RADIUS - 1.2, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>CLASSICAL BIT</div>
                        <div style={{ color: col0, fontSize: '14px', fontWeight: 800 }}>STATE: {face}</div>
                        <div style={{ marginTop: '10px', width: '120px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: face === 0 ? col0 : col1, transition: 'background 0.3s' }} />
                        </div>
                    </div>
                </Html>
            )}
        </group>
    )
}

// ─── QUBIT SPHERE ─────────────────────────────────────────────────────────────
function QubitSphere({ track, phase, onClick, isQuizTarget }: { track: Track; phase: Phase; onClick: () => void; isQuizTarget?: boolean }) {
    const ref = useRef<THREE.Mesh>(null)
    const ring1 = useRef<THREE.Mesh>(null)
    const ring2 = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)
    const [superposing, setSuperposing] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [collapsedVal, setCollapsedVal] = useState<0 | 1>(0)
    const superTime = useRef(0)

    const [flickerVal, setFlickerVal] = useState<0 | 1>(0)
    useEffect(() => {
        if (superposing || collapsed) return
        const id = setInterval(() => setFlickerVal(v => v === 0 ? 1 : 0), 160)
        return () => clearInterval(id)
    }, [superposing, collapsed])

    const handleClick = () => {
        if (superposing) return
        if (collapsed) {
            setCollapsed(false)
            setSuperposing(false)
            return
        }
        setSuperposing(true)
        superTime.current = 0
        setCollapsedVal(Math.random() > 0.5 ? 1 : 0)
        onClick()
    }

    useFrame((_s, delta) => {
        if (!ref.current) return
        const t = _s.clock.getElapsedTime()
        ref.current.position.y = Math.sin(t * 0.8) * 0.12
        ref.current.rotation.y += delta * (superposing ? 6 : 1.2)
        ref.current.rotation.x += delta * 0.4
        if (ring1.current) ring1.current.rotation.z += delta * 1.0
        if (ring2.current) ring2.current.rotation.x += delta * 1.4
        if (superposing) {
            superTime.current += delta
            const mat = ref.current.material as THREE.MeshStandardMaterial
            mat.emissiveIntensity = 2.5 + Math.sin(superTime.current * 20) * 1.5
            if (superTime.current > 1.5) {
                setSuperposing(false)
                setCollapsed(true)
                mat.emissiveIntensity = 1.4
            }
        }
    })

    const baseCol = hovered || superposing ? '#9be7ff' : collapsed ? '#FFB7C5' : '#5DA7DB'
    const ringSelCol = track === 'amber' ? '#C4955A' : '#5DA7DB'
    const displayVal = collapsed ? collapsedVal : (superposing ? '?' : flickerVal)
    const displayColor = collapsed ? '#FFB7C5' : superposing ? '#ffffff' : 'rgba(255,255,255,0.7)'

    return (
        <group position={[QUBIT_X, QUBIT_Y, 0]}>
            <InteractiveLabel position={[0, QUBIT_RADIUS + 0.5, 0]} text={collapsed ? "Click to reset" : "Click to collapse"} active={phase === 'lesson' || phase === 'compare'} />

            {isQuizTarget && (
                <mesh>
                    <sphereGeometry args={[QUBIT_RADIUS + 0.24, 24, 24]} />
                    <meshStandardMaterial color="#FFB7C5" emissive="#FFB7C5" emissiveIntensity={1.8} transparent opacity={0.18} wireframe />
                </mesh>
            )}
            <mesh
                ref={ref}
                onClick={handleClick}
                onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
                onPointerLeave={() => { setHovered(false); document.body.style.cursor = '' }}
            >
                <sphereGeometry args={[QUBIT_RADIUS, 32, 32]} />
                <meshStandardMaterial color={baseCol} emissive={baseCol} emissiveIntensity={superposing ? 2.5 : 1.4} metalness={0.3} roughness={0.05} transparent opacity={superposing ? 0.85 : 0.95} />
            </mesh>
            <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[ORBIT_RADIUS, 0.018, 8, 64]} />
                <meshStandardMaterial color={ringSelCol} emissive={ringSelCol} emissiveIntensity={0.9} transparent opacity={0.75} />
            </mesh>
            <mesh ref={ring2}>
                <torusGeometry args={[ORBIT_RADIUS, 0.018, 8, 64]} />
                <meshStandardMaterial color="#FFB7C5" emissive="#FFB7C5" emissiveIntensity={0.9} transparent opacity={0.6} />
            </mesh>

            {phase !== 'hook' && (
                <Html center position={[0, 0, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ color: displayColor, fontSize: superposing ? '2.5rem' : '2.2rem', fontWeight: 900, fontFamily: 'Space Mono, monospace', textShadow: `0 0 20px ${displayColor}`, textAlign: 'center' }}>
                        {displayVal}
                    </div>
                </Html>
            )}

            {phase !== 'hook' && (
                <Html center position={[0, -QUBIT_RADIUS - 1.2, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>QUANTUM QUBIT</div>
                        <div style={{ color: '#5DA7DB', fontSize: '14px', fontWeight: 800 }}>{collapsed ? `MEASURED: |${collapsedVal}⟩` : 'SUPERPOSITION'}</div>
                        <div style={{ marginTop: '10px', width: '120px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: collapsed ? (collapsedVal === 0 ? '100%' : '0%') : '50%', height: '100%', background: '#5DA7DB', transition: 'width 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }} />
                            <div style={{ width: collapsed ? (collapsedVal === 1 ? '100%' : '0%') : '50%', height: '100%', background: '#FFB7C5', transition: 'width 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }} />
                        </div>
                        {!collapsed && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Exploring both 0 & 1 at once!</div>}
                        {collapsed && phase === 'compare' && <div style={{ fontSize: '9px', color: '#FFB7C5', marginTop: '4px' }}>It collapsed! (More on this later)</div>}
                    </div>
                </Html>
            )}
        </group>
    )
}

// ─── BRAKKET LABELS (Amber track) ─────────────────────────────────────────────
function BraketLabels() {
    return (
        <>
            {[
                { pos: [QUBIT_X, QUBIT_Y + 0.52, 0.44] as [number, number, number], label: '|0⟩', col: '#5DA7DB' },
                { pos: [QUBIT_X, QUBIT_Y - 0.52, -0.44] as [number, number, number], label: '|1⟩', col: '#C4955A' },
            ].map(({ pos, label, col }) => (
                <Html key={label} position={pos} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ color: col, fontSize: '13px', fontWeight: 900, fontFamily: 'Space Mono, monospace', textShadow: `0 0 12px ${col}`, background: 'rgba(14,15,26,0.6)', backdropFilter: 'blur(6px)', padding: '2px 8px', borderRadius: '6px', border: `1px solid ${col}55` }}>
                        {label}
                    </div>
                </Html>
            ))}
        </>
    )
}

// ─── PARTICLE BURST ───────────────────────────────────────────────────────────
const generateLotusParticles = (count: number) => Array.from({ length: count }, () => {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI * 0.8
    return { 
        dir: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta), 
            Math.abs(Math.sin(phi) * Math.sin(theta)) + 0.3, 
            Math.cos(phi)
        ).multiplyScalar(2.5 + Math.random() * 2), 
        size: 0.04 + Math.random() * 0.06, 
        phase: Math.random() * Math.PI * 2 
    }
})

function LotusParticleBurst({ active, color }: { active: boolean; color: string }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const progress = useRef(0)
    const running = useRef(false)
    const COUNT = 32
    const particles = useMemo(() => generateLotusParticles(COUNT), [])
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const threeColor = useMemo(() => new THREE.Color(color), [color])
    useEffect(() => { if (active) { running.current = true; progress.current = 0 } }, [active])
    useFrame((_s, delta) => {
        if (!meshRef.current || !running.current) return
        progress.current = Math.min(progress.current + delta * 1.1, 1)
        const ease = 1 - Math.pow(1 - progress.current, 3)
        particles.forEach((p, i) => {
            const pos = p.dir.clone().multiplyScalar(ease)
            const scale = p.size * (1 - ease * 0.9) * (1 + Math.sin(progress.current * Math.PI) * 0.3)
            dummy.position.copy(pos); dummy.scale.setScalar(Math.max(scale, 0)); dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
            meshRef.current!.setColorAt(i, new THREE.Color().lerpColors(new THREE.Color('#FFB7C5'), threeColor, ease))
        })
        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
        if (progress.current >= 1) running.current = false
    })
    if (!active && !running.current) return null
    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial emissive={threeColor} emissiveIntensity={2.5} transparent opacity={0.9} />
        </instancedMesh>
    )
}

// ─── BLUE SHIMMER (wrong answer) ─────────────────────────────────────────────
function BlueShimmer({ active }: { active: boolean }) {
    const ref = useRef<THREE.Mesh>(null)
    const progress = useRef(0)
    const running = useRef(false)
    useEffect(() => { if (active) { running.current = true; progress.current = 0 } }, [active])
    useFrame((_s, delta) => {
        if (!ref.current || !running.current) return
        progress.current = Math.min(progress.current + delta * 2, 1)
        const mat = ref.current.material as THREE.MeshBasicMaterial
        mat.opacity = Math.sin(progress.current * Math.PI) * 0.35
        if (progress.current >= 1) { running.current = false; mat.opacity = 0 }
    })
    return (
        <mesh ref={ref} position={[0, 0, 1.5]} renderOrder={11}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#5DA7DB" transparent opacity={0} depthTest={false} />
        </mesh>
    )
}

// ─── CAMERA CONTROLLER ────────────────────────────────────────────────────────
function CameraController({ phase, mazeMode }: { phase: Phase, mazeMode?: string }) {
    const { camera } = useThree()
    const targetZ = useRef(11)
    useEffect(() => {
        // Zoom out slightly to see the maze during compare phase
        targetZ.current = phase === 'quiz' ? 9 : phase === 'compare' ? 12.5 : phase === 'complete' ? 10 : 13
    }, [phase, mazeMode])
    useFrame((_s, delta) => { camera.position.z += (targetZ.current - camera.position.z) * delta * 1.5 })
    return null
}

// ─── MODULE 1 SCENE (main export) ─────────────────────────────────────────────
export default function QubitScene({ track, phase, onCoinClick, onSphereClick, quizCorrect = null, showParticles = false, equationStep = -1, mazeMode = 'idle' }: QubitSceneProps & { equationStep?: number }) {
    const isQuiz = phase === 'quiz'
    const showBraket = track === 'amber' && phase === 'lesson'
    const showEquation = track === 'amber' && phase === 'lesson'

    return (
        <>
            <CameraController phase={phase} mazeMode={mazeMode} />
            <ambientLight intensity={isQuiz ? 0.5 : 0.8} />
            <directionalLight position={[5, 10, 5]} intensity={isQuiz ? 1.0 : 2.5} />
            <pointLight position={[-8, 4, -4]} intensity={2.5} color="#5DA7DB" />
            <pointLight position={[8, 4, 4]} intensity={2.0} color="#C4955A" />
            
            <SceneDimmer active={isQuiz} opacity={0.65} />
            <CompareSpotlights active={phase === 'compare'} />
            
            <CoinMesh onClick={onCoinClick} phase={phase} />
            <QubitSphere track={track} phase={phase} onClick={onSphereClick} isQuizTarget={isQuiz} />
            <MazeVisual mode={mazeMode} active={phase === 'compare'} />
            
            {showBraket && <BraketLabels />}
            <FloatingEquation active={showEquation} step={equationStep} />

            <LotusParticleBurst active={showParticles && quizCorrect === true} color="#FFB7C5" />
            <BlueShimmer active={showParticles && quizCorrect === false} />
        </>
    )
}

