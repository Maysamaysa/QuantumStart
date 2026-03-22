/**
 * useModuleCatSetup.ts — Shared hook to configure the global cat NPC
 * on mount for a module page.
 *
 * Usage:
 *   useModuleCatSetup('corner', 'idle')
 *   useModuleCatSetup('hidden', 'amber')
 */
import { useEffect } from 'react'
import { useCat } from '../context/CatContext'
import type { CatPosition, QubitState } from '../context/CatContext'

export function useModuleCatSetup(
    position: CatPosition,
    qubitState: QubitState = 'idle',
) {
    const { setMode, setCatPosition, setQubitState } = useCat()

    useEffect(() => {
        setMode('npc')
        setCatPosition(position)
        setQubitState(qubitState)
    }, [setMode, setCatPosition, setQubitState, position, qubitState])
}
