import { describe, it, expect } from 'vitest';
import { applySingleQubitGate, applyTwoQubitGate, applyGate, getStateAfterStep } from '../applyGate';
import { initialState, normSq } from '../stateVector';
import { gateMatrices, getCNOTMatrix } from '../gates';
import type { Gate, Circuit } from '../../circuit/types';

describe('Quantum Simulator Logic', () => {
  describe('applySingleQubitGate', () => {
    it('applies X gate correctly (NOT gate)', () => {
      // Start in |0>
      const state = initialState(1); // [ {re:1, im:0}, {re:0, im:0} ]
      const nextState = applySingleQubitGate(state, 1, 0, gateMatrices.X);
      
      // Should be |1>
      expect(nextState[0].re).toBe(0);
      expect(nextState[1].re).toBe(1);
    });

    it('applies H gate correctly (Hadamard)', () => {
      // Start in |0>
      const state = initialState(1);
      const nextState = applySingleQubitGate(state, 1, 0, gateMatrices.H);
      
      // Should be 1/sqrt(2) (|0> + |1>)
      expect(nextState[0].re).toBeCloseTo(0.7071, 4);
      expect(nextState[1].re).toBeCloseTo(0.7071, 4);
    });

    it('applies Z gate correctly (Phase flip)', () => {
      // Start in |+> (H applied to |0>)
      const state = applySingleQubitGate(initialState(1), 1, 0, gateMatrices.H);
      const nextState = applySingleQubitGate(state, 1, 0, gateMatrices.Z);
      
      // Should be |-> = 1/sqrt(2) (|0> - |1>)
      expect(nextState[0].re).toBeCloseTo(0.7071, 4);
      expect(nextState[1].re).toBeCloseTo(-0.7071, 4);
    });
  });

  describe('applyTwoQubitGate', () => {
    it('applies CNOT gate correctly', () => {
      // Start in |10> (qubit 1 is 1, qubit 0 is 0) -> control is qubit 1, target is qubit 0
      // In our LSB-first indexing: index 2 is |10>
      let state = initialState(2);
      state = applySingleQubitGate(state, 2, 1, gateMatrices.X); // Apply X to qubit 1 -> |10>
      
      const cnotMatrix = getCNOTMatrix();
      const nextState = applyTwoQubitGate(state, 2, 1, 0, cnotMatrix);
      
      // Should be |11> (index 3)
      expect(nextState[3].re).toBe(1);
      expect(nextState[2].re).toBe(0);
    });

    it('CNOT does nothing if control is |0>', () => {
        // Start in |01> (qubit 1 is 0, qubit 0 is 1)
        let state = initialState(2);
        state = applySingleQubitGate(state, 2, 0, gateMatrices.X); 
        
        const cnotMatrix = getCNOTMatrix();
        const nextState = applyTwoQubitGate(state, 2, 1, 0, cnotMatrix);
        
        // Should still be |01> (index 1)
        expect(nextState[1].re).toBe(1);
        expect(nextState[3].re).toBe(0);
      });
  });

  describe('applyMeasurement', () => {
    it('collapses a superposition state |+> to a basis state', () => {
      // Start in |+> = 1/sqrt(2)(|0> + |1>)
      let state = initialState(1);
      state = applySingleQubitGate(state, 1, 0, gateMatrices.H);
      
      // Measure qubit 0
      const collapsed = applyGate(state, 1, { type: 'Measure', targets: [0] }, 0);
      
      // Should be either |0> or |1>
      const prob0 = normSq(collapsed[0]);
      const prob1 = normSq(collapsed[1]);
      
      // One must be 1, the other 0
      expect(prob0 + prob1).toBeCloseTo(1, 10);
      expect([0, 1]).toContain(Math.round(prob0));
      expect([0, 1]).toContain(Math.round(prob1));
      expect(Math.round(prob0) + Math.round(prob1)).toBe(1);
    });

    it('is stable across multiple calls with the same gateIndex', () => {
        let state = initialState(1);
        state = applySingleQubitGate(state, 1, 0, gateMatrices.H);
        
        const gate = { type: 'Measure' as const, targets: [0] };
        const res1 = applyGate(state, 1, gate, 7);
        const res2 = applyGate(state, 1, gate, 7);
        
        expect(res1[0].re).toBe(res2[0].re);
        expect(res1[1].re).toBe(res2[1].re);
    });
  });

  describe('getStateAfterStep (System Integration)', () => {
    it('creates a Bell State correctly', () => {
      // Circuit: H(0), CNOT(0, 1)
      const circuit: Gate[] = [
        { type: 'H', targets: [0] },
        { type: 'CNOT', targets: [1], controls: [0] }
      ];
      
      const finalState = getStateAfterStep(circuit as Circuit, 2, 1);
      
      // Bell state: 1/sqrt(2) (|00> + |11>)
      // indices: 0 (|00>), 3 (|11>)
      expect(finalState[0].re).toBeCloseTo(0.7071, 4);
      expect(finalState[3].re).toBeCloseTo(0.7071, 4);
      expect(finalState[1].re).toBe(0);
      expect(finalState[2].re).toBe(0);
      
      // Total probability should be 1
      const totalProb = finalState.reduce((sum, amp) => sum + normSq(amp), 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });
  });
});
