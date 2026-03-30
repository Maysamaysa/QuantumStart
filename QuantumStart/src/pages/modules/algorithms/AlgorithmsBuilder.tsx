import React, { useState } from 'react'
import { type GateType, type CircuitOp } from './circuitLogic'
import styles from './AlgorithmsOverlay.module.css'

interface AlgorithmsBuilderProps {
    onRunCircuit: (steps: CircuitOp[]) => void
}

export function AlgorithmsBuilder({ onRunCircuit }: AlgorithmsBuilderProps) {
    // 3 layers max. Each layer can hold either:
    // a wide gate ('Oracle_Constant' or 'Oracle_Balanced')
    // or two single gates ('H' on q0, 'H' on q1)
    
    const [grid, setGrid] = useState<(GateType | null)[][]>([
        [null, null, null],
        [null, null, null]
    ])

    const handleDragStart = (e: React.DragEvent, gate: GateType) => {
        e.dataTransfer.setData('gateType', gate)
    }

    const handleDrop = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault()
        const gate = e.dataTransfer.getData('gateType') as GateType
        if (!gate) return

        const newGrid = [...grid.map(r => [...r])]

        if (gate === 'Oracle_Constant' || gate === 'Oracle_Balanced') {
            newGrid[0][col] = gate
            newGrid[1][col] = gate
        } else {
            newGrid[row][col] = gate
        }
        
        setGrid(newGrid)
    }

    const clearSlot = (row: number, col: number) => {
        const newGrid = [...grid.map(r => [...r])]
        const gate = grid[row][col]
        if (gate === 'Oracle_Constant' || gate === 'Oracle_Balanced') {
            newGrid[0][col] = null
            newGrid[1][col] = null
        } else {
            newGrid[row][col] = null
        }
        setGrid(newGrid)
    }

    const parseGridToSteps = (): CircuitOp[] => {
        const steps: CircuitOp[] = []
        for (let col = 0; col < 3; col++) {
            const topGate = grid[0][col]
            const botGate = grid[1][col]
            
            if (topGate === 'Oracle_Constant' || topGate === 'Oracle_Balanced') {
                steps.push({ gate: topGate })
            } else {
                if (topGate === 'H' || topGate === 'X' || topGate === 'Z') steps.push({ gate: topGate, target: 0 })
                if (botGate === 'H' || botGate === 'X' || botGate === 'Z') steps.push({ gate: botGate, target: 1 })
            }
        }
        return steps
    }

    return (
        <div style={{ background: 'rgba(20, 20, 30, 0.9)', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Circuit Builder</h2>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '20px' }}>
                Drag gates onto the grid. Try to find the right order to get it right in 1 shot!
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(['H', 'X', 'Oracle_Constant', 'Oracle_Balanced'] as GateType[]).map(gt => (
                         <div 
                         key={gt}
                         draggable 
                         onDragStart={(e) => handleDragStart(e, gt)}
                         style={{ padding: '10px', background: '#3b82f6', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'grab', textAlign: 'center' }}
                     >
                         [ {gt} ]
                     </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#fff' }}>q0</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[0, 1, 2].map(col => (
                                <div 
                                    key={`0-${col}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, 0, col)}
                                    onClick={() => clearSlot(0, col)}
                                    style={{ 
                                        width: '80px', height: '60px', 
                                        border: grid[0][col] ? 'none' : '2px dashed #555', 
                                        borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: grid[0][col] ? '#ec4899' : 'transparent',
                                        color: 'white', fontWeight: 'bold',
                                        cursor: grid[0][col] ? 'pointer' : 'default',
                                    }}
                                >
                                    {grid[0][col] || ''}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button 
                className={styles.btnPrimary} 
                style={{ marginTop: '20px', width: '100%', padding: '12px' }}
                onClick={() => onRunCircuit(parseGridToSteps())}
            >
                Run Circuit
            </button>
        </div>
    )
}
