import { useState, useRef, useEffect, useMemo } from 'react';
import { simulateCircuit } from './circuitLogic';
import type { CircuitOp, GateType } from './circuitLogic';
import type { AlgoPhase } from './algoTypes';

export interface AlgorithmsChallengesProps {
  phase: AlgoPhase;
  onComplete: () => void;
}

const GATE_COLORS: Record<string, string> = {
  H: '#7F77DD',
  X: '#E8593C',
  Z: '#1D9E75',
  CNOT: '#5DCAA5',
  Oracle_Constant: '#E8593C',
  Oracle_Balanced: '#EF9F27',
  Measure: '#888888'
};

export function AlgorithmsChallenges({ phase, onComplete }: AlgorithmsChallengesProps) {
  const [circuit, setCircuit] = useState<CircuitOp[]>([]);
  const [msg, setMsg] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const challengeIdx = phase === 'stage4_grover_scenario' ? 2 : (phase.includes('entanglement') ? 1 : 0);
  const oracleType = useMemo(() => Math.random() > 0.5 ? 'Oracle_Constant' : 'Oracle_Balanced', [phase]);

  const challenges = useMemo(() => [
    { 
      title: "Task 1: The True Randomizer", 
      target: "50% |0\u27E9, 50% |1\u27E9", 
      desc: "Classical computers can only fake randomness. Build a 1-qubit circuit that achieves a perfectly random state, then measure it.",
      availableGates: ['H', 'Measure'],
      verify: (c: CircuitOp[]) => {
        if (c.length !== 2) return false;
        return c[0].gate === 'H' && c[1].gate === 'Measure';
      }
    },
    { 
      title: "Task 2: Quantum Telephone (Entanglement)", 
      target: "|00\u27E9 or |11\u27E9 instantly", 
      desc: "Create a Bell State where measuring Qubit 0 instantly forces Qubit 1 to match. Put Q0 in superposition, then connect them.",
      availableGates: ['H', 'CNOT', 'Measure'],
      verify: (c: CircuitOp[]) => {
        if (c.length < 3) return false;
        return c[0].gate === 'H' && c[1].gate === 'CNOT' && c[c.length-1].gate === 'Measure';
      }
    },
    { 
      title: "Task 3: Deutsch's Secret Box", 
      target: "Qubit 0 dictates the Oracle!", 
      desc: "The Oracle is a Black Box. Use Phase Kickback to find out in ONE try! Setup: X on Q1. Superpose both. Apply Oracle. Superpose Q0.",
      availableGates: ['X', 'H', 'Oracle', 'Measure'],
      verify: (c: CircuitOp[]) => {
        if (c.length < 5) return false;
        const hasOracle = c.some(op => op.gate.startsWith('Oracle'));
        const hasMeasure = c[c.length-1].gate === 'Measure';
        const hasX = c.some(op => op.gate === 'X' && op.target === 1);
        return hasOracle && hasMeasure && hasX;
      }
    }
  ], []);

  const chal = challenges[challengeIdx] || challenges[0];

  useEffect(() => {
    setCircuit([]);
    setMsg("Add gates to your circuit.");
  }, [phase]);

  const handleAddGate = (g: string) => {
    const lastOp = circuit.length > 0 ? circuit[circuit.length - 1] : null;
    if (lastOp?.gate === 'Measure') {
      setMsg("Already measured! Reset to try again.");
      return;
    }

    let newOp: CircuitOp = { gate: 'H', target: 0 };
    if (g === 'CNOT' || g === 'Measure') {
      newOp = { gate: g as GateType };
    } else if (g === 'Oracle') {
      newOp = { gate: oracleType as GateType };
    } else {
      if (g === 'X' && challengeIdx === 2) {
        newOp = { gate: g as GateType, target: 1 };
      } else if (g === 'H' && challengeIdx === 2) {
        const hCount = circuit.filter(c => c.gate === 'H').length;
        newOp = { gate: 'H', target: hCount === 1 ? 1 : 0 };
      } else {
        newOp = { gate: g as GateType, target: 0 };
      }
    }
    
    const newCircuit = [...circuit, newOp];
    setCircuit(newCircuit);

    if (newOp.gate === 'Measure') {
      if (chal.verify(newCircuit)) {
        if (challengeIdx === 2) {
          setMsg(`Correct! Your measurement proved the Oracle behavior!`);
        } else {
          setMsg("Perfect! You solved the challenge.");
        }
        setTimeout(onComplete, 3000);
      } else {
        setMsg("Close! But it didn't solve the task. Try another sequence.");
      }
    } else {
      setMsg(`Added ${g} gate.`);
    }
  };

  const reset = () => {
    setCircuit([]);
    setMsg("Circuit cleared.");
  };

  useEffect(() => {
    let req: number;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cy = h / 2;
      const isDual = challengeIdx > 0;
      const wireY0 = isDual ? cy - 30 : cy;
      const wireY1 = isDual ? cy + 30 : cy;
      const startX = 50;
      const endX = w - 50;

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(startX, wireY0); ctx.lineTo(endX, wireY0);
      if (isDual) { ctx.moveTo(startX, wireY1); ctx.lineTo(endX, wireY1); }
      ctx.stroke();

      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("|0\u27E9", 15, wireY0 + 4);
      if (isDual) ctx.fillText("|0\u27E9", 15, wireY1 + 4);

      let curX = startX + 40;
      circuit.forEach((op) => {
        const color = GATE_COLORS[op.gate] || '#fff';
        if (op.gate === 'CNOT') {
          ctx.fillStyle = color; ctx.beginPath(); ctx.arc(curX, wireY0, 4, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(curX, wireY1, 10, 0, Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(curX, wireY0); ctx.lineTo(curX, wireY1-10); ctx.stroke();
        } else if (op.gate === 'Measure') {
          ctx.fillStyle = '#444'; ctx.fillRect(curX-12, wireY0-12, 24, 24);
          if (isDual) ctx.fillRect(curX-12, wireY1-12, 24, 24);
        } else {
          const y = op.target === 1 ? wireY1 : wireY0;
          ctx.fillStyle = color; ctx.fillRect(curX-15, y-15, 30, 30);
          ctx.fillStyle = '#fff'; ctx.font = "bold 12px sans-serif"; ctx.textAlign = 'center'; ctx.fillText(op.gate[0], curX, y+5);
        }
        curX += 45;
      });

      if (circuit.some(c => c.gate === 'Measure')) {
        const state = simulateCircuit(circuit);
        ctx.fillStyle = '#5DCAA5'; ctx.textAlign = 'left';
        if (!isDual) {
          ctx.fillText(`P(0)=${(state[0]*state[0]*100).toFixed(0)}%`, endX + 5, wireY0);
        }
      }
      req = requestAnimationFrame(render);
    };
    req = requestAnimationFrame(render);
    return () => cancelAnimationFrame(req);
  }, [circuit, challengeIdx, oracleType]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '90%', maxWidth: '800px', background: '#111', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0, color: '#5DA7DB' }}>{chal.title}</h2>
          <p style={{ color: '#888', margin: '8px 0 0 0' }}>Target: {chal.target}</p>
        </div>
        
        <div style={{ height: '200px', background: '#000', position: 'relative' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{ padding: '20px', flex: 1 }}>
          <p style={{ lineHeight: '1.6' }}>{chal.desc}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
            {chal.availableGates.map(g => (
              <button key={g} onClick={() => handleAddGate(g)} style={{ padding: '8px 16px', background: '#222', border: '1px solid #444', color: '#fff', cursor: 'pointer', borderRadius: '4px' }}>{g}</button>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '12px', background: '#002', borderLeft: '4px solid #5DA7DB', color: '#5DA7DB' }}>{msg}</div>
        </div>

        <div style={{ padding: '16px', background: '#111', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={reset} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #444', color: '#888', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>
    </div>
  );
}
