import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { AlgoPhase } from './algoTypes'
import { Html, Text } from '@react-three/drei'

interface AlgorithmsSceneProps {
    phase: AlgoPhase
    winningBox: number
    guessedBox: number | null
    onGuessBox: (index: number) => void
    qState?: number[]
    showAverage?: boolean
}

function ClassicalBox({ position, isWinning, isGuessed, isSearchlight, onGuess }: { position: [number, number, number], isWinning: boolean, isGuessed: boolean, isSearchlight?: boolean, onGuess?: () => void }) {
    const lidRef = useRef<THREE.Mesh>(null)
    const treatRef = useRef<THREE.Group>(null)
    
    useFrame((_state, delta) => {
        if (!lidRef.current) return
        const targetRotX = isGuessed ? -Math.PI * 0.7 : 0
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotX, delta * 5)

        if (treatRef.current && isGuessed && isWinning) {
            treatRef.current.rotation.y += delta * 2
            treatRef.current.position.y = 0.6 + Math.sin(_state.clock.elapsedTime * 4) * 0.1
        }
    })

    // Brighter material for better visibility
    const baseColor = isGuessed ? (isWinning ? '#4ade80' : '#64748b') : (isSearchlight ? '#818cf8' : '#475569')
    const emissiveColor = isGuessed ? (isWinning ? '#4ade80' : '#475569') : (isSearchlight ? '#ffffff' : '#000000')

    return (
        <group position={position}>
            {/* LARGE HITBOX FOR INTERACTIVITY */}
            <mesh 
                visible={false} 
                onClick={(e) => { e.stopPropagation(); onGuess?.(); }}
                onPointerOver={() => { if (onGuess) document.body.style.cursor = 'pointer' }}
                onPointerOut={() => { document.body.style.cursor = 'auto' }}
            >
                <boxGeometry args={[1.5, 1.5, 1.5]} />
            </mesh>

            {isSearchlight && (
                <pointLight position={[0, 2, 0]} intensity={4} color="#818cf8" distance={5} />
            )}
            
            {/* Box Body */}
            <mesh position={[0, -0.25, 0]}>
                <boxGeometry args={[1.2, 0.5, 1.2]} />
                <meshStandardMaterial 
                    color={baseColor} 
                    roughness={0.2} 
                    metalness={0.8} 
                    emissive={emissiveColor} 
                    emissiveIntensity={isGuessed || isSearchlight ? 0.8 : 0.2} 
                />
            </mesh>
            
            {/* Gold highlight/rim for detail */}
            <mesh position={[0, -0.25, 0]} scale={[1.02, 1.02, 1.02]}>
                <boxGeometry args={[1.2, 0.5, 1.2]} />
                <meshStandardMaterial color="#fbbf24" transparent opacity={0.2} wireframe />
            </mesh>

            <group position={[0, 0, -0.6]}>
                <mesh ref={lidRef} position={[0, 0, 0.6]}>
                    <boxGeometry args={[1.2, 0.1, 1.2]} />
                    <meshStandardMaterial color={baseColor} roughness={0.1} metalness={0.9} />
                </mesh>
            </group>
            
            {isGuessed && isWinning && (
                <group ref={treatRef} position={[0, 0, 0]}>
                    <mesh>
                        <octahedronGeometry args={[0.4, 0]} />
                        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
                    </mesh>
                    <pointLight intensity={5} color="#fbbf24" distance={5} />
                    {/* Victory Pulse Light */}
                    <pointLight intensity={10} color="#ffffff" distance={2} />
                </group>
            )}
        </group>
    )
}

function AmplitudeBar({ index, amplitude, label }: { index: number, amplitude: number, label: string }) {
    const barRef = useRef<THREE.Mesh>(null)
    const groupRef = useRef<THREE.Group>(null)
    const targetHeight = Math.max(Math.abs(amplitude) * 4, 0.05)
    const targetY = amplitude >= 0 ? targetHeight / 2 : -targetHeight / 2
    
    useFrame((_state, delta) => {
        if (!barRef.current || !groupRef.current) return
        barRef.current.scale.y = THREE.MathUtils.lerp(barRef.current.scale.y, targetHeight, delta * 6)
        barRef.current.position.y = THREE.MathUtils.lerp(barRef.current.position.y, targetY, delta * 6)
        
        // Subtle wave bobbing
        const wave = Math.sin(_state.clock.elapsedTime * 2 + index * 0.8) * 0.05
        groupRef.current.position.y = wave

        // Color transition
        const mat = barRef.current.material as THREE.MeshStandardMaterial
        const targetColor = new THREE.Color(amplitude < 0 ? '#f43f5e' : '#10b981')
        mat.color.lerp(targetColor, delta * 6)
        mat.emissive.lerp(targetColor, delta * 6)
    })

    return (
        <group position={[(index - 1.5) * 1.8, 0, 0]} ref={groupRef}>
            <mesh ref={barRef} position={[0, targetY, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} transparent opacity={0.85} />
            </mesh>
            
            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[1.2, 0.1, 1.2]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
            
            <Text position={[0, -0.6, 0]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">
                {label}
            </Text>
            <Html position={[0, -1.3, 0]} center>
                <div style={{ 
                    background: 'rgba(0,0,0,0.7)', 
                    backdropFilter: 'blur(16px)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    pointerEvents: 'none'
                }}>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: '800' }}>
                        Amt: {amplitude.toFixed(2)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: '500' }}>
                        Prob: {(amplitude * amplitude * 100).toFixed(0)}%
                    </div>
                </div>
            </Html>
        </group>
    )
}

function ThinkingVisualizer() {
    const meshRef = useRef<THREE.Mesh>(null)
    const lightRef = useRef<THREE.PointLight>(null)

    useFrame((_state) => {
        if (!meshRef.current || !lightRef.current) return
        const t = _state.clock.elapsedTime
        // Flashlight behavior: move sequentially
        const searchIndex = Math.floor((t % 4) * 1) 
        const targetX = (searchIndex - 1.5) * 1.6
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.2)
        lightRef.current.position.x = meshRef.current.position.x
    })

    return (
        <group position={[0, 1.5, 0]}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <pointLight ref={lightRef} intensity={5} color="#ffffff" distance={8} />
            {/* Separate Label: Lower than Quantum */}
            <Text position={[0, 1.8, 0]} fontSize={0.35} color="white" fontWeight="900">Classical Searchlight</Text>
        </group>
    )
}

function QuantumField() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((_state) => {
        if (!meshRef.current) return
        const t = _state.clock.elapsedTime
        const s = 1 + Math.sin(t * 2) * 0.05
        meshRef.current.scale.set(s, s, 1)
        if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
            meshRef.current.material.opacity = 0.15 + Math.sin(t * 3) * 0.05
        }
    })

    return (
        <group position={[0, 0, -2]}>
            <mesh ref={meshRef}>
                <planeGeometry args={[16, 10]} />
                <meshStandardMaterial 
                    color="#4ade80" 
                    transparent 
                    opacity={0.2} 
                    emissive="#4ade80" 
                    emissiveIntensity={1.2}
                    metalness={1}
                    roughness={0}
                />
            </mesh>
            {/* Massive Floodlight for Quantum mode */}
            <pointLight position={[0, 5, 5]} intensity={8} color="#4ade80" distance={20} />
            
            {/* Separate Label: Higher than Classical */}
            <Text position={[0, 4.5, 0]} fontSize={0.45} color="#4ade80" fontWeight="bold">Quantum Search Field</Text>
        </group>
    )
}

export function AlgorithmsScene({ phase, winningBox, guessedBox, onGuessBox, qState = [1,0,0,0], showAverage }: AlgorithmsSceneProps) {
    const avg = qState.reduce((sum, val) => sum + val, 0) / 4
    const avgY = avg * 4

    return (
        <group>
            {/* STAGE LIGHTING */}
            {phase === 'phase0_intro' && (
                <group>
                    <QuantumField />
                    <ThinkingVisualizer />
                    <group position={[0, -1, 0]}>
                        {[0, 1, 2, 3].map(i => (
                            <ClassicalBox 
                                key={i}
                                position={[(i - 1.5) * 1.6, 0, 0]}
                                isWinning={winningBox === i}
                                isGuessed={false}
                            />
                        ))}
                    </group>
                </group>
            )}

            {phase === 'phase1_classical' && (
                <group position={[0, -1, 0]}>
                    <ThinkingVisualizer />
                    {[0, 1, 2, 3].map(i => {
                        const isHoverable = guessedBox === null;
                        return (
                            <group key={i}>
                                <ClassicalBox 
                                    position={[(i - 1.5) * 1.6, 0, 0]}
                                    isWinning={winningBox === i}
                                    isGuessed={guessedBox === i}
                                    isSearchlight={guessedBox === i}
                                    onGuess={() => { if (isHoverable) onGuessBox(i) }}
                                />
                                <Html position={[(i - 1.5) * 1.6, -1.2, 0]} center>
                                    <div style={{ 
                                        background: 'rgba(0,0,0,0.5)', 
                                        backdropFilter: 'blur(8px)',
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        color: '#fff', 
                                        fontFamily: 'DM Sans, sans-serif', 
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                        pointerEvents: 'none'
                                    }}>Box {i}</div>
                                </Html>
                            </group>
                        )
                    })}
                </group>
            )}

            {(phase === 'phase2_superposition' || phase === 'phase3_oracle' || phase === 'phase4_amplification' || phase === 'phase5_builder' || phase === 'phase6_quiz') && (
                <group position={[0, 0, 0]}>
                    <AmplitudeBar index={0} amplitude={qState[0]} label="|00>" />
                    <AmplitudeBar index={1} amplitude={qState[1]} label="|01>" />
                    <AmplitudeBar index={2} amplitude={qState[2]} label="|10>" />
                    <AmplitudeBar index={3} amplitude={qState[3]} label="|11>" />
                    
                    {/* Overall Field Glow during Quantum Phases */}
                    <QuantumField />

                    <group position={[0, avgY, 0]} visible={showAverage}>
                        <mesh position={[0, 0, 0.6]}>
                            <planeGeometry args={[7, 0.05]} />
                            <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
                        </mesh>
                        <Html position={[3.8, 0, 0.6]} center>
                            <div style={{ 
                                background: 'rgba(255,215,0,0.25)',
                                backdropFilter: 'blur(8px)',
                                padding: '6px 16px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,215,0,0.5)',
                                color: '#FFD700', 
                                fontWeight: '900', 
                                fontSize: '0.85rem',
                                textShadow: '0 0 4px rgba(0,0,0,0.5)', 
                                whiteSpace: 'nowrap',
                                fontFamily: 'DM Sans, sans-serif',
                                pointerEvents: 'none'
                            }}>
                                Sea Level ({avg.toFixed(2)})
                            </div>
                        </Html>
                    </group>
                </group>
            )}
        </group>
    )
}
