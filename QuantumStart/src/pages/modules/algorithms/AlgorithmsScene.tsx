import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { AlgoPhase } from './AlgorithmsModule'
import { Html, Text } from '@react-three/drei'

interface AlgorithmsSceneProps {
    phase: AlgoPhase
    winningBox: number
    guessedBox: number | null
    onGuessBox: (index: number) => void
    qState?: number[]
    showAverage?: boolean
}

function ClassicalBox({ position, isWinning, isGuessed }: any) {
    const groupRef = useRef<THREE.Group>(null)
    const lidRef = useRef<THREE.Mesh>(null)
    const treatRef = useRef<THREE.Group>(null)
    
    useFrame((_state, delta) => {
        if (!lidRef.current) return
        const targetRotX = isGuessed ? -Math.PI * 0.6 : 0
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotX, delta * 5)

        if (treatRef.current && isGuessed && isWinning) {
            treatRef.current.rotation.y += delta * 2
            treatRef.current.position.y = 0.5 + Math.sin(_state.clock.elapsedTime * 4) * 0.1
        }
    })

    const bodyColor = isGuessed ? (isWinning ? '#5DA7DB' : '#C4955A') : '#2a2a3e'
    const emissiveBody = isGuessed ? (isWinning ? '#5DA7DB' : '#C4955A') : '#000000'

    return (
        <group position={position} ref={groupRef}>
            <mesh position={[0, -0.25, 0]}>
                <boxGeometry args={[1.2, 0.5, 1.2]} />
                <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.4} emissive={emissiveBody} emissiveIntensity={isGuessed ? 0.3 : 0} />
            </mesh>
            <group position={[0, 0, -0.6]}>
                <mesh ref={lidRef} position={[0, 0, 0.6]}>
                    <boxGeometry args={[1.2, 0.1, 1.2]} />
                    <meshStandardMaterial color={bodyColor} roughness={0.5} metalness={0.5} />
                </mesh>
            </group>
            
            {isGuessed && isWinning && (
                <group ref={treatRef} position={[0, 0, 0]}>
                    <mesh>
                        <octahedronGeometry args={[0.35, 0]} />
                        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
                    </mesh>
                </group>
            )}
        </group>
    )
}

function AmplitudeBar({ index, amplitude, label }: any) {
    const barRef = useRef<THREE.Mesh>(null)
    const targetHeight = Math.max(Math.abs(amplitude) * 4, 0.05)
    const targetY = amplitude >= 0 ? targetHeight / 2 : -targetHeight / 2
    
    useFrame((_, delta) => {
        if (!barRef.current) return
        barRef.current.scale.y = THREE.MathUtils.lerp(barRef.current.scale.y, targetHeight, delta * 6)
        barRef.current.position.y = THREE.MathUtils.lerp(barRef.current.position.y, targetY, delta * 6)
        
        // Color transition logic manually
        const mat = barRef.current.material as THREE.MeshStandardMaterial
        const targetColor = new THREE.Color(amplitude < 0 ? '#FFB7C5' : '#7effdd')
        mat.color.lerp(targetColor, delta * 6)
        mat.emissive.lerp(targetColor, delta * 6)
    })

    return (
        <group position={[(index - 1.5) * 1.8, 0, 0]}>
            {/* The animated dynamic bar */}
            <mesh ref={barRef} position={[0, targetHeight/2, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#7effdd" emissive="#7effdd" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} transparent opacity={0.85} />
            </mesh>
            
            {/* Base platform */}
            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[1.2, 0.1, 1.2]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
            
            <Text position={[0, -0.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
                {label}
            </Text>
            <Html position={[0, -1.2, 0]} center>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    Amt: {amplitude.toFixed(2)}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', whiteSpace: 'nowrap', fontSize: '0.8rem', marginTop: '4px' }}>
                    Prob: {(amplitude * amplitude * 100).toFixed(0)}%
                </div>
            </Html>
        </group>
    )
}

export function AlgorithmsScene({ phase, winningBox, guessedBox, onGuessBox, qState = [1,0,0,0], showAverage }: AlgorithmsSceneProps) {
    const groupRef = useRef<THREE.Group>(null)

    // Calculate actual average for visualization
    const avg = qState.reduce((sum, val) => sum + val, 0) / 4
    const avgY = avg * 4

    return (
        <group ref={groupRef}>
            {phase === 'phase1_classical' && (
                <group position={[0, -1, 0]}>
                    {[0, 1, 2, 3].map(i => {
                        const isHoverable = guessedBox === null;
                        return (
                            <group 
                                key={i} 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (isHoverable) onGuessBox(i) 
                                }}
                                onPointerOver={() => {
                                    if (isHoverable) document.body.style.cursor = 'pointer'
                                }}
                                onPointerOut={() => {
                                    document.body.style.cursor = 'auto'
                                }}
                            >
                                <ClassicalBox 
                                    position={[(i - 1.5) * 1.6, 0, 0]}
                                    isWinning={winningBox === i}
                                    isGuessed={guessedBox === i}
                                />
                                <Html position={[(i - 1.5) * 1.6, -1.2, 0]} center>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Space Mono, monospace', fontSize: '0.9rem' }}>Box {i}</div>
                                </Html>
                            </group>
                        )
                    })}
                </group>
            )}

            {(phase === 'phase2_superposition' || phase === 'phase3_oracle' || phase === 'phase4_amplification') && (
                <group position={[0, 0, 0]}>
                    <AmplitudeBar index={0} amplitude={qState[0]} label="|00>" />
                    <AmplitudeBar index={1} amplitude={qState[1]} label="|01>" />
                    <AmplitudeBar index={2} amplitude={qState[2]} label="|10>" />
                    <AmplitudeBar index={3} amplitude={qState[3]} label="|11>" />
                    
                    {/* The Average Line */}
                    <group position={[0, avgY, 0]} visible={showAverage}>
                        <mesh position={[0, 0, 0.6]}>
                            <planeGeometry args={[7, 0.05]} />
                            <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
                        </mesh>
                        <Html position={[3.8, 0, 0.6]} center>
                            <div style={{ color: '#FFD700', fontWeight: 'bold', textShadow: '0 0 4px black', whiteSpace: 'nowrap' }}>
                                Average ({avg.toFixed(2)})
                            </div>
                        </Html>
                    </group>
                </group>
            )}
        </group>
    )
}
