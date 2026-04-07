import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StepOptimizer({ isActive }: { isActive?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const wireColors = ['#C1E1C1', '#9ecf9e', '#7fc07f'];
  const gateColor = '#C1E1C1';
  const emissiveColor = '#2a4a2a';

  const [gates] = useState(() => {
    const data: { x: number; y: number; rotSpeed: number }[] = [];
    const gatePositions = [-3.5, -1, 1.5, 3.8];
    for (let i = 0; i < 3; i++) {
      gatePositions.forEach((xp) => {
        if (Math.random() > 0.3) {
          data.push({
            x: xp,
            y: (i - 1) * 1.4,
            rotSpeed: (Math.random() - 0.5) * 0.05
          });
        }
      });
    }
    return data;
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const targetOpacity = isActive ? 0.85 : 0.05;
      const targetEmissive = isActive ? 0.35 : 0.0;
      const targetWireOpacity = isActive ? 0.5 : 0.02;

      groupRef.current.children.forEach(child => {
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
        if (mesh.userData.type === 'gate') {
          mesh.rotation.z += mesh.userData.rotSpeed;
          mesh.rotation.y = t * 0.5;
        } else if (mesh.userData.type === 'orbit') {
          mesh.rotation.z = t * 0.2;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Wire Lanes */}
      {wireColors.map((color, i) => (
        <mesh key={`wire-${i}`} position={[0, (i - 1) * 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 11, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Gate Boxes */}
      {gates.map((g, i) => (
        <mesh 
          key={`gate-${i}`} 
          position={[g.x, g.y, 0]} 
          userData={{ type: 'gate', rotSpeed: g.rotSpeed }}
        >
          <boxGeometry args={[0.6, 0.6, 0.25]} />
          <meshPhongMaterial 
            color={gateColor} 
            emissive={emissiveColor} 
            emissiveIntensity={0.35} 
            shininess={60} 
            transparent 
            opacity={0.85} 
          />
        </mesh>
      ))}

      {/* Depth Indicator Bar */}
      <mesh position={[-0.75, -2.8, 0]}>
        <boxGeometry args={[5.5, 0.12, 0.1]} />
        <meshPhongMaterial color={gateColor} emissive={emissiveColor} emissiveIntensity={0.35} transparent opacity={0.8} />
      </mesh>

      {/* Orbit Ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]} userData={{ type: 'orbit' }}>
        <torusGeometry args={[3.4, 0.025, 16, 80]} />
        <meshPhongMaterial 
          color={gateColor} 
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
