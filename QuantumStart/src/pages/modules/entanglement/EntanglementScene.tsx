import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Line, Sphere } from '@react-three/drei'
import type { Phase } from './EntanglementModule'
import { MiniBlochSphere } from '../../../models/MiniBlochSphere'

interface EntanglementSceneProps {
    phase: Phase
    step: number
    isEntangled: boolean
    isMeasured: boolean
    outcome: 0 | 1 | null
    qubitA: { x: number, y: number }
    setQubitA: (v: { x: number, y: number }) => void
    qubitB: { x: number, y: number }
    setQubitB: (v: { x: number, y: number }) => void
}

function DraggableQubit({ isLeft, isEntangled, isMeasured, outcome, colorOffset, posObj, setPosObj }: any) {
    const groupRef = useRef<THREE.Group>(null)
    const { viewport, camera, mouse } = useThree()
    const [isDragging, setIsDragging] = useState(false)

    const handlePointerDown = (e: any) => {
        e.stopPropagation()
        setIsDragging(true)
        document.body.style.cursor = 'grabbing'
    }

    const handlePointerUp = (e: any) => {
        e.stopPropagation()
        setIsDragging(false)
        document.body.style.cursor = 'auto'
    }

    useFrame((_state, delta) => {
        if (!groupRef.current) return

        if (isDragging) {
            const vector = new THREE.Vector3(mouse.x, mouse.y, 0)
            vector.unproject(camera)
            const dir = vector.sub(camera.position).normalize()
            const distance = -camera.position.z / dir.z
            const pos = camera.position.clone().add(dir.multiplyScalar(distance))

            const limitX = (viewport.width / 2) - 1.5
            const limitY = (viewport.height / 2) - 1.5
            
            let clampedX = Math.max(-limitX, Math.min(limitX, pos.x))
            let clampedY = Math.max(-limitY, Math.min(limitY, pos.y))
            
            if (isLeft) clampedX = Math.min(clampedX, -0.5)
            else clampedX = Math.max(clampedX, 0.5)

            groupRef.current.position.set(clampedX, clampedY, 0)
            setPosObj({ x: clampedX, y: clampedY })
        } else {
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, posObj.x, 10 * delta)
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, posObj.y || 0, 10 * delta)
        }
    })

    return (
        <group 
            ref={groupRef} 
            position={[posObj.x, posObj.y || 0, 0]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerUp}
            onPointerOver={() => { document.body.style.cursor = 'grab'; }}
            scale={1.4}
        >
            <MiniBlochSphere 
                isMeasured={isMeasured}
                outcome={outcome}
                isEntangled={isEntangled}
                seedOffset={colorOffset}
                isLeft={isLeft}
            />
        </group>
    )
}

function TetherLine({ getPosA, getPosB, isEntangled, isMeasured }: any) {
    const [points, setPoints] = useState<[[number, number, number], [number, number, number]]>([[0,0,0], [0,0,0]])
    const lineMatRef = useRef<any>(null)
    const glowMatRef = useRef<any>(null)
    
    useFrame((state) => {
        const A = getPosA()
        const B = getPosB()
        
        // Only update points state if significantly moved
        if (Math.abs(A.x - points[0][0]) > 0.01 || Math.abs(A.y - points[0][1]) > 0.01 ||
            Math.abs(B.x - points[1][0]) > 0.01 || Math.abs(B.y - points[1][1]) > 0.01) {
            setPoints([
                [A.x, A.y || 0, -0.2], 
                [B.x, B.y || 0, -0.2]
            ])
        }
        
        if (lineMatRef.current && glowMatRef.current) {
             const mLine = lineMatRef.current.material
             const mGlow = glowMatRef.current.material
             if (isMeasured) {
                 mLine.opacity = THREE.MathUtils.lerp(mLine.opacity, 0, 0.1)
                 mGlow.opacity = THREE.MathUtils.lerp(mGlow.opacity, 0, 0.1)
             } else if (isEntangled) {
                 const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.5
                 mLine.opacity = THREE.MathUtils.lerp(mLine.opacity, 0.9, 0.2)
                 mGlow.opacity = THREE.MathUtils.lerp(mGlow.opacity, pulse, 0.2)
             } else {
                 mLine.opacity = THREE.MathUtils.lerp(mLine.opacity, 0, 0.2)
                 mGlow.opacity = THREE.MathUtils.lerp(mGlow.opacity, 0, 0.2)
             }
        }
    })

    return (
        <group>
            {/* Core Beam */}
            <Line ref={lineMatRef as any} points={points} color="#ffffff" lineWidth={3} transparent opacity={0} depthWrite={false} />
            {/* Thick Energy Glow */}
            <Line ref={glowMatRef as any} points={points} color="#FFB7C5" lineWidth={15} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </group>
    )
}

export default function EntanglementScene({ 
    phase, isEntangled, isMeasured, outcome, qubitA, setQubitA, qubitB, setQubitB 
}: EntanglementSceneProps) {

    useEffect(() => {
        const handleSnap = () => {}
        window.addEventListener('detective_snap', handleSnap)
        return () => window.removeEventListener('detective_snap', handleSnap)
    }, [])

    return (
        <group>
            <DraggableQubit 
                isLeft={true} 
                isEntangled={isEntangled}
                isMeasured={isMeasured}
                outcome={outcome}
                colorOffset={0}
                posObj={qubitA}
                setPosObj={setQubitA}
            />
            
            <DraggableQubit 
                isLeft={false} 
                isEntangled={isEntangled}
                isMeasured={isMeasured}
                outcome={outcome}
                colorOffset={Math.PI} 
                posObj={qubitB}
                setPosObj={setQubitB}
            />

            <TetherLine 
                getPosA={() => qubitA} 
                getPosB={() => qubitB} 
                isEntangled={isEntangled}
                isMeasured={isMeasured}
            />
        </group>
    )
}
