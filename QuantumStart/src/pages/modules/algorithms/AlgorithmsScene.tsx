import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

export function AlgorithmsScene() {
  const [activeBox, setActiveBox] = useState<number | null>(null);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <ClassicalBox 
          position={[-3, 0, 0]} 
          label="Classical Filter" 
          active={activeBox === 0}
          onClick={() => setActiveBox(0)}
        />
        <ClassicalBox 
          position={[3, 0, 0]} 
          label="Quantum Oracle" 
          active={activeBox === 1}
          onClick={() => setActiveBox(1)}
        />
      </Float>

      {activeBox !== null && (
         <Html position={[0, -3, 0]} center>
            <div style={{ 
              background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '12px',
              border: '1px solid var(--blue-0)', color: '#fff', width: '300px',
              textAlign: 'center', pointerEvents: 'none'
            }}>
              {activeBox === 0 ? 
                "Classical logic checks bits one by one. Slow and recursive." : 
                "Quantum Oracles mark the solution in one step via phase kickback."
              }
            </div>
         </Html>
      )}
    </group>
  );
}

function ClassicalBox({ position, label, active, onClick }: { position: [number, number, number], label: string, active: boolean, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      if (active) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <Box ref={meshRef} args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial 
          color={active ? "var(--blue-0)" : "#333"} 
          emissive={active ? "var(--blue-0)" : "#000"}
          emissiveIntensity={0.5}
        />
      </Box>
      <Html position={[0, 1.5, 0]} center>
         <div style={{ color: '#fff', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
            {label}
         </div>
      </Html>
    </group>
  );
}
