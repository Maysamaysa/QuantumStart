// Simplified 3-qubit statevector simulator
export interface CircuitGate {
  id: string;
  type: string;
  qubit: number;
  slot: number;
}

export function applyH(state: number[], targetQubit: number, nQubits: number) {
  const dim = Math.pow(2, nQubits);
  const newState = new Array(dim).fill(0);
  const inv = 1 / Math.sqrt(2);
  
  for (let i = 0; i < dim; i++) {
    const bit = (i >> (nQubits - 1 - targetQubit)) & 1;
    const partner = i ^ (1 << (nQubits - 1 - targetQubit));
    
    if (bit === 0) {
      newState[i] += inv * state[i];
      newState[partner] += inv * state[i];
    } else {
      newState[partner] += inv * state[i];
      newState[i] += -inv * state[i];
    }
  }
  return newState;
}

export function simulate(circuitGates: CircuitGate[], nQubits: number = 3) {
  const dim = Math.pow(2, nQubits);
  const startState = new Array(dim).fill(0);
  startState[0] = 1; // Start in |000>
  let state = startState;

  // Sort gates by slot
  const sorted = [...circuitGates].sort((a, b) => a.slot - b.slot);

  for (const gate of sorted) {
    if (gate.type === 'H') {
      state = applyH(state, gate.qubit, nQubits);
    } else if (gate.type === 'Oracle') {
      // Phase flip |101> = index 5 (for Grover Search scenario)
      state[5] *= -1;
    } else if (gate.type === 'Diffusion') {
      // 2|s><s| - I where |s> is the uniform superposition
      const mean = state.reduce((a, b) => a + b, 0) / dim;
      state = state.map(a => 2 * mean - a);
    } else if (gate.type === 'X') {
      const newState = new Array(dim).fill(0);
      for (let i = 0; i < dim; i++) {
        const partner = i ^ (1 << (nQubits - 1 - gate.qubit));
        newState[partner] = state[i];
      }
      state = newState;
    }
  }

  return state.map(a => Math.pow(a, 2)); // Return probabilities
}
