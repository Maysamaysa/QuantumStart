import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

export function AlgoIntroScene() {
    const groupRef = useRef<THREE.Group>(null)

    // Generate random nodes for a network/circuit look
    const [nodes] = useState(() => {
        const pts = []
        for (let i = 0; i < 20; i++) {
            pts.push(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4
            ))
        }
        return pts
    })

    // Generate connections between close nodes
    const lines = useMemo(() => {
        const connections = []
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].distanceTo(nodes[j]) < 4) {
                    connections.push([nodes[i], nodes[j]])
                }
            }
        }
        return connections
    }, [nodes])

    useFrame((state) => {
        if (!groupRef.current) return
        const t = state.clock.getElapsedTime()
        groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.2
        groupRef.current.rotation.x = Math.cos(t * 0.15) * 0.1
        groupRef.current.position.y = Math.sin(t * 0.5) * 0.5
    })

    return (
        <group ref={groupRef}>
            {/* The Nodes */}
            {nodes.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial color="#5DCAA5" transparent opacity={0.8} />
                    <pointLight distance={3} intensity={0.5} color="#5DCAA5" />
                </mesh>
            ))}

            {/* The Connections */}
            {lines.map((line, i) => (
                <Line
                    key={`line-${i}`}
                    points={line}
                    color="#5DA7DB"
                    lineWidth={1.5}
                    transparent
                    opacity={0.3}
                />
            ))}

            {/* Glowing Core */}
            <mesh position={[0, 0, -2]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#7F77DD" wireframe transparent opacity={0.15} />
            </mesh>
            <mesh position={[0, 0, -2]}>
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshBasicMaterial color="#5DA7DB" wireframe transparent opacity={0.05} />
            </mesh>
        </group>
    )
}
