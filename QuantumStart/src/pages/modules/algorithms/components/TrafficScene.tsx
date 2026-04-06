import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Text, MeshDistortMaterial } from '@react-three/drei';

interface TrafficSceneProps {
  trafficWeight: number;
}

export function TrafficScene({ trafficWeight }: TrafficSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const innerOrbRef = useRef<THREE.Mesh>(null);

  const MAX_PER_ROAD = 30;

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < MAX_PER_ROAD * 2; i++) {
      const isRoadA = i < MAX_PER_ROAD;
      data.push({
        isRoadA,
        axis: isRoadA ? 'x' : 'z' as 'x' | 'z',
        offset: (Math.random() - 0.5) * 3,
        speed: 0.08 + Math.random() * 0.12,
        pos: (Math.random() - 0.5) * 40,
        color: isRoadA ? '#5DA7DB' : '#C1E1C1',
        id: i
      });
    }
    return data;
  }, []);

  const particleRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const aDensity = (1 - trafficWeight / 100); 
    const bDensity = (trafficWeight / 100);

    particleRefs.current.forEach((p, i) => {
      if (!p) return;
      const data = particles[i];
      const relativeIdx = data.isRoadA ? i : i - MAX_PER_ROAD;
      const threshold = data.isRoadA ? aDensity : bDensity;
      const isActive = (relativeIdx / MAX_PER_ROAD) < threshold;
      
      p.visible = isActive;
      if (!isActive) return;

      if (data.axis === 'x') {
        p.position.x += data.speed;
        if (p.position.x > 20) p.position.x = -20;
      } else {
        p.position.z += data.speed;
        if (p.position.z > 20) p.position.z = -20;
      }
    });

    if (orbRef.current) orbRef.current.rotation.y = t * 0.5;
    if (innerOrbRef.current) innerOrbRef.current.position.y = Math.sin(t * 2) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <spotLight position={[15, 20, 15]} intensity={60} angle={0.5} penumbra={1} castShadow />
      <pointLight position={[-15, 10, -15]} intensity={30} color="#5DA7DB" />
      <pointLight position={[0, 5, 0]} intensity={15} color="#C1E1C1" />

      {/* Roads */}
      <group position={[0, -0.1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 5]} />
          <meshStandardMaterial color="#0a0a0c" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0.01, 2.4]}>
          <boxGeometry args={[40, 0.05, 0.05]} />
          <meshStandardMaterial color="#5DA7DB" emissive="#5DA7DB" emissiveIntensity={5} />
        </mesh>
        <mesh position={[0, 0.01, -2.4]}>
          <boxGeometry args={[40, 0.05, 0.05]} />
          <meshStandardMaterial color="#5DA7DB" emissive="#5DA7DB" emissiveIntensity={5} />
        </mesh>
        <Text 
          position={[-15, 0.5, 4]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          fontSize={1.2} 
          color="black"
        >
          ROAD A
        </Text>
      </group>

      <group position={[0, -0.15, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[40, 5]} />
          <meshStandardMaterial color="#0a0a0c" transparent opacity={0.8} />
        </mesh>
        <mesh position={[2.4, 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[40, 0.05, 0.05]} />
          <meshStandardMaterial color="#C1E1C1" emissive="#C1E1C1" emissiveIntensity={5} />
        </mesh>
        <mesh position={[-2.4, 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[40, 0.05, 0.05]} />
          <meshStandardMaterial color="#C1E1C1" emissive="#C1E1C1" emissiveIntensity={5} />
        </mesh>
        <Text 
          position={[4, 0.5, -15]} 
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]} 
          fontSize={1.2} 
          color="#C1E1C1"
        >
          ROAD B
        </Text>
      </group>

      {/* Vehicles */}
      {particles.map((p, i) => (
        <group 
          key={p.id} 
          ref={el => { particleRefs.current[i] = el; }} 
          position={[p.axis === 'x' ? p.pos : p.offset, 0.3, p.axis === 'z' ? p.pos : p.offset]}
          rotation={[0, p.axis === 'x' ? 0 : Math.PI / 2, 0]}
        >
          <mesh>
            <boxGeometry args={[1.2, 0.25, 0.6]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.1, 0.22, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[1.3, 0.02, 0.7]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={4} />
          </mesh>
          <mesh position={[0.6, 0.05, 0.2]}>
            <boxGeometry args={[0.05, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.6, 0.05, -0.2]}>
            <boxGeometry args={[0.05, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}

      {/* Decision Orb */}
      <Float speed={2} rotationIntensity={1.5}>
        <group position={[0, 2.5, 0]}>
          <mesh ref={orbRef}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.15} wireframe />
          </mesh>
          <mesh ref={innerOrbRef}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <MeshDistortMaterial 
              color={trafficWeight < 50 ? "#5DA7DB" : "#C1E1C1"} 
              emissive={trafficWeight < 50 ? "#5DA7DB" : "#C1E1C1"} 
              emissiveIntensity={2} 
              speed={4} 
              distort={0.4} 
            />
          </mesh>
          <Text position={[0, 2, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">DECISION QUBIT</Text>
        </group>
      </Float>
    </group>
  );
}
