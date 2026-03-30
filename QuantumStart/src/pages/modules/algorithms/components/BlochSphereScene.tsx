import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BlochSphereSceneProps {
    vector: [number, number, number];
    label: string;
}

export function BlochSphereScene({ vector, label }: BlochSphereSceneProps) {
    const arrowRef = useRef<THREE.Group>(null);
    const targetDir = new THREE.Vector3(...vector).normalize();

    useFrame((_state, delta) => {
        if (!arrowRef.current) return;
        // Smoothly rotate arrow to target vector
        const currentQuat = arrowRef.current.quaternion.clone();
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetDir);
        currentQuat.slerp(targetQuat, delta * 4);
        arrowRef.current.quaternion.copy(currentQuat);
    });

    return (
        <group>
            {/* The Sphere Shell */}
            <Sphere args={[2, 32, 32]}>
                <meshPhongMaterial 
                    color="#5DA7DB" 
                    transparent 
                    opacity={0.1} 
                    wireframe 
                />
            </Sphere>

            {/* Axis Lines */}
            <gridHelper args={[4, 4, 0x444444, 0x222222]} rotation={[Math.PI/2, 0, 0]} />
            
            {/* The State Vector Arrow */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <group ref={arrowRef}>
                    <mesh position={[0, 1, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
                        <meshStandardMaterial color="#FFB7C5" emissive="#FFB7C5" emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={[0, 2, 0]}>
                        <coneGeometry args={[0.1, 0.2, 8]} />
                        <meshStandardMaterial color="#FFB7C5" emissive="#FFB7C5" emissiveIntensity={0.5} />
                    </mesh>
                    
                    {/* Label at the tip */}
                    <Html position={[0, 2.3, 0]} center>
                        <div style={{ 
                            background: 'rgba(0,0,0,0.8)', padding: '4px 12px',
                            borderRadius: '20px', border: '1px solid var(--blue-0)',
                            color: 'var(--blue-0)', fontSize: '12px', fontWeight: 'bold'
                        }}>
                            {label}
                        </div>
                    </Html>
                </group>
            </Float>

            {/* Ambient Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
        </group>
    );
}
