export type AlgoPhase = 
  | 'stage1_concept_bridge' 
  | 'stage2_algo_library' 
  | 'stage3_circuit_builder' 
  | 'stage4_grover_scenario' 
  | 'stage5_simulation' 
  | 'stage6_solo_challenge' 
  | 'complete'

export interface CircuitGate {
  type: string;
  qubit: number;
  slot: number;
  id: string;
}

export interface AlgoState {
  stage: number;
  unlocked: number[];
  algorithmRead: string | null;
  circuit: {
    qubits: number;
    gates: CircuitGate[];
  };
  shots: number;
  lastResult: number[] | null;
  challengeDone: boolean;
  visitedStages: number[];
}
