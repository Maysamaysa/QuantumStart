import { useState, useEffect } from 'react';
import styles from '../AlgorithmsOverlay.module.css';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LogarithmicScale,
} from 'chart.js';
import type { CircuitGate } from '../algoTypes';
import { simulate } from '../utils/quantumSim';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LogarithmicScale
);

interface MetricCardProps {
  title: string;
  value: string;
  sub: string;
}

function MetricCard({ title, value, sub }: MetricCardProps) {
  return (
    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--blue-0)', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--lotus)' }}>{sub}</div>
    </div>
  );
}

interface SimulationZoneProps {
  gates: CircuitGate[];
  onComplete: () => void;
}

export function SimulationZone({ gates, onComplete }: SimulationZoneProps) {
  const [phase, setPhase] = useState<'animating' | 'results'>('animating');
  const [activeTab, setActiveTab] = useState<'histogram' | 'insight' | 'comparison'>('histogram');
  const [shots, setShots] = useState(512);

  const rawProbs = simulate(gates, 3);
  const noisyProbs = rawProbs.map(p => {
    const noise = (Math.random() - 0.5) * (50 / shots);
    return Math.max(0, Math.min(100, (p + noise) * 100));
  });

  useEffect(() => {
    const timer = setTimeout(() => setPhase('results'), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (phase === 'animating') {
    return (
      <div className={styles.stageWrapper} style={{ flexDirection: 'column' }}>
        <h2 className={styles.fadeIn}>Running Quantum Simulation...</h2>
        <p style={{ color: 'var(--muted)', marginTop: '12px' }}>Measuring states across 3 qubits</p>
        <div style={{ marginTop: '40px', width: '300px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div className={styles.progressBar} style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  const histogramData = {
    labels: [
      '|000\u27E9', '|001\u27E9', '|010\u27E9', '|011\u27E9', 
      '|100\u27E9', '|101\u27E9', '|110\u27E9', '|111\u27E9'
    ],
    datasets: [{
      data: noisyProbs,
      backgroundColor: noisyProbs.map((_, i) => i === 5 ? 'var(--blue-0)' : 'rgba(83, 74, 183, 0.4)'),
      borderRadius: 6
    }]
  };

  const comparisonData = {
    labels: ['8', '64', '256', '1024', '4096'],
    datasets: [
      { label: 'Classical O(N)', data: [4, 32, 128, 512, 2048], borderColor: 'var(--muted)', tension: 0.1 },
      { label: 'Quantum O(\u221AN)', data: [2, 8, 16, 32, 64], borderColor: 'var(--blue-0)', tension: 0.1 }
    ]
  };

  return (
    <div className={styles.stageWrapper} style={{ flexDirection: 'column' }}>
      <div className={styles.glass} style={{ width: '100%', maxWidth: '900px', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
          {(['histogram', 'insight', 'comparison'] as const).map((tab) => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '16px 32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                color: activeTab === tab ? 'var(--blue-0)' : 'var(--muted)',
                borderBottom: activeTab === tab ? '2px solid var(--blue-0)' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, padding: '0 20px' }}>
          {activeTab === 'histogram' && (
            <div className={styles.fadeIn}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px' }}>Probability Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                  <span>Shots: {shots}</span>
                  <input type="range" min="64" max="1024" step="64" value={shots} onChange={(e) => setShots(parseInt(e.target.value))} />
                </div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <Bar 
                  data={histogramData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                      y: { ticks: { color: 'rgba(255,255,255,0.5)' } },
                      x: { ticks: { color: 'rgba(255,255,255,0.5)' } }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'insight' && (
            <div className={styles.fadeIn} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <MetricCard title="Measured State" value="|101\u27E9" sub="\u2713 Target found" />
              <MetricCard title="Success Rate" value="89%" sub="Optimal" />
              <MetricCard title="Iterations used" value="2" sub="\u221AN for N=8" />
              <div style={{ gridColumn: 'span 3', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', marginTop: '20px' }}>
                <p style={{ lineHeight: '1.6', color: 'var(--text)' }}>
                  <strong>Why it worked:</strong>{" "}
                  The Oracle gate flipped the phase of |101\u27E9, making it negative. 
                  The Diffusion operator then reflected all amplitudes around their average.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className={styles.fadeIn}>
              <h3 style={{ marginBottom: '24px' }}>Efficiency Scaling</h3>
              <div style={{ height: '240px' }}>
                <Line 
                  data={comparisonData}
                  options={{
                    maintainAspectRatio: false,
                    scales: { y: { type: 'logarithmic' } },
                    plugins: { legend: { labels: { color: '#fff' } } }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={onComplete}
          style={{ margin: '32px auto', width: '100%', maxWidth: '300px', justifyContent: 'center' }}
        >
          Final Challenge \u2192
        </button>
      </div>
    </div>
  );
}
