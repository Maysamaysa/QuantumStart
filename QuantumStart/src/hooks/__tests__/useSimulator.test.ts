import { renderHook, act } from '@testing-library/react'
import { useSimulator } from '../useSimulator'
import { describe, it, expect, vi } from 'vitest'
import type { Circuit } from '../../lib/circuit/types'

// Mock the core simulator logic to avoid complex matrix math in this hook test
vi.mock('../../lib/simulator/applyGate', () => ({
  getStateAfterStep: vi.fn((_circuit: Circuit, _qubitCount: number, stepIndex: number) => {
    // Return a simplified state mock for testing
    return {
      vector: [1, 0], // |0> state
      probabilities: [1, 0],
      stepIndex
    }
  })
}))

describe('useSimulator Hook', () => {
  const mockCircuit: Circuit = [
    { type: 'H', targets: [0] }
  ]

  it('initializes at step -1 (ideal state)', () => {
    const { result } = renderHook(() => useSimulator(mockCircuit, 1))
    expect(result.current.stepIndex).toBe(-1)
    expect(result.current.isAtStart).toBe(true)
    expect(result.current.canGoNext).toBe(true)
  })

  it('advances through steps with goNext', () => {
    const { result } = renderHook(() => useSimulator(mockCircuit, 1))
    
    act(() => {
      result.current.goNext()
    })

    expect(result.current.stepIndex).toBe(0)
    expect(result.current.isAtEnd).toBe(true)
    expect(result.current.canGoNext).toBe(false)
  })

  it('handles reset correctly', () => {
    const { result } = renderHook(() => useSimulator(mockCircuit, 1))
    
    act(() => {
      result.current.goNext()
      result.current.reset()
    })

    expect(result.current.stepIndex).toBe(-1)
    expect(result.current.isAtStart).toBe(true)
  })

  it('resets step index when circuit length changes', () => {
    const { result, rerender } = renderHook(
      ({ circuit }) => useSimulator(circuit, 1),
      { initialProps: { circuit: mockCircuit } }
    )

    act(() => {
      result.current.goNext()
    })
    expect(result.current.stepIndex).toBe(0)

    // Increase circuit length
    const newCircuit: Circuit = [
        { type: 'H', targets: [0] },
        { type: 'X', targets: [0] }
    ]
    rerender({ circuit: newCircuit })

    expect(result.current.stepIndex).toBe(-1)
  })
})
