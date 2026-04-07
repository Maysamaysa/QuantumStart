export type AlgoPhase = 
  | 'stage1_random' 
  | 'stage2_entanglement' 
  | 'stage3_deutsch' 
  | 'stage4_grover_scenario' 
  | string; 

export interface CircuitGate {
  id: string;
  type: string;
  qubit: number;
  slot: number;
}
