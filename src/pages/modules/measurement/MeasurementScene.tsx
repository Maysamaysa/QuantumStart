import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import * as THREE from 'three'

function BlochSphere({ position, scale = 1, theta, phi, isMeasured, outcome }: any) {
    const timeRef = useRef(0)
    
    // Outcome 0 => North Pole (Theta = 0). Outcome 1 => South Pole (Theta = PI).
    const targetTheta = isMeasured ? (outcome === 0 ? 0 : Math.PI) : theta
    
    const [tipPos, setTipPos] = useState<[number, number, number]>([0, 1.5, 0])
    const currentVector = useRef(new THREE.Vector3(0, 1.5, 0))
    const currentPhi = useRef(phi)
    const arrowGroup = useRef<THREE.Group>(null)

    useFrame((_s, delta) => {
        timeRef.current += delta
        
        let tTheta = targetTheta
        let tPhi = phi
        
        if (!isMeasured) {
            const bob = Math.sin(timeRef.current * 3) * 0.05
            tTheta += bob
        } else {
            tPhi = 0 // SNAP to pole phase lock
        }

        // Interpolate Phase safely
        currentPhi.current = THREE.MathUtils.lerp(currentPhi.current, tPhi, 0.1)

        // Spherical to Cartesian (Y is UP)
        // X = Right (Phase 0), Z = Front (Phase 90)
        const targetX = 1.5 * Math.sin(tTheta) * Math.cos(currentPhi.current)
        const targetY = 1.5 * Math.cos(tTheta)
        const targetZ = 1.5 * Math.sin(tTheta) * Math.sin(currentPhi.current)
        const targetPos = new THREE.Vector3(targetX, targetY, targetZ)

        currentVector.current.lerp(targetPos, isMeasured ? 0.3 : 0.1)
        
        if (arrowGroup.current) {
            if (Math.abs(currentVector.current.x) < 0.001 && Math.abs(currentVector.current.z) < 0.001) {
                arrowGroup.current.up.set(1, 0, 0)
            } else {
                arrowGroup.current.up.set(0, 1, 0)
            }
            arrowGroup.current.lookAt(currentVector.current)
        }

        // Only update React state if moved significantly to save frames
        if (currentVector.current.distanceTo(new THREE.Vector3(...tipPos)) > 0.01) {
            setTipPos([currentVector.current.x, currentVector.current.y, currentVector.current.z])
        }
    })

    const isZero = targetTheta < Math.PI / 2
    const glowColor = isMeasured ? (isZero ? "#5DA7DB" : "#A67B5B") : "#FFB7C5"


    return (
        <group position={position} scale={scale} rotation={[0.15, -0.4, 0]}>
            {/* The Glass Bottle Orb */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshPhysicalMaterial 
                    color={isMeasured ? "#1a1a24" : "#F8F9FF"} 
                    transparent 
                    opacity={isMeasured ? 0.3 : 0.15} 
                    transmission={0.9} 
                    roughness={0.1}
                    clearcoat={1}
                    depthWrite={false}
                />
            </mesh>

            {/* Longitude Lines (Cage) */}
            <group>
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * Math.PI;
                    return (
                        <Line 
                            key={`lon-${i}`}
                            points={Array.from({length: 65}).map((_, j) => {
                                const a = (j / 64) * Math.PI * 2;
                                const x = Math.cos(a) * 1.5;
                                const y = Math.sin(a) * 1.5;
                                return [x * Math.cos(angle), y, x * Math.sin(angle)];
                            })} 
                            color="#ffffff" 
                            lineWidth={1} 
                            transparent 
                            opacity={0.08} 
                        />
                    );
                })}
            </group>
            
            {/* Subtle Equator / Axes rings */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[1.5, 0.005, 16, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
            <mesh>
                <torusGeometry args={[1.5, 0.005, 16, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </mesh>

            {/* Structured Axes (From Component Ref) */}
            {/* Z Axis (|0> to |1>) */}
            <group>
                 <Line points={[[0, -1.8, 0], [0, 1.8, 0]]} color="#5DA7DB" lineWidth={2} transparent opacity={isMeasured ? 0.1 : 0.6} />
                 <Text position={[0, 2.05, 0]} fontSize={0.35} color="#5DA7DB" fontWeight="bold" outlineWidth={0.02} outlineColor="#1a1a24" material-transparent material-opacity={isMeasured ? 0.4 : 1}>|0⟩</Text>
                 <Text position={[0, -2.05, 0]} fontSize={0.35} color="#FFB7C5" fontWeight="bold" outlineWidth={0.02} outlineColor="#1a1a24" material-transparent material-opacity={isMeasured ? 0.4 : 1}>|1⟩</Text>
                 <mesh position={[0, 1.5, 0]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="#5DA7DB" transparent opacity={isMeasured ? 0.2 : 0.8} /></mesh>
                 <mesh position={[0, -1.5, 0]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="#FFB7C5" transparent opacity={isMeasured ? 0.2 : 0.8} /></mesh>
            </group>

            {/* X Axis (|+> to |->) */}
            <group>
                 <Line points={[[-1.8, 0, 0], [1.8, 0, 0]]} color="#FFB7C5" lineWidth={1} transparent opacity={isMeasured ? 0.1 : 0.4} />
                 <Text position={[2.1, 0, 0]} fontSize={0.25} color="#FFB7C5" fontWeight="bold" outlineWidth={0.015} outlineColor="#1a1a24" material-transparent material-opacity={isMeasured ? 0.3 : 0.9}>|+⟩</Text>
                 <Text position={[-2.1, 0, 0]} fontSize={0.25} color="#FFB7C5" fontWeight="bold" outlineWidth={0.015} outlineColor="#1a1a24" material-transparent material-opacity={isMeasured ? 0.3 : 0.9}>|-⟩</Text>
            </group>

            {/* Y Axis (|i> to |-i>) */}
            <group>
                 <Line points={[[0, 0, -1.8], [0, 0, 1.8]]} color="#C1E1C1" lineWidth={1} transparent opacity={isMeasured ? 0.1 : 0.4} />
                 <Text position={[0, 0, 2.1]} fontSize={0.25} color="#C1E1C1" fontWeight="bold" outlineWidth={0.015} outlineColor="#1a1a24" material-transparent material-opacity={isMeasured ? 0.3 : 0.9}>|i+⟩</Text>
                 <Text position={[0, 0, -2.1]} fontSize={0.25} color="#C1E1C1" fontWeight="bold" outlineWidth={0.015} outlineColor="#1a1a24" material-transparent material-opacity={isMeasured ? 0.3 : 0.9}>|i-⟩</Text>
            </group>
            
            {/* State Vector Line and Equator Projection */}
            <group>
                {/* Main Vector Stick (Line) */}
                <Line 
                    points={[[0, 0, 0], tipPos]} 
                    color={glowColor} 
                    lineWidth={12} 
                    transparent 
                    opacity={0.9} 
                />
                
                {/* Central Origin Pin */}
                <mesh position={[0,0,0]}>
                    <sphereGeometry args={[0.03]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthTest={false} />
                </mesh>

                {/* Vector Tip (The Qubit Mass) */}
                <mesh position={tipPos}>
                    <sphereGeometry args={[isMeasured ? 0.12 : 0.08]} />
                    <meshBasicMaterial color={glowColor} />
                    <pointLight intensity={2} distance={3} color={glowColor} />
                </mesh>

                {/* Sub-Orb Pulse for Superposition */}
                {!isMeasured && (
                    <mesh position={tipPos}>
                        <sphereGeometry args={[0.18]} />
                        <meshBasicMaterial 
                            color={glowColor} 
                            transparent 
                            opacity={0.3}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                )}

                {/* Equatorial Shadow/Projection (Shows Phase visually) */}
                {!isMeasured && targetTheta > 0.1 && targetTheta < Math.PI - 0.1 && (
                    <>
                        <Line
                            points={[[tipPos[0], 0, tipPos[2]], tipPos]}
                            color="#FFB7C5"
                            lineWidth={1}
                            transparent
                            opacity={0.4}
                            dashed
                            dashSize={0.05}
                            gapSize={0.05}
                        />
                        <Line
                            points={[[0, 0, 0], [tipPos[0], 0, tipPos[2]]]}
                            color="#FFB7C5"
                            lineWidth={2}
                            transparent
                            opacity={0.3}
                        />
                    </>
                )}
            </group>
        </group>
    )
}

export default function MeasurementScene({ phase, step, theta, phi, isMeasured, measuredValue }: any) {
    if (phase === 'concept') {
        if (step === 1) {
            return <BlochSphere position={[0, 1, 0]} scale={1.2} theta={Math.PI/2} phi={0} />
        } else {
            return (
                <group position={[0, 1, 0]}>
                    <BlochSphere position={[-2.5, 0, 0]} scale={0.9} theta={Math.PI/2} phi={0} />
                    <BlochSphere position={[2.5, 0, 0]} scale={0.9} theta={0} phi={0} isMeasured={true} outcome={0} />
                </group>
            )
        }
    }
    return <BlochSphere position={[-2.5, 0.4, 0]} scale={1.4} theta={theta} phi={phi} isMeasured={isMeasured} outcome={measuredValue} />
}
