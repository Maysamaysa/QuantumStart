import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Complex } from '../../lib/simulator/stateVector';
import { stateToBlochVector } from '../../lib/simulator/bloch';
import styles from './BlochSphere.module.css';

const SPHERE_RADIUS = 1.35;

/** ── Animated State Vector Arrow ── */
function AnimatedArrow({ bloch }: { bloch: { x: number; y: number; z: number; length: number } }) {
  const [points, setPoints] = useState<[number, number, number][]>([[0, 0, 0], [0, SPHERE_RADIUS, 0]]);
  const targetPos = useMemo(() => {
    // Mapping Bloch coordinates to Scene coordinates:
    // Bloch X -> Scene X
    // Bloch Y -> Scene Z
    // Bloch Z -> Scene Y (Vertical)
    return new THREE.Vector3(
      bloch.x * SPHERE_RADIUS,
      bloch.z * SPHERE_RADIUS,
      bloch.y * SPHERE_RADIUS
    );
  }, [bloch.x, bloch.y, bloch.z]);

  const currentPos = useRef(new THREE.Vector3(0, SPHERE_RADIUS, 0));

  useFrame((_state, delta) => {
    // Smoothly interpolate the position
    currentPos.current.lerp(targetPos, Math.min(delta * 12, 1));
    
    // Check if we need to update the points to avoid unnecessary state updates
    if (currentPos.current.distanceTo(new THREE.Vector3(...points[1])) > 0.001) {
      setPoints([
        [0, 0, 0],
        [currentPos.current.x, currentPos.current.y, currentPos.current.z]
      ]);
    }
  });

  return (
    <group>
      <Line 
        points={points} 
        color="#A67B5B" 
        lineWidth={6} 
      />
      <mesh position={points[1]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#A67B5B" />
        <pointLight intensity={2} distance={3} color="#A67B5B" />
      </mesh>
      
      {/* Projections to equatorial plane */}
      <Line
        points={[[points[1][0], 0, points[1][2]], points[1]]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.3}
        dashed
      />
      <mesh position={[points[1][0], 0, points[1][2]]}>
        <sphereGeometry args={[0.04]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/** ── Specialized Bloch Scene with Cage and Labels ── */
function DetailedScene({
  state,
  nQubits,
  selectedQubit,
}: {
  state: Complex[];
  nQubits: number;
  selectedQubit: number;
}) {
  const bloch = stateToBlochVector(state, nQubits, selectedQubit);

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      
      {/* The Central Sphere (Invisible depth filler) */}
      <Sphere args={[SPHERE_RADIUS, 32, 24]}>
        <meshBasicMaterial transparent opacity={0.06} color="#ffffff" depthWrite={false} />
      </Sphere>

      {/* Lat/Lon Cage (Visual) */}
      <group>
        {/* Longitude Lines */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI;
          return (
            <Line 
              key={`lon-${i}`}
              points={Array.from({length: 65}).map((_, j) => {
                const a = (j / 64) * Math.PI * 2;
                const x = Math.cos(a) * SPHERE_RADIUS;
                const y = Math.sin(a) * SPHERE_RADIUS;
                return [x * Math.cos(angle), y, x * Math.sin(angle)];
              })} 
              color="#ffffff" 
              lineWidth={1} 
              transparent 
              opacity={0.15} 
            />
          );
        })}
        {/* Equator */}
        <Line 
          points={Array.from({length: 33}).map((_, i) => [
            SPHERE_RADIUS * Math.cos((i / 32) * Math.PI * 2),
            0,
            SPHERE_RADIUS * Math.sin((i / 32) * Math.PI * 2)
          ])} 
          color="#5DA7DB" 
          lineWidth={2} 
          transparent 
          opacity={0.4} 
        />
      </group>

      {/* AXES with Labels */}
      {/* Z Axis (|0> to |1>) */}
      <group>
        <Line points={[[0, -SPHERE_RADIUS * 1.25, 0], [0, SPHERE_RADIUS * 1.25, 0]]} color="#ffffff" lineWidth={2} transparent opacity={0.4} />
        <Text position={[0, SPHERE_RADIUS * 1.5, 0]} fontSize={0.25} color="#ffffff" fontWeight="bold">|0⟩</Text>
        <Text position={[0, -SPHERE_RADIUS * 1.5, 0]} fontSize={0.25} color="#ffffff" fontWeight="bold">|1⟩</Text>
        <mesh position={[0, SPHERE_RADIUS, 0]}><sphereGeometry args={[0.07]} /><meshBasicMaterial color="#5DA7DB" /></mesh>
        <mesh position={[0, -SPHERE_RADIUS, 0]}><sphereGeometry args={[0.07]} /><meshBasicMaterial color="#FFB7C5" /></mesh>
      </group>

      {/* X Axis (|+> to |->) */}
      <group>
        <Line points={[[-SPHERE_RADIUS * 1.25, 0, 0], [SPHERE_RADIUS * 1.25, 0, 0]]} color="#ff6666" lineWidth={2} transparent opacity={0.4} />
        <Text position={[SPHERE_RADIUS * 1.6, 0.1, 0]} fontSize={0.2} color="#5DA7DB" fontWeight="bold">|+⟩</Text>
        <Text position={[-SPHERE_RADIUS * 1.6, 0.1, 0]} fontSize={0.2} color="#5DA7DB" fontWeight="bold">|-⟩</Text>
      </group>

      {/* Y Axis (|i> to |-i>) */}
      <group>
        <Line points={[[0, 0, -SPHERE_RADIUS * 1.25], [0, 0, SPHERE_RADIUS * 1.25]]} color="#66ff66" lineWidth={2} transparent opacity={0.4} />
        <Text position={[0.1, 0.1, SPHERE_RADIUS * 1.6]} fontSize={0.2} color="#5DA7DB" fontWeight="bold">|i⟩</Text>
        <Text position={[0.1, 0.1, -SPHERE_RADIUS * 1.6]} fontSize={0.2} color="#5DA7DB" fontWeight="bold">|-i⟩</Text>
      </group>

      {/* The Animated Arrow */}
      <AnimatedArrow bloch={bloch} />
    </>
  );
}

export interface BlochSphereProps {
  state: Complex[];
  nQubits: number;
  selectedQubitIndex: number;
  onQubitIndexChange: (index: number) => void;
}

export function BlochSphere({
  state,
  nQubits,
  selectedQubitIndex,
  onQubitIndexChange,
}: BlochSphereProps) {
  const bloch = stateToBlochVector(state, nQubits, selectedQubitIndex);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>Bloch sphere</span>
        <div className={styles.qubitSelector}>
          <span className={styles.qubitLabel}>Qubit:</span>
          {Array.from({ length: nQubits }, (_, i) => (
            <button
              key={i}
              type="button"
              className={styles.qubitBtn}
              data-selected={selectedQubitIndex === i || undefined}
              onClick={() => onQubitIndexChange(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      {!bloch.isPure && (
        <p className={styles.mixedNote}>Mixed state (amplitude &lt; 1)</p>
      )}
      <div className={styles.canvasWrap}>
        <Canvas
          camera={{ position: [2.8, 2, 2.8], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <DetailedScene
              state={state}
              nQubits={nQubits}
              selectedQubit={selectedQubitIndex}
            />
          </Suspense>
          <OrbitControls 
            enableDamping 
            dampingFactor={0.1} 
            enablePan={false}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>
      </div>
    </div>
  );
}
