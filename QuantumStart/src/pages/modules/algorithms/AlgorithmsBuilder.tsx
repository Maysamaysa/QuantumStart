import { useState } from 'react'
import { type GateType, type CircuitOp } from './circuitLogic'
import styles from './AlgorithmsOverlay.module.css'

interface AlgorithmsBuilderProps {
    onRunCircuit: (steps: CircuitOp[]) => void
}

export function AlgorithmsBuilder({ onRunCircuit }: AlgorithmsBuilderProps) {
    // 3 layers max. Each layer can hold either:
    // a wide gate ('Oracle' or 'Amplifier')
    // or two single gates ('H' on q0, 'H' on q1)
    
    // We represent the grid as a 2D array: 2 rows (q0, q1) x 3 columns (layers)
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

        if (gate === 'Oracle' || gate === 'Amplifier') {
            // Wide gates span both rows
            newGrid[0][col] = gate
            newGrid[1][col] = gate
        } else {
            // Single gates just snap to the specific row
            newGrid[row][col] = gate
        }
        
        setGrid(newGrid)
    }

    const clearSlot = (row: number, col: number) => {
        const newGrid = [...grid.map(r => [...r])]
        const gate = grid[row][col]
        if (gate === 'Oracle' || gate === 'Amplifier') {
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
            
            if (topGate === 'Oracle' || topGate === 'Amplifier') {
                steps.push({ gate: topGate })
            } else {
                // Not a wide gate
                if (topGate === 'H' && botGate === 'H') {
                    // Optimized step: H on both
                    steps.push({ gate: 'H' }) 
                } else {
                    if (topGate === 'H') steps.push({ gate: 'H', target: 0 })
                    if (botGate === 'H') steps.push({ gate: 'H', target: 1 })
                }
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
                {/* toolbox */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, 'H')}
                        style={{ padding: '10px', background: '#eab308', color: 'black', fontWeight: 'bold', borderRadius: '4px', cursor: 'grab', textAlign: 'center' }}
                    >
                        [ H ]
                    </div>
                    <div 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, 'Oracle')}
                        style={{ padding: '10px', background: '#ec4899', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'grab', textAlign: 'center' }}
                    >
                        [ Oracle ]
                    </div>
                    <div 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, 'Amplifier')}
                        style={{ padding: '10px', background: '#3b82f6', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'grab', textAlign: 'center' }}
                    >
                        [ Amplifier ]
                    </div>
                </div>

                {/* Circuit Grid */}
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
                                        background: grid[0][col] === 'H' ? '#eab308' : (grid[0][col] ? '#ec4899' : 'transparent'),
                                        color: grid[0][col] === 'H' ? 'black' : 'white', fontWeight: 'bold',
                                        cursor: grid[0][col] ? 'pointer' : 'default',
                                        borderBottom: (grid[0][col] === 'Oracle' || grid[0][col] === 'Amplifier') ? 'none' : undefined,
                                        borderBottomLeftRadius: (grid[0][col] === 'Oracle' || grid[0][col] === 'Amplifier') ? 0 : undefined,
                                        borderBottomRightRadius: (grid[0][col] === 'Oracle' || grid[0][col] === 'Amplifier') ? 0 : undefined,
                                    }}
                                >
                                    {grid[0][col] === 'H' ? 'H' : ''}
                                    {grid[0][col] === 'Oracle' ? 'Oracle' : ''}
                                    {grid[0][col] === 'Amplifier' ? 'Amp' : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#fff' }}>q1</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[0, 1, 2].map(col => (
                                <div 
                                    key={`1-${col}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, 1, col)}
                                    onClick={() => clearSlot(1, col)}
                                    style={{ 
                                        width: '80px', height: '60px', 
                                        border: grid[1][col] ? 'none' : '2px dashed #555', 
                                        borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: grid[1][col] === 'H' ? '#eab308' : (grid[1][col] === 'Oracle' ? '#ec4899' : (grid[1][col] === 'Amplifier' ? '#3b82f6' : 'transparent')),
                                        color: grid[1][col] === 'H' ? 'black' : 'white', fontWeight: 'bold',
                                        cursor: grid[1][col] ? 'pointer' : 'default',
                                        borderTop: (grid[1][col] === 'Oracle' || grid[1][col] === 'Amplifier') ? 'none' : undefined,
                                        borderTopLeftRadius: (grid[1][col] === 'Oracle' || grid[1][col] === 'Amplifier') ? 0 : undefined,
                                        borderTopRightRadius: (grid[1][col] === 'Oracle' || grid[1][col] === 'Amplifier') ? 0 : undefined,
                                    }}
                                >
                                    {grid[1][col] === 'H' ? 'H' : ''}
                                    {/* The wide gates show their name in the center visually across the two using border tricks, but text is fine in both or just bottom */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button 
                className={styles.actionBtn} 
                style={{ marginTop: '20px', width: '100%' }}
                onClick={() => onRunCircuit(parseGridToSteps())}
            >
                Run Circuit
            </button>
        </div>
    )
}
