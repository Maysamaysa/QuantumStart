import { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Cylinder, Box } from '@react-three/drei';
import type { CircuitGate } from '../algoTypes';

interface CircuitSceneProps {
  gates: CircuitGate[];
  onPlaceGate: (qubit: number, slot: number) => void;
  onRemoveGate: (id: string) => void;
  isDraggingType: string | null;
}

export function CircuitScene({ 
  gates, onPlaceGate, onRemoveGate, isDraggingType 
}: CircuitSceneProps) {
  const { raycaster, mouse, camera } = useThree();
  const [hoveredSlot, setHoveredSlot] = useState<{ qubit: number, slot: number } | null>(null);

  const slots = [-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5];
  const qubitsY = [2, 0, -2];

  useFrame(() => {
    if (!isDraggingType) {
      if (hoveredSlot) setHoveredSlot(null);
      return;
    }

    // Raycasting for placement
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, intersection)) {
      // Find nearest qubit and slot
      let nearestQubit = -1;
      let minDistY = Infinity;
      qubitsY.forEach((y, i) => {
        const dist = Math.abs(intersection.y - y);
        if (dist < 1 && dist < minDistY) {
          minDistY = dist;
          nearestQubit = i;
        }
      });

      let nearestSlot = -1;
      let minDistZ = Infinity;
      slots.forEach((z, i) => {
        const dist = Math.abs(intersection.x - z); // Using X for horizontal Z time
        if (dist < 0.75 && dist < minDistZ) {
          minDistZ = dist;
          nearestSlot = i;
        }
      });

      if (nearestQubit !== -1 && nearestSlot !== -1) {
        setHoveredSlot({ qubit: nearestQubit, slot: nearestSlot });
      } else {
        setHoveredSlot(null);
      }
    }
  });

  const handleClick = () => {
    if (isDraggingType && hoveredSlot) {
      onPlaceGate(hoveredSlot.qubit, hoveredSlot.slot);
    }
  };

  return (
    <group onClick={handleClick}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#5DA7DB" />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#FFB7C5" />

      {/* Wires */}
      {qubitsY.map((y, i) => (
        <group key={i}>
          <Cylinder 
            args={[0.04, 0.04, 14, 8]} 
            rotation={[0, 0, Math.PI / 2]} 
            position={[0, y, 0]}
          >
            <meshStandardMaterial 
              color="#5DA7DB" 
              emissive="#5DA7DB" 
              emissiveIntensity={0.3} 
            />
          </Cylinder>
          <Text 
            position={[-7.5, y, 0]} 
            fontSize={0.4} 
            color="#5DA7DB" 
            font="monospace"
          >
            q{i}
          </Text>
        </group>
      ))}

      {/* Grid Slots (for visualization when dragging) */}
      {isDraggingType && slots.map((x, si) => (
        qubitsY.map((y, qi) => (
          <Box 
            key={`${qi}-${si}`}
            position={[x, y, 0]}
            args={[1, 1, 0.1]}
            visible={hoveredSlot?.qubit === qi && hoveredSlot?.slot === si}
          >
            <meshBasicMaterial color="#FFB7C5" transparent opacity={0.3} />
          </Box>
        ))
      ))}

      {/* Placed Gates */}
      {gates.map((gate) => (
        <GateComponent 
          key={gate.id} 
          gate={gate} 
          onRemove={() => onRemoveGate(gate.id)} 
          position={[slots[gate.slot], qubitsY[gate.qubit], 0]}
        />
      ))}
    </group>
  );
}

// --- Helper component for Gate rendering ---
function GateComponent({ gate, onRemove, position }: { gate: CircuitGate, onRemove: () => void, position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);

  // Special gate logic (wider, multiple qubits) omitted for now, simplified to single boxes
  const gateColors: Record<string, string> = {
    H: '#5DA7DB',
    X: '#A67B5B',
    Oracle: '#FFB7C5',
    Diffusion: '#C1E1C1'
  };

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onContextMenu={(e) => { e.stopPropagation(); onRemove(); }}
    >
      <Box args={[1, 1, 0.3]}>
        <meshStandardMaterial 
          color={gateColors[gate.type] || '#534AB7'} 
          emissive={gateColors[gate.type] || '#534AB7'}
          emissiveIntensity={hovered ? 0.6 : 0.2}
        />
      </Box>
      <Text 
        position={[0, 0, 0.2]} 
        fontSize={0.5} 
        color="#fff" 
        fontWeight="bold"
      >
        {gate.type[0].toUpperCase()}
      </Text>
    </group>
  );
}
