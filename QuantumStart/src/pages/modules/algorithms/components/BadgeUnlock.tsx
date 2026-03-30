import { useState, useEffect, useRef } from 'react';
import styles from '../AlgorithmsOverlay.module.css';
import { ModuleCanvas } from '../../../../components/ModuleCanvas';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BadgeUnlockProps {
  onFinish: () => void;
}

export function BadgeUnlock({ onFinish }: BadgeUnlockProps) {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBadge(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.stageWrapper} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <ModuleCanvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ParticleBurst />
        </ModuleCanvas>
      </div>

      {showBadge && (
        <div className={`${styles.glass} ${styles.fadeIn}`} style={{ 
          width: '100%', maxWidth: '440px', textAlign: 'center', padding: '40px',
          zIndex: 10, position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div className="cat-box" style={{ 
            width: '120px', height: '100px', border: '2px solid var(--glass-border)',
            borderRadius: '16px', position: 'relative', marginBottom: '24px',
            boxShadow: '0 0 30px rgba(255, 183, 197, 0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div className="cat-silhouette" style={{ 
              width: '50px', height: '50px', background: 'var(--muted)',
              clipPath: 'polygon(30% 100%, 70% 100%, 70% 50%, 85% 20%, 70% 35%, 60% 20%, 40% 20%, 30% 35%, 15% 20%, 30% 50%)',
              marginTop: '15px'
            }} />
            <div style={{ fontSize: '10px', color: 'var(--lotus)', marginTop: '8px', fontWeight: 'bold' }}>alive? dead?</div>
          </div>

          <h1 style={{ fontSize: '28px', color: '#fff', marginBottom: '8px' }}>✦ Quantum Algorithm Architect ✦</h1>
          <p style={{ fontSize: '18px', color: 'var(--blue-0)', fontWeight: 'bold', marginBottom: '16px' }}>Module 7 Complete</p>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
            You can find the needle in a quantum haystack.
          </p>

          <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px', textAlign: 'left' }}>Algorithms mastered:</p>
            {['Deutsch-Jozsa', 'Grover Search', 'QFT', 'Shor\u0027s'].map(a => (
              <div key={a} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>{a}</span>
                <span style={{ color: 'var(--blue-0)' }}>●</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button className={styles.btnPrimary} style={{ flex: 1, padding: '12px' }} onClick={() => {}}>Share</button>
            <button className={styles.btnLotus} style={{ flex: 1, padding: '12px' }} onClick={onFinish}>Complete Module</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ParticleBurst() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 400;
  
  const [particles] = useState(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        
        const v = new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        );
        velocities.push(v);
        
        const color = new THREE.Color(Math.random() > 0.5 ? '#FFB7C5' : '#5DA7DB');
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    return { positions, colors, velocities };
  });

  useFrame((_state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const v = particles.velocities[i];
      posAttr.setX(i, posAttr.getX(i) + v.x * delta * 60);
      posAttr.setY(i, posAttr.getY(i) + v.y * delta * 60);
      posAttr.setZ(i, posAttr.getZ(i) + v.z * delta * 60);
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          args={[particles.positions, 3]}
        />
        <bufferAttribute 
          attach="attributes-color" 
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} />
    </points>
  );
}
