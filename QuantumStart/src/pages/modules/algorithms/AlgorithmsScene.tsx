import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Import our sub-scenes
import { StepLattice } from './components/StepLattice';
import { StepOptimizer } from './components/StepOptimizer';
import { StepExecution } from './components/StepExecution';
import { StepPostProcess } from './components/StepPostProcess';
import { TaskScheduleScene } from './components/TaskScheduleScene';
import { TrafficScene } from './components/TrafficScene';

interface AlgorithmsSceneProps {
  currentStep: number;
  phase: number;
  trafficWeight: number;
}

export function AlgorithmsScene({ currentStep, phase, trafficWeight }: AlgorithmsSceneProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 12));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Set target positions based on phase
    if (phase === 0) {
      targetPos.current.set(0, 0, -currentStep * 22 + 12);
      targetLookAt.current.set(0, 0, -currentStep * 22);
    } else if (phase === 1) {
      // Third-person perspective for Traffic
      targetPos.current.set(15, 12, 12);
      targetLookAt.current.set(0, 0, 0);
    } else {
      // Task schedule view (Closer and slightly lower)
      targetPos.current.set(0, 2, 12);
      targetLookAt.current.set(0, 0, 0);
    }
  }, [currentStep, phase]);

  useFrame(() => {
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos.current, 0.05);
    
    // Smoothly interpolate camera lookAt
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    
    // We don't use lerp for lookAt directly, but we can animate the target
    camera.lookAt(targetLookAt.current);
  });

  return (
    <group>
      {/* Base Lighting */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 20, 10]} intensity={2.5} />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#5DA7DB" />

      {phase === 0 && (
        <group>
          <group position={[0, 0, 0]}><StepLattice isActive={currentStep === 0} /></group>
          <group position={[0, 0, -22]}><StepOptimizer isActive={currentStep === 1} /></group>
          <group position={[0, 0, -44]}><StepExecution isActive={currentStep === 2} /></group>
          <group position={[0, 0, -66]}><StepPostProcess isActive={currentStep === 3} /></group>
        </group>
      )}

      {phase === 1 && (
        <TrafficScene trafficWeight={trafficWeight} />
      )}

      {phase === 2 && (
        <TaskScheduleScene currentStep={currentStep} />
      )}
    </group>
  );
}
