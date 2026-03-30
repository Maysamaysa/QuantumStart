import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * TaskScheduleScene — Phase 3 (Example) 3D visualization
 * 
 * Step 0-2: Shows task nodes connected to slot nodes with red conflict rings
 * Step 3 (Annealing): Animated particles flowing through the graph
 * Step 4 (Results): Solution highlights with glow on optimal path
 */

interface TaskScheduleSceneProps {
  currentStep: number;
}

// Task positions (left column)
const TASK_POSITIONS: [number, number, number][] = [
  [-3.5, 2.0, 0],  // Task A
  [-3.5, 0, 0],    // Task B
  [-3.5, -2.0, 0], // Task C
];

// Slot positions (right column)  
const SLOT_POSITIONS: [number, number, number][] = [
  [3.5, 1.2, 0],   // Morning
  [3.5, -1.2, 0],  // Afternoon
];

// All possible assignment edges (task -> slot)
const EDGES: [number, number][] = [
  [0, 0], [0, 1], // A -> Morning, A -> Afternoon
  [1, 0], [1, 1], // B -> Morning, B -> Afternoon
  [2, 0], [2, 1], // C -> Morning, C -> Afternoon
];

// Optimal solution edges (A->Morning, B->Afternoon, C->Morning)
const SOLUTION_EDGES = [0, 3, 4]; // indices into EDGES

export function TaskScheduleScene({ currentStep }: TaskScheduleSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Particles for the annealing effect
  const particles = useMemo(() => {
    const data: { offset: number; speed: number; edge: number }[] = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        offset: Math.random(),
        speed: 0.3 + Math.random() * 0.6,
        edge: Math.floor(Math.random() * EDGES.length),
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    groupRef.current.children.forEach(child => {
      const userData = child.userData;

      // Task nodes gentle bob
      if (userData.type === 'task-node') {
        const idx = userData.idx as number;
        child.position.y = TASK_POSITIONS[idx][1] + Math.sin(t * 0.8 + idx * 1.5) * 0.1;
      }

      // Slot nodes gentle pulse
      if (userData.type === 'slot-node') {
        const scale = 1 + Math.sin(t * 1.2 + userData.idx * 2) * 0.06;
        child.scale.setScalar(scale);
      }

      // Particle animation along edges (only in step 3: Quantum Solve)
      if (userData.type === 'particle') {
        if (currentStep === 3) {
          const progress = ((t * userData.speed + userData.offset) % 1);
          const edge = EDGES[userData.edge];
          const from = TASK_POSITIONS[edge[0]];
          const to = SLOT_POSITIONS[edge[1]];
          
          child.position.x = from[0] + (to[0] - from[0]) * progress;
          child.position.y = from[1] + (to[1] - from[1]) * progress;
          child.position.z = Math.sin(progress * Math.PI) * 0.5;
          child.visible = true;

          const mat = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
          mat.opacity = Math.sin(progress * Math.PI) * 0.9;
        } else {
          child.visible = false;
        }
      }

      // Solution highlighting (step 4: Final Data)
      if (userData.type === 'edge') {
        const edgeIdx = userData.idx as number;
        const isSolution = SOLUTION_EDGES.includes(edgeIdx);
        const mat = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
        
        if (currentStep === 4 && isSolution) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.95, 0.05);
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 1.5, 0.05);
        } else if (currentStep === 4 && !isSolution) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.05, 0.05);
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, 0.05);
        } else {
          const baseOpacity = currentStep < 3 ? 0.4 : 0.1;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, baseOpacity, 0.05);
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.4, 0.05);
        }
      }

      // Conflict rings (A-B and B-C)
      if (userData.type === 'conflict-ring') {
        child.rotation.z = t * 0.5;
        const mat = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
        const targetOpacity = currentStep < 3 ? 0.6 : 0.15;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Task Nodes (Left) */}
      {TASK_POSITIONS.map((pos, i) => (
        <mesh key={`task-${i}`} position={pos} userData={{ type: 'task-node', idx: i }}>
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshPhongMaterial 
            color="#5DA7DB"
            emissive="#2a4a8a"
            emissiveIntensity={0.8}
            shininess={120}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Slot Nodes (Right) */}
      {SLOT_POSITIONS.map((pos, i) => (
        <mesh key={`slot-${i}`} position={pos} userData={{ type: 'slot-node', idx: i }}>
          <boxGeometry args={[0.9, 0.9, 0.4]} />
          <meshPhongMaterial
            color={i === 0 ? '#C1E1C1' : '#A67B5B'}
            emissive={i === 0 ? '#3a5a3a' : '#4a3520'}
            emissiveIntensity={0.7}
            shininess={100}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Assignment Edges */}
      {EDGES.map(([tIdx, sIdx], i) => {
        const from = TASK_POSITIONS[tIdx];
        const to = SLOT_POSITIONS[sIdx];
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const isSolution = SOLUTION_EDGES.includes(i);

        return (
          <mesh
            key={`edge-${i}`}
            position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0]}
            rotation={[0, 0, angle + Math.PI / 2]}
            userData={{ type: 'edge', idx: i }}
          >
            <cylinderGeometry args={[isSolution ? 0.06 : 0.03, isSolution ? 0.06 : 0.03, len, 8]} />
            <meshPhongMaterial
              color={isSolution ? '#FFB7C5' : '#5DA7DB'}
              emissive={isSolution ? '#8a4a5a' : '#2a4d65'}
              emissiveIntensity={0.4}
              transparent
              opacity={0.4}
              shininess={50}
            />
          </mesh>
        );
      })}

      {/* Conflict rings (Representing QUBO Penalties: A-B and B-C) */}
      <mesh 
        position={[-3.5, 1.0, 0.02]} 
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ type: 'conflict-ring' }}
      >
        <torusGeometry args={[0.9, 0.04, 12, 48]} />
        <meshPhongMaterial
          color="#ff4444"
          emissive="#ff0000"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          shininess={80}
        />
      </mesh>

      <mesh 
        position={[-3.5, -1.0, 0.02]} 
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ type: 'conflict-ring' }}
      >
        <torusGeometry args={[0.9, 0.04, 12, 48]} />
        <meshPhongMaterial
          color="#ff4444"
          emissive="#ff0000"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          shininess={80}
        />
      </mesh>

      {/* Annealing particles (visible in step 3) */}
      {particles.map((p, i) => (
        <mesh
          key={`particle-${i}`}
          visible={false}
          userData={{ type: 'particle', ...p }}
        >
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshPhongMaterial
            color="#FFB7C5"
            emissive="#FFB7C5"
            emissiveIntensity={2.0}
            transparent
            opacity={0}
            shininess={150}
          />
        </mesh>
      ))}
    </group>
  );
}
