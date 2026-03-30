import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StepPostProcess({ isActive }: { isActive?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreColor = '#A67B5B';
  const emissiveColor = '#3a2510';
  const satelliteColor = '#6a5040';
  const highlightColor = '#FFB7C5';

  const satellites = useMemo(() => {
    const data: { angle: number; radius: number; isHighlight: boolean }[] = [];
    for (let i = 0; i < 6; i++) {
      data.push({
        angle: (i / 6) * Math.PI * 2,
        radius: 2.8,
        isHighlight: i === 2
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {

      let ringIdx = 0;
      groupRef.current.children.forEach(child => {
        const mesh = child as THREE.Mesh;

        // Focus-fade lerping
        if (mesh.material instanceof THREE.MeshPhongMaterial) {
          const baseOpacity = mesh.userData.type === 'ring' ? 0.7 : 0.85;
          const baseEmissive = mesh.userData.type === 'ring' ? 0.4 : 0.5;

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
        if (child.userData.type === 'satellite') {
          const newAngle = child.userData.initialAngle + t * 0.4;
          child.position.x = Math.cos(newAngle) * child.userData.radius;
          child.position.y = Math.sin(newAngle) * child.userData.radius;
        } else if (child.userData.type === 'ring') {
          child.rotation.z = t * (0.15 + ringIdx * 0.07);
          child.rotation.x = t * (0.08 + ringIdx * 0.05);
          ringIdx++;
        } else if (child.userData.type === 'core') {
          child.scale.setScalar(1 + Math.sin(t * 1.1) * 0.03);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Solution Core */}
      <mesh userData={{ type: 'core' }}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshPhongMaterial color={coreColor} emissive={emissiveColor} emissiveIntensity={0.5} shininess={120} transparent opacity={0.85} />
      </mesh>

      {/* Orbiting Satellites */}
      {satellites.map((s, i) => (
        <mesh 
          key={`sat-${i}`} 
          position={[Math.cos(s.angle) * s.radius, Math.sin(s.angle) * s.radius, 0]}
          userData={{ type: 'satellite', initialAngle: s.angle, radius: s.radius }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshPhongMaterial 
            color={s.isHighlight ? highlightColor : satelliteColor} 
            emissive={s.isHighlight ? '#5a3040' : '#2a1808'} 
            emissiveIntensity={0.5} 
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* D-Wave Rings */}
      {[0, 1, 2].map((i) => (
        <mesh 
          key={`ring-${i}`} 
          rotation={[(i * Math.PI) / 4, (i * Math.PI) / 6, 0]}
          userData={{ type: 'ring' }}
        >
          <torusGeometry args={[1.5 + i * 0.55, 0.02, 16, 80]} />
          <meshPhongMaterial 
            color={coreColor} 
            emissive={emissiveColor} 
            emissiveIntensity={0.4} 
            transparent 
            opacity={0.7} 
            shininess={80} 
          />
        </mesh>
      ))}
    </group>
  );
}
