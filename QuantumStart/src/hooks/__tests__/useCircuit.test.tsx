import { renderHook, act } from '@testing-library/react'
import { useCircuit } from '../useCircuit'
import { describe, it, expect } from 'vitest'

describe('useCircuit Hook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useCircuit())
    expect(result.current.qubitCount).toBe(2)
    expect(result.current.circuit).toEqual([])
  })

  it('adds a single-qubit gate', () => {
    const { result } = renderHook(() => useCircuit({ initialQubitCount: 2 }))
    
    act(() => {
      result.current.addGate({ type: 'H', targets: [0] })
    })

    expect(result.current.circuit.length).toBe(1)
    expect(result.current.circuit[0].type).toBe('H')
    expect(result.current.circuit[0].targets).toEqual([0])
  })

  it('prevents adding gates with invalid qubit indices', () => {
    const { result } = renderHook(() => useCircuit({ initialQubitCount: 1 }))
    
    act(() => {
      result.current.addGate({ type: 'H', targets: [1] }) // Qubit 1 doesn't exist
    })

    expect(result.current.circuit.length).toBe(0)
  })

  it('removes a gate correctly', () => {
    const { result } = renderHook(() => useCircuit({ initialQubitCount: 2 }))
    
    act(() => {
        result.current.addGate({ type: 'H', targets: [0] })
        result.current.addGate({ type: 'X', targets: [1] })
    })

    expect(result.current.circuit.length).toBe(2)

    act(() => {
        result.current.removeGate(0)
    })

    expect(result.current.circuit.length).toBe(1)
    expect(result.current.circuit[0].type).toBe('X')
  })

  it('moves a gate correctly', () => {
    const { result } = renderHook(() => useCircuit({ initialQubitCount: 2 }))
    
    act(() => {
        result.current.addGate({ type: 'H', targets: [0] })
        result.current.addGate({ type: 'X', targets: [1] })
    })

    act(() => {
        result.current.moveGate(0, 1) // Move' H' to end
    })

    expect(result.current.circuit[0].type).toBe('X')
    expect(result.current.circuit[1].type).toBe('H')
  })

  it('prunes gates when qubit count decreases', () => {
    const { result } = renderHook(() => useCircuit({ initialQubitCount: 3 }))
    
    act(() => {
        result.current.addGate({ type: 'H', targets: [0] })
        result.current.addGate({ type: 'X', targets: [2] }) // Depends on qubit 2
    })

    act(() => {
        result.current.setQubitCount(2) // Qubit 2 removed
    })

    expect(result.current.circuit.length).toBe(1)
    expect(result.current.circuit[0].type).toBe('H')
  })
})
