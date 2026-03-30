import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface QubitData {
  x: number;
  y: number;
  phase: number;
}

interface WireData {
  x: number;
  y: number;
  rotation: [number, number, number];
}

export function StepLattice({ isActive }: { isActive?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const rows = 4;
  const cols = 5;

  const wireColor = '#5DA7DB';
  const qubitColor = '#5DA7DB';
  const emissiveColor = '#1a3d55';

  const [spheres] = useState<QubitData[]>(() => {
    const data: QubitData[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        data.push({
          x: (c - 2) * 1.3,
          y: (r - 1.5) * 1.3,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    return data;
  });

  const wires = useMemo<WireData[]>(() => {
    const data: WireData[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        data.push({
          x: (c - 2) * 1.3 + 0.65,
          y: (r - 1.5) * 1.3,
          rotation: [0, 0, Math.PI / 2]
        });
      }
    }
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        data.push({
          x: (c - 2) * 1.3,
          y: (r - 1.5) * 1.3 + 0.65,
          rotation: [0, 0, 0]
        });
      }
    }
    return data;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const targetOpacity = isActive ? 0.85 : 0.05;
      const targetEmissive = isActive ? 0.5 : 0.0;
      const targetWireOpacity = isActive ? 0.3 : 0.02;

      groupRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        
        // Focus-fade lerping
        if (mesh.material instanceof THREE.MeshPhongMaterial) {
          mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, targetOpacity, 0.05);
          mesh.material.emissiveIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity, targetEmissive, 0.05);
        }
        if (mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, targetWireOpacity, 0.05);
        }

        // Animations
        if (mesh.userData.type === 'qubit') {
          mesh.position.y = mesh.userData.baseY + Math.sin(t * 1.2 + mesh.userData.phase) * 0.08;
        } else if (mesh.userData.type === 'orbit') {
          mesh.rotation.z = t * 0.25;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {wires.map((w, i) => (
        <mesh key={`wire-${i}`} position={[w.x, w.y, 0]} rotation={w.rotation}>
          <cylinderGeometry args={[0.018, 0.018, 1.3, 8]} />
          <meshBasicMaterial color={wireColor} transparent opacity={0.3} />
        </mesh>
      ))}

      {spheres.map((s, i) => (
        <mesh 
          key={`qubit-${i}`} 
          position={[s.x, s.y, 0]} 
          userData={{ type: 'qubit', baseY: s.y, phase: s.phase }}
        >
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshPhongMaterial 
            color={qubitColor} 
            emissive={emissiveColor} 
            emissiveIntensity={0.5} 
            transparent 
            opacity={0.85} 
            shininess={120} 
          />
        </mesh>
      ))}

      <mesh rotation={[Math.PI / 3, 0, 0]} userData={{ type: 'orbit' }}>
        <torusGeometry args={[3.2, 0.03, 16, 80]} />
        <meshPhongMaterial 
          color={qubitColor} 
          emissive={emissiveColor} 
          emissiveIntensity={0.4} 
          transparent 
          opacity={0.7} 
          shininess={80} 
        />
      </mesh>
    </group>
  );
}
