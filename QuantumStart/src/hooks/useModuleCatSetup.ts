/**
 * useModuleCatSetup.ts — Shared hook to configure the global cat NPC
 * on mount for a module page.
 *
 * Usage:
 *   useModuleCatSetup('corner', 'idle')   // cat visible in corner
 *   useModuleCatSetup('hidden', 'amber')  // cat hidden during module
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
        // No cleanup here — the next page (Learn) is responsible for
        // setting its own cat state when it mounts. Cleaning up here
        // caused a race where the module's cleanup overwrote Learn's mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
