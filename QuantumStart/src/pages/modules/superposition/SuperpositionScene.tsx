/**
 * SuperpositionScene.tsx — R3F scene for "Superposition"
 */

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export type Phase = 'hook' | 'lesson' | 'sandbox' | 'quiz' | 'complete'
export type Track = 'blue' | 'amber' | null

// ─── PARTICLE BURST ───────────────────────────────────────────────────────────
function LotusParticleBurst({ active, color }: { active: boolean; color: string }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const progress = useRef(0)
    const running = useRef(false)
    const COUNT = 32
    const particles = useMemo(() => Array.from({ length: COUNT }, () => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI * 0.8
        return { 
            dir: new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.abs(Math.sin(phi) * Math.sin(theta)) + 0.3, Math.cos(phi)).multiplyScalar(2.5 + Math.random() * 2), 
            size: 0.04 + Math.random() * 0.06, 
            phase: Math.random() * Math.PI * 2 
        }
    }), [])
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

interface SuperpositionSceneProps {
    track: Track
    phase: Phase
    onGateTrigger: () => void
    gateActive: boolean
    hasTransformed: boolean // Past Gate 1
    onTransform: () => void // Trigger Gate 1 pass
    hasPassedSecondGate: boolean // Past Gate 2
    onSecondGatePass: () => void // Trigger Gate 2 pass
    quizCorrect?: boolean | null
    showParticles?: boolean
}

function SceneDimmer({ active }: { active: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    useFrame((_s, delta) => {
        if (!meshRef.current) return
        const mat = meshRef.current.material as THREE.MeshBasicMaterial
        const target = active ? 0.55 : 0
        mat.opacity += (target - mat.opacity) * delta * 3
    })
    return (
        <mesh ref={meshRef} position={[0, 0, 1]} renderOrder={10}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#080912" transparent opacity={0} depthTest={false} />
        </mesh>
    )
}

function HGate({ position, active }: { position: [number, number, number], active: boolean }) {
    const portal = useRef<THREE.Mesh>(null)
    const floatGroup = useRef<THREE.Group>(null)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (floatGroup.current) {
            floatGroup.current.position.y = Math.sin(t * 2) * 0.1
        }
        if (portal.current) {
            portal.current.scale.y = 1 + Math.sin(t * 3) * 0.05
            const mat = portal.current.material as THREE.MeshStandardMaterial
            mat.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3
            mat.opacity = active ? 0.4 + Math.sin(t * 5) * 0.15 : 0.05
        }
    })

    return (
        <group position={position}>
            <group ref={floatGroup}>
                {/* Left Pillar */}
                <mesh position={[-0.9, 0, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 3.2, 16]} />
                    <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Right Pillar */}
                <mesh position={[0.9, 0, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 3.2, 16]} />
                    <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
                </mesh>
                
                {/* Top Arch Piece */}
                <mesh position={[0, 1.6, 0]}>
                    <boxGeometry args={[2.0, 0.2, 0.3]} />
                    <meshStandardMaterial color="#111" metalness={0.8} />
                </mesh>
                <mesh position={[0, 1.6, 0.16]}>
                    <boxGeometry args={[1.8, 0.05, 0.05]} />
                    <meshStandardMaterial color="#FFB7C5" emissive="#FFB7C5" emissiveIntensity={1} />
                </mesh>
                <mesh position={[0, 1.6, -0.16]}>
                    <boxGeometry args={[1.8, 0.05, 0.05]} />
                    <meshStandardMaterial color="#FFB7C5" emissive="#FFB7C5" emissiveIntensity={1} />
                </mesh>

                {/* Bottom Arch Piece */}
                <mesh position={[0, -1.6, 0]}>
                    <boxGeometry args={[2.0, 0.2, 0.3]} />
                    <meshStandardMaterial color="#111" metalness={0.8} />
                </mesh>
                
                {/* Inner Energy Portal */}
                <mesh ref={portal}>
                    <planeGeometry args={[1.65, 3.1]} />
                    <meshStandardMaterial 
                        color="#5DA7DB" 
                        emissive="#5DA7DB" 
                        transparent 
                        opacity={0.15} 
                        emissiveIntensity={0.5} 
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* H label projected dynamically */}
                <Html position={[0, 2.3, 0]} center zIndexRange={[100, 0]}>
                    <div style={{
                        color: '#FFF',
                        fontSize: '44px',
                        fontWeight: 900,
                        fontFamily: 'Space Mono, monospace',
                        textShadow: '0 0 20px #FFB7C5, 0 0 40px #FFB7C5'
                    }}>H</div>
                </Html>
            </group>
        </group>
    )
}

// ─── PROBABILITY WAVE (RHYTHMIC / OSCILLATING) ───────────────────────────────
function ProbabilityWave({ color }: { color: string }) {
    const inner = useRef<THREE.Mesh>(null)
    const mid = useRef<THREE.Mesh>(null)
    const outer = useRef<THREE.Mesh>(null)
    
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        
        // Rhythmic, precise mathematical oscillation
        if (inner.current) {
            inner.current.scale.setScalar(0.7 + Math.sin(t * 4) * 0.1)
            ;(inner.current.material as THREE.MeshStandardMaterial).opacity = 0.5 + Math.sin(t * 4) * 0.3
        }
        if (mid.current) {
            mid.current.scale.setScalar(1.1 + Math.sin(t * 4 - 1.5) * 0.15)
            ;(mid.current.material as THREE.MeshStandardMaterial).opacity = 0.3 + Math.sin(t * 4 - 1.5) * 0.2
        }
        if (outer.current) {
            outer.current.scale.setScalar(1.5 + Math.sin(t * 4 - 3.0) * 0.2)
            ;(outer.current.material as THREE.MeshStandardMaterial).opacity = 0.15 + Math.sin(t * 4 - 3.0) * 0.1
        }
    })

    return (
        <group>
            {/* Core dot mimicking the underlying classical mass */}
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>
            <mesh ref={inner}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} transparent depthTest={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={mid}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} transparent depthTest={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={outer}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} transparent depthTest={false} blending={THREE.AdditiveBlending} wireframe />
            </mesh>
        </group>
    )
}

// ─── DRAGGABLE QUBIT ──────────────────────────────────────────────────────────
function DraggableQubit({ hasTransformed, onTransform, hasPassedSecondGate, onSecondGatePass, track, phase }: { 
    hasTransformed: boolean, onTransform: () => void, hasPassedSecondGate: boolean, onSecondGatePass: () => void, track: Track, phase: Phase 
}) {
    const group = useRef<THREE.Group>(null)
    const [dragging, setDragging] = useState(false)
    const { viewport } = useThree()

    // Key horizontal positions
    const START_X = 3
    const GATE_X = 0
    const MID_REST_X = -3
    const END_REST_X = 3

    useFrame((state) => {
        if (!group.current) return
        const t = state.clock.getElapsedTime()

        // Idle floating 
        if (!dragging) {
            group.current.position.y += (Math.sin(t * 1.5) * 0.2 - group.current.position.y) * 0.05
        }

        const currX = group.current.position.x

        if (!hasTransformed) {
            // Drag leftwards: passing Center
            if (currX <= GATE_X) {
                onTransform()
            }
            if (!dragging && currX > GATE_X) {
                group.current.position.x += (START_X - currX) * 0.05
            }
            // Cannot drag right of start
            if (currX > START_X + 1) group.current.position.x = START_X + 1
        } else if (!hasPassedSecondGate) {
            // Wait on the left
            if (!dragging) {
                group.current.position.x += (MID_REST_X - currX) * 0.05
            }

            // Drag rightwards: passing Center
            if (phase === 'sandbox' && currX >= GATE_X) {
                onSecondGatePass()
            }
            
            // Restrict dragging past the gate BEFORE sandbox
            if (phase !== 'sandbox' && currX > GATE_X) {
                group.current.position.x = GATE_X
            }
        } else {
            // After second pass, relax back to END_REST_X (right side)
            if (!dragging) {
                group.current.position.x += (END_REST_X - currX) * 0.05
            }
            // Restrict dragging back left through the gate
            if (currX < GATE_X) {
                 group.current.position.x = GATE_X
            }
        }
    })

    const handlePointerDown = (e: any) => {
        if (hasTransformed && phase !== 'sandbox' && !hasPassedSecondGate) return // Locked before sandbox
        e.stopPropagation()
        setDragging(true)
        document.body.style.cursor = 'grabbing'
    }

    const handlePointerUp = () => {
        setDragging(false)
        document.body.style.cursor = 'auto'
    }

    const handlePointerMove = (e: any) => {
        if (!dragging) return
        // Map pointer to world space
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = -(e.clientY / window.innerHeight) * 2 + 1
        
        const newX = (x * viewport.width) / 2
        const newY = (y * viewport.height) / 2
        
        group.current?.position.set(newX, newY, 0)
    }

    const col = track === 'amber' ? '#C4955A' : '#5DA7DB'

    const isWave = hasTransformed && !hasPassedSecondGate

    return (
        <group 
            ref={group} 
            position={[START_X, 0, 0]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerOut={handlePointerUp}
        >
            {/* Invisible large sphere to ensure continuous raycasting while dragging */}
            <mesh visible={false}>
                <sphereGeometry args={[1.6, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>
            {!isWave ? (
                <>
                    {/* |0⟩ Solid Qubit */}
                    <mesh 
                        onPointerEnter={() => !hasPassedSecondGate && (document.body.style.cursor = 'grab')} 
                        onPointerLeave={() => (document.body.style.cursor = 'auto')}
                    >
                        <sphereGeometry args={[0.7, 32, 32]} />
                        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.2} roughness={0.1} metalness={0.8} />
                    </mesh>
                    {/* Label */}
                    {!hasPassedSecondGate ? (
                         <Html center position={[0, -1.2, 0]}>
                            <div style={{ color: '#fff', fontSize: '10px', whiteSpace: 'nowrap', opacity: 0.6, fontWeight: 700, letterSpacing: '2px' }}>
                                {!hasTransformed ? '← DRAG LEFT' : (phase === 'sandbox' ? 'DRAG RIGHT →' : '')}
                            </div>
                        </Html>
                    ) : (
                        <Html center position={[0, -1.2, 0]}>
                            <div style={{ color: '#3ac878', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Reconstructed: |0⟩</div>
                        </Html>
                    )}
                </>
            ) : (
        <group onPointerEnter={() => !hasPassedSecondGate && (document.body.style.cursor = 'grab')} onPointerLeave={() => (document.body.style.cursor = 'auto')}>
                    <ProbabilityWave color={col} />
                </group>
            )}
        </group>
    )
}

// ─── AMBER TRACK MATH VISUALIZER ───────────────────────────────────────────────
function MathOverlay({ active, hasTransformed, hasPassedSecondGate }: { active: boolean, hasTransformed: boolean, hasPassedSecondGate: boolean }) {
    if (!active) return null

    let title = "INITIAL CLASSICAL STATE"
    let eq = "   |ψ⟩ = |0⟩   "
    
    if (hasPassedSecondGate) {
        title = "QUANTUM INTERFERENCE"
        eq = " H |+⟩ = |0⟩ "
    } else if (hasTransformed) {
        title = "HADAMARD TRANSFORMATION"
        eq = "H |0⟩ = 1/√2 (|0⟩ + |1⟩) = |+⟩"
    }

    return (
        <Html position={[0, 3.2, 0]} center zIndexRange={[100, 0]}>
            <div style={{
                background: 'rgba(14, 15, 26, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(196, 149, 90, 0.4)',
                borderRadius: '12px',
                padding: '16px 24px',
                color: '#e0b87a',
                fontFamily: 'Space Mono, monospace',
                fontSize: '15px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                fontWeight: 700
            }}>
                <div style={{ marginBottom: '8px', opacity: 0.6, fontSize: '11px', letterSpacing: '1px' }}>{title}</div>
                {eq}
            </div>
        </Html>
    )
}

function CameraController({ phase, hasPassedSecondGate }: { phase: Phase, hasPassedSecondGate: boolean }) {
    const { camera } = useThree()
    const targetZ = useRef(10)
    const targetX = useRef(0)
    
    useEffect(() => {
        targetZ.current = phase === 'quiz' ? 8 : (phase === 'sandbox' ? 9.5 : 8.5)
        targetX.current = 0 
    }, [phase, hasPassedSecondGate])
    
    useFrame((_s, delta) => { 
        camera.position.z += (targetZ.current - camera.position.z) * delta * 2 
        camera.position.x += (targetX.current - camera.position.x) * delta * 2
    })
    return null
}

export default function SuperpositionScene({ 
    track, phase, hasTransformed, onTransform, hasPassedSecondGate, onSecondGatePass, quizCorrect = null, showParticles = false
}: SuperpositionSceneProps) {
    const isQuiz = phase === 'quiz'
    return (
        <>
            <CameraController phase={phase} hasPassedSecondGate={hasPassedSecondGate} />
            <ambientLight intensity={isQuiz ? 0.5 : 1.1} />
            <directionalLight position={[5, 5, 5]} intensity={isQuiz ? 1.0 : 2.0} />
            <pointLight position={[-4, 2, -4]} intensity={1.2} color="#5DA7DB" />
            <pointLight position={[4, 2, 4]} intensity={1.0} color="#C4955A" />
            
            <SceneDimmer active={isQuiz} />
            
            {/* Main Interactive Gate */}
            {!isQuiz && <HGate position={[0, 0, 0]} active={hasTransformed && phase === 'sandbox'} />}

            <DraggableQubit 
                track={track} 
                phase={phase}
                hasTransformed={hasTransformed} 
                onTransform={onTransform} 
                hasPassedSecondGate={hasPassedSecondGate} 
                onSecondGatePass={onSecondGatePass} 
            />
            
            <MathOverlay 
                active={track === 'amber' && !isQuiz}
                hasTransformed={hasTransformed} 
                hasPassedSecondGate={hasPassedSecondGate}
            />
            
            <LotusParticleBurst active={showParticles && quizCorrect === true} color="#FFB7C5" />
            <BlueShimmer active={showParticles && quizCorrect === false} />
        </>
    )
}
