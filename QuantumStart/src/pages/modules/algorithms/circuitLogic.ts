export type GateType = 'H' | 'Oracle' | 'Amplifier' | 'Measure'

export type CircuitOp = {
    gate: GateType
    target?: number // 0 or 1 for single qubit gates, undefined for 2-qubit
}

// Initial state |00> = [1, 0, 0, 0]
export const getInitialState = () => [1, 0, 0, 0]

const Math_SQRT1_2 = Math.SQRT1_2

// H⊗H on 2-qubits
const H_TENSOR_H = [
    [0.5, 0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5, -0.5],
    [0.5, -0.5, -0.5, 0.5]
]

// H ⊗ I
const HI = [
    [Math_SQRT1_2, 0, Math_SQRT1_2, 0],
    [0, Math_SQRT1_2, 0, Math_SQRT1_2],
    [Math_SQRT1_2, 0, -Math_SQRT1_2, 0],
    [0, Math_SQRT1_2, 0, -Math_SQRT1_2]
]

// I ⊗ H
const IH = [
    [Math_SQRT1_2, Math_SQRT1_2, 0, 0],
    [Math_SQRT1_2, -Math_SQRT1_2, 0, 0],
    [0, 0, Math_SQRT1_2, Math_SQRT1_2],
    [0, 0, Math_SQRT1_2, -Math_SQRT1_2]
]

// Oracle flips the sign of the strictly assigned winning state
export const getOracleMatrix = (winningState: number) => {
    const mat = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    if (winningState >= 0 && winningState < 4) {
        mat[winningState][winningState] = -1
    }
    return mat
}

// Diffusion matrix: D = 2|s><s| - I
export const getDiffusionMatrix = () => {
    return [
        [-0.5, 0.5, 0.5, 0.5],
        [0.5, -0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5, 0.5],
        [0.5, 0.5, 0.5, -0.5]
    ]
}

export const applyMatrix = (matrix: number[][], state: number[]) => {
    const nextState = [0, 0, 0, 0]
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            nextState[i] += matrix[i][j] * state[j]
        }
    }
    return nextState
}

// Simulates the full state of the 2-qubit system
export const simulateCircuit = (steps: CircuitOp[], winningState: number) => {
    let state = getInitialState()
    
    for (const step of steps) {
        if (step.gate === 'Oracle') {
            state = applyMatrix(getOracleMatrix(winningState), state)
        } else if (step.gate === 'Amplifier') {
            state = applyMatrix(getDiffusionMatrix(), state)
        } else if (step.gate === 'H') {
            if (step.target === undefined) {
                state = applyMatrix(H_TENSOR_H, state)
            } else if (step.target === 0) {
                state = applyMatrix(HI, state)
            } else if (step.target === 1) {
                state = applyMatrix(IH, state)
            }
        }
    }
    
    // Cleanup any tiny floating point errors (e.g., getting 0.0000000000000001 instead of 0)
    for (let i = 0; i < 4; i++) {
        if (Math.abs(state[i]) < 1e-10) state[i] = 0
    }
    
    return state
}
