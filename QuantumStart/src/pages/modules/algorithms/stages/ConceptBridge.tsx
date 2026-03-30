import { useState, useEffect, useMemo } from 'react';
import styles from '../AlgorithmsOverlay.module.css';
import { BlochSphereScene } from '../components/BlochSphereScene';
import { ModuleCanvas } from '../../../../components/ModuleCanvas';

interface ConceptBridgeProps {
  onComplete: () => void;
}

export function ConceptBridge({ onComplete }: ConceptBridgeProps) {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [showReady, setShowReady] = useState(false);
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);

  const sections = [
    {
      id: 1,
      title: 'What is a qubit?',
      content: 'Unlike a classical bit stuck at 0 or 1, a qubit lives in superposition — both at once, with a probability amplitude for each.'
    },
    {
      id: 2,
      title: 'What is a quantum gate?',
      content: 'Gates rotate the qubit\u0027s state on the Bloch sphere. H puts it on the equator. X flips it. CNOT entangles two qubits.'
    },
    {
      id: 3,
      title: 'What is a circuit?',
      content: 'A sequence of gates applied to qubits over time, read left to right. Measurement collapses the state to a classical 0 or 1.'
    }
  ];

  const handleSectionClick = (id: number) => {
    setOpenSection(openSection === id ? null : id);
    if (!visited.has(id)) {
      const newVisited = new Set(visited).add(id);
      setVisited(newVisited);
      if (newVisited.size === 3) setShowReady(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowReady(true), 90000); // 90s fallback
    return () => clearTimeout(timer);
  }, []);

  const vector = useMemo((): [number, number, number] => [
    Math.sin(theta) * Math.cos(phi),
    Math.cos(theta),
    Math.sin(theta) * Math.sin(phi)
  ], [theta, phi]);

  return (
    <div className={styles.stageWrapper}>
      <div className={styles.splitLayout} style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* Left Panel - Recap */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10 }}>
          <div className={styles.glass} style={{ maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '32px' }}>Quantum Recap</h2>
            {sections.map((section) => (
              <div 
                key={section.id} 
                className={styles.accordion}
                style={{ 
                  marginBottom: '16px', 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: '12px'
                }}
              >
                <div 
                  onClick={() => handleSectionClick(section.id)}
                  style={{ 
                    cursor: 'pointer', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}
                >
                  {section.title}
                  <span>{openSection === section.id ? '\u2212' : '+'}</span>
                </div>
                {openSection === section.id && (
                  <div className={styles.fadeIn} style={{ fontSize: '16px', color: 'var(--muted)', marginTop: '8px', lineHeight: '1.6' }}>
                    {section.content}
                  </div>
                )}
              </div>
            ))}
            
            {showReady && (
              <button 
                className={`${styles.btn} ${styles.btnLotus} ${styles.fadeIn}`}
                style={{ marginTop: '32px', width: '100%', justifyContent: 'center' }}
                onClick={onComplete}
              >
                I\u0027m ready \u2192
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Bloch Sphere */}
        <div style={{ flex: 1.5, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <ModuleCanvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <BlochSphereScene vector={vector} label="|ψ\u27E9" />
            </ModuleCanvas>
          </div>

          {/* Sliders Overlay */}
          <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '80%', zIndex: 20 }}>
            <div className={styles.glass} style={{ padding: '16px 32px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>Theta (\u03B8): {theta.toFixed(2)}</span>
                  <span>{theta > 0.78 && theta < 2.35 ? 'Superposition zone' : ''}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max={Math.PI} step="0.01" 
                  value={theta} 
                  onChange={(e) => setTheta(parseFloat(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--blue-0)' }}
                />
              </div>
              <div>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}>Phi (\u03C6): {phi.toFixed(2)}</div>
                <input 
                  type="range" 
                  min="0" max={Math.PI * 2} step="0.01" 
                  value={phi} 
                  onChange={(e) => setPhi(parseFloat(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--blue-0)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
