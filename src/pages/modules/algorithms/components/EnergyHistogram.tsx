

interface EnergyState {
  bitstring: string;
  energy: number;
  probability: number;
}

interface EnergyHistogramProps {
  states: EnergyState[];
}

export function EnergyHistogram({ states }: EnergyHistogramProps) {
  // Sort by energy (ascending, since lower is better)
  const displayStates = [...states].sort((a, b) => a.energy - b.energy).slice(0, 10);
  const minEnergy = Math.min(...displayStates.map(s => s.energy));
  const maxProb = Math.max(...displayStates.map(s => s.probability));

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: 'Syne, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#5DA7DB',
        fontWeight: 800
      }}>
        <span>Energy Landscape (Top 10)</span>
        <span>Frequency %</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {displayStates.map((state, i) => {
          const isOptimal = state.energy === minEnergy;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.7rem',
                width: '60px',
                fontWeight: isOptimal ? 800 : 400,
                color: isOptimal ? '#C1E1C1' : 'rgba(248, 249, 255, 0.5)'
              }}>
                {state.bitstring}
              </div>

              <div style={{ 
                flex: 1, 
                height: '12px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                borderRadius: '4px', 
                position: 'relative' as const, 
                overflow: 'hidden' 
              }}>
                <div style={{
                  height: '100%',
                  width: `${(state.probability / maxProb) * 100}%`,
                  background: isOptimal ? 'linear-gradient(90deg, #C1E1C1, #5DA7DB)' : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  transition: 'width 1.5s cubic-bezier(0.23, 1, 0.32, 1)',
                  boxShadow: isOptimal ? '0 0 15px rgba(193, 225, 193, 0.2)' : 'none'
                }} />
              </div>

              <div style={{
                fontSize: '0.65rem',
                width: '70px',
                textAlign: 'right' as const,
                fontFamily: 'DM Mono, monospace'
              }}>
                <span style={{ color: isOptimal ? '#C1E1C1' : '#ff6464', fontWeight: 800 }}>
                  {state.energy.toFixed(0)} E
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '12px',
        fontSize: '0.7rem',
        color: 'rgba(248, 249, 255, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        lineHeight: 1.5
      }}>
        💡 <strong>Statistics Tip:</strong> The lowest energy (E={minEnergy.toFixed(0)}) is the <strong>Ground State</strong>. Quantum computers find this state more often than any other because it represents the path of least resistance.
      </div>
    </div>
  );
}
