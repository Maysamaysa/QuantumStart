import type { Circuit } from '../circuit/types';
import { initialState, getProbabilities } from './stateVector';
import { applyGate } from './applyGate';

/**
 * Runs the circuit multiple times to generate a statistical distribution of outcomes.
 * Each "shot" is a full simulation from the initial state to the final state,
 * with true randomness used for any measurement gates.
 */
export function runShots(
  circuit: Circuit,
  qubitCount: number,
  shotCount: number
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (let i = 0; i < shotCount; i++) {
    let state = initialState(qubitCount);
    
    // Run all gates in the circuit for this shot
    for (let k = 0; k < circuit.length; k++) {
      state = applyGate(state, qubitCount, circuit[k], k, true);
    }

    // Final measurement of all qubits (if not already measured)
    // In our simulator, we sample the final state vector probabilities
    const probs = getProbabilities(state);
    const r = Math.random();
    let cumulative = 0;
    let outcomeIndex = probs.length - 1;

    for (let j = 0; j < probs.length; j++) {
      cumulative += probs[j];
      if (r <= cumulative + 1e-10) {
        outcomeIndex = j;
        break;
      }
    }

    const bitstring = outcomeIndex.toString(2).padStart(qubitCount, '0');
    counts[bitstring] = (counts[bitstring] || 0) + 1;
  }

  return counts;
}
