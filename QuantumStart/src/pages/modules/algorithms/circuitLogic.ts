export type GateType = 'H' | 'X' | 'Z' | 'CNOT' | 'Oracle_Constant' | 'Oracle_Balanced' | 'Measure'

export type CircuitOp = {
    gate: GateType
    target?: 0 | 1 // Which wire (0 or 1). CNOT implicitly uses 0 as control, 1 as target.
}

// Initial state |00> = [1, 0, 0, 0] (Vector format: 00, 01, 10, 11)
export const getInitialState = () => [1, 0, 0, 0]

const Math_SQRT1_2 = Math.SQRT1_2

// 1-Qubit Matrices
const I = [[1, 0], [0, 1]]
const H = [[Math_SQRT1_2, Math_SQRT1_2], [Math_SQRT1_2, -Math_SQRT1_2]]
const X = [[0, 1], [1, 0]]
const Z = [[1, 0], [0, -1]]

// Tensor product helper A ⊗ B
const tensorProduct = (A: number[][], B: number[][]) => {
    const res: number[][] = []
    for (let rA = 0; rA < A.length; rA++) {
        for (let rB = 0; rB < B.length; rB++) {
            const row: number[] = []
            for (let cA = 0; cA < A[0].length; cA++) {
                for (let cB = 0; cB < B[0].length; cB++) {
                    row.push(A[rA][cA] * B[rB][cB])
                }
            }
            res.push(row)
        }
    }
    return res
}

// 2-Qubit Matrices
const MAT_HI = tensorProduct(H, I) // H on Qubit 0
const MAT_IH = tensorProduct(I, H) // H on Qubit 1

const MAT_XI = tensorProduct(X, I)
const MAT_IX = tensorProduct(I, X)

const MAT_ZI = tensorProduct(Z, I)
const MAT_IZ = tensorProduct(I, Z)

const MAT_CNOT = [
    [1, 0, 0, 0], // |00> -> |00>
    [0, 1, 0, 0], // |01> -> |01>
    [0, 0, 0, 1], // |10> -> |11> (Control is Qubit 0, Target is Qubit 1)
    [0, 0, 1, 0]  // |11> -> |10>
]

// Constant Oracle: f(x) = 1 (Applies X to target Qubit 1)
const MAT_ORACLE_CONST = tensorProduct(I, X)

// Balanced Oracle: f(x) = x (Applies CNOT with Q0 as control, Q1 as target)
const MAT_ORACLE_BALANCED = MAT_CNOT

export const applyMatrix = (matrix: number[][], state: number[]) => {
    const nextState = [0, 0, 0, 0]
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            nextState[i] += matrix[i][j] * state[j]
        }
    }
    
    // Cleanup float point errors
    for (let i = 0; i < 4; i++) {
        if (Math.abs(nextState[i]) < 1e-10) nextState[i] = 0
    }
    return nextState
}

export const applyGate = (op: CircuitOp, state: number[]) => {
    if (op.gate === 'H') {
        if (op.target === 0) return applyMatrix(MAT_HI, state)
        if (op.target === 1) return applyMatrix(MAT_IH, state)
    }
    if (op.gate === 'X') {
        if (op.target === 0) return applyMatrix(MAT_XI, state)
        if (op.target === 1) return applyMatrix(MAT_IX, state)
    }
    if (op.gate === 'Z') {
        if (op.target === 0) return applyMatrix(MAT_ZI, state)
        if (op.target === 1) return applyMatrix(MAT_IZ, state)
    }
    if (op.gate === 'CNOT') {
        return applyMatrix(MAT_CNOT, state)
    }
    if (op.gate === 'Oracle_Constant') {
        return applyMatrix(MAT_ORACLE_CONST, state)
    }
    if (op.gate === 'Oracle_Balanced') {
        return applyMatrix(MAT_ORACLE_BALANCED, state)
    }
    return state
}

// Simulates full state from history
export const simulateCircuit = (steps: CircuitOp[]) => {
    let state = getInitialState()
    for (const step of steps) {
        if (step.gate !== 'Measure') {
            state = applyGate(step, state)
        }
    }
    return state
}
