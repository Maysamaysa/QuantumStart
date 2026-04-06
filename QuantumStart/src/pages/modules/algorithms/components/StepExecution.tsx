import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StepExecution({ isActive }: { isActive?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const outcomes = [0.05, 0.12, 0.08, 0.42, 0.06, 0.15, 0.07, 0.05];
  const barColor = '#FFB7C5';
  const inactiveBarColor = '#7a4a5a';
  const emissiveColor = '#5a3040';
  const inactiveEmissiveColor = '#2a1a22';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {

      groupRef.current.children.forEach(child => {
        const mesh = child as THREE.Mesh;

        // Focus-fade lerping
        if (mesh.material instanceof THREE.MeshPhongMaterial) {
          const baseOpacity = mesh.userData.isMax ? 0.95 : 0.7;
          const baseEmissive = mesh.userData.isMax ? 0.6 : 0.25;

          mesh.material.opacity = THREE.MathUtils.lerp(
            mesh.material.opacity, 
            isActive ? baseOpacity : 0.05, 
            0.05
          );
          mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
            mesh.material.emissiveIntensity, 
            isActive ? baseEmissive : 0.0, 
            0.05
          );
        }

        // Animations
        if (mesh.userData.isMax) {
          child.scale.y = 1 + Math.sin(t * 2) * 0.04;
        }
        if (child.userData.type === 'orbit') {
          child.rotation.y = t * 0.18;
        }
        if (child.userData.type === 'sphere') {
          child.position.y = 2.2 + Math.sin(t * 1.5) * 0.15;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Histogram Bars */}
      {outcomes.map((h, i) => {
        const height = h * 8;
        const isMax = h === 0.42;
        return (
          <mesh 
            key={`bar-${i}`} 
            position={[(i - 3.5) * 0.75, height / 2 - 2.5, 0]}
            userData={{ isMax, targetH: height }}
          >
            <boxGeometry args={[0.5, height, 0.4]} />
            <meshPhongMaterial 
              color={isMax ? barColor : inactiveBarColor} 
              emissive={isMax ? emissiveColor : inactiveEmissiveColor} 
              emissiveIntensity={isMax ? 0.5 : 0.2}
              shininess={60}
              transparent 
              opacity={0.85} 
            />
          </mesh>
        );
      })}

      {/* Orbit Ring */}
      <mesh rotation={[Math.PI / 5, 0, 0]} userData={{ type: 'orbit' }}>
        <torusGeometry args={[3.6, 0.03, 16, 80]} />
        <meshPhongMaterial 
          color={barColor} 
          emissive={emissiveColor} 
          emissiveIntensity={0.4} 
          transparent 
          opacity={0.7} 
          shininess={80} 
        />
      </mesh>

      {/* Floating Measurement Sphere */}
      <mesh position={[0, 2.2, 0.5]} userData={{ type: 'sphere' }}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhongMaterial color={barColor} emissive={emissiveColor} emissiveIntensity={0.5} transparent opacity={0.85} shininess={120} />
      </mesh>
    </group>
  );
}
