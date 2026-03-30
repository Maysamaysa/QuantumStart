import React, { useState, useEffect } from 'react';
import styles from '../AlgorithmsOverlay.module.css';
import { AlgoCard } from '../components/AlgoCard';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AlgoLibraryProps {
  onComplete: () => void;
}

export const AlgoLibrary: React.FC<AlgoLibraryProps> = ({ onComplete }) => {
  const [expandedAny, setExpandedAny] = useState(false);
  const [timerReady, setTimerReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimerReady(true), 30000); // 30s as per prompt
    return () => clearTimeout(timer);
  }, []);

  const handleExpand = () => setExpandedAny(true);

  return (
    <div className={styles.stageWrapper} style={{ flexDirection: 'column', padding: '100px 40px 40px' }}>
      <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>Algorithm Library</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '1200px' 
      }}>
        {/* Card 1: Deutsch-Jozsa */}
        <AlgoCard 
          title="Deutsch-Jozsa"
          tagline="Is the function constant or balanced?"
          difficulty={1}
          onExpand={handleExpand}
          circuitPreview={
            <svg width="200" height="60" style={{ stroke: 'var(--blue-0)', fill: 'none' }}>
              <line x1="10" y1="30" x2="190" y2="30" strokeWidth="1" />
              <rect x="30" y="15" width="20" height="30" fill="var(--blue-0)" rx="4" />
              <text x="35" y="35" fill="#fff" fontSize="12" style={{ stroke: 'none' }}>H</text>
              <rect x="70" y="10" width="60" height="40" stroke="var(--lotus)" rx="4" />
              <text x="80" y="35" fill="var(--lotus)" fontSize="10" style={{ stroke: 'none' }}>Oracle</text>
              <rect x="150" y="15" width="20" height="30" fill="var(--blue-0)" rx="4" />
              <text x="155" y="35" fill="#fff" fontSize="12" style={{ stroke: 'none' }}>H</text>
            </svg>
          }
          expandedContent={
            <div>
              <p style={{ marginBottom: '16px' }}><strong>Problem:</strong> Is a hidden function <em>f(x)</em> constant (all 0s/1s) or balanced (half 0s, half 1s)?</p>
              <p style={{ marginBottom: '16px' }}><strong>Insight:</strong> Through phase kickback, quantum interference reveals the global structure of the function in just one query.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={styles.btnPrimary} style={{ fontSize: '12px', padding: '8px 16px' }}>Try Constant</button>
                <button className={styles.btnPrimary} style={{ fontSize: '12px', padding: '8px 16px' }}>Try Balanced</button>
              </div>
            </div>
          }
        />

        {/* Card 2: Grover Search */}
        <AlgoCard 
          title="Grover Search"
          tagline="Find the needle in a quantum haystack"
          difficulty={2}
          onExpand={handleExpand}
          circuitPreview={
            <svg width="200" height="60" style={{ stroke: 'var(--blue-0)', fill: 'none' }}>
              <line x1="10" y1="20" x2="190" y2="20" strokeWidth="1" />
              <line x1="10" y1="40" x2="190" y2="40" strokeWidth="1" />
              <rect x="50" y="15" width="40" height="30" stroke="var(--lotus)" rx="4" />
              <rect x="100" y="15" width="40" height="30" stroke="var(--glass-border)" rx="4" />
              <text x="55" y="35" fill="var(--lotus)" fontSize="10" style={{ stroke: 'none' }}>Oracle</text>
              <text x="105" y="35" fill="var(--glass-border)" fontSize="10" style={{ stroke: 'none' }}>Diff.</text>
            </svg>
          }
          expandedContent={<GroverDemo />}
        />

        {/* Card 3: QFT */}
        <AlgoCard 
          title="Quantum Fourier Transform"
          tagline="Frequency domain, quantum style"
          difficulty={2}
          onExpand={handleExpand}
          circuitPreview={
            <svg width="200" height="60" style={{ stroke: 'var(--blue-0)', fill: 'none' }}>
              <line x1="10" y1="20" x2="190" y2="20" strokeWidth="1" />
              <line x1="10" y1="40" x2="190" y2="40" strokeWidth="1" />
              <circle cx="40" cy="20" r="8" fill="var(--blue-0)" />
              <circle cx="80" cy="40" r="8" fill="var(--blue-0)" />
              <path d="M40 20 L40 40 M80 20 L80 40" stroke="var(--blue-0)" />
            </svg>
          }
          expandedContent={
            <div>
              <p style={{ marginBottom: '12px' }}><strong>Problem:</strong> Extract periodicity from a sequence. QFT is exponentially faster than classical FFT.</p>
              <p style={{ marginBottom: '16px' }}><strong>Insight:</strong> Maps computational basis to frequency basis using Hadamard and controlled-phase rotations.</p>
              <div style={{ height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--blue-0)' }}>[ Waveform Visualization ]</span>
              </div>
            </div>
          }
        />

        {/* Card 4: Shor's Algorithm */}
        <AlgoCard 
          title="Shor's Algorithm"
          tagline="The one that breaks RSA"
          difficulty={3}
          onExpand={handleExpand}
          circuitPreview={
            <svg width="200" height="60" style={{ stroke: 'var(--lotus)', fill: 'none' }}>
              <rect x="20" y="15" width="70" height="30" rx="4" stroke="var(--blue-0)" />
              <rect x="110" y="15" width="70" height="30" rx="4" stroke="var(--lotus)" />
              <text x="30" y="35" fill="var(--blue-0)" fontSize="8" style={{ stroke: 'none' }}>Period Find</text>
              <text x="120" y="35" fill="var(--lotus)" fontSize="8" style={{ stroke: 'none' }}>Factors</text>
            </svg>
          }
          expandedContent={
            <div>
              <p style={{ marginBottom: '12px' }}><strong>Problem:</strong> Factoring large integers. RSA security relies on this being hard classically.</p>
              <p style={{ marginBottom: '16px' }}><strong>Insight:</strong> Converts factoring into a period-finding problem, solved via QFT.</p>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Try factoring 15: choose random <em>a=2</em>, find period <em>r=4</em>, result: 3 and 5.
              </div>
            </div>
          }
        />
      </div>

      {expandedAny && timerReady && (
        <button 
          className={`${styles.btn} ${styles.btnPrimary} ${styles.fadeIn}`}
          onClick={onComplete}
          style={{ marginTop: '40px' }}
        >
          Build your first circuit →
        </button>
      )}
    </div>
  );
};

// --- Sub-components for expanded demos ---

const GroverDemo = () => {
  const [iter, setIter] = useState(0);
  const data = [
    [12, 12, 12, 12, 12, 12, 12, 12], // Iter 0
    [5, 5, 5, 5, 5, 65, 5, 5],        // Iter 1
    [1, 1, 1, 1, 1, 93, 1, 1],        // Iter 2
  ][Math.min(iter, 2)];

  return (
    <div>
      <p style={{ marginBottom: '12px' }}><strong>Insight:</strong> Flips target phase, then reflects all around the mean to amplify amplitude.</p>
      <div style={{ height: '140px', marginBottom: '16px' }}>
        <Bar 
          data={{
            labels: ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'],
            datasets: [{
              label: 'Amplitude %',
              data: data,
              backgroundColor: data.map(v => v > 50 ? '#FFB7C5' : '#5DA7DB'),
              borderRadius: 4
            }]
          }}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { display: false, max: 100 }, x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } } } }
          }}
        />
      </div>
      <button 
        className={styles.btnPrimary} 
        style={{ fontSize: '12px', padding: '6px 16px' }}
        onClick={() => setIter(i => (i + 1) % 4)}
      >
        Run Iteration {iter + 1}
      </button>
    </div>
  );
};
