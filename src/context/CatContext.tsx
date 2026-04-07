import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useProgress } from './hooks'
import { type CatMode, type QubitState, type CatPosition, type CatContextValue } from './types'

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
export const CatContext = createContext<CatContextValue | null>(null)

export function CatProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<CatMode>('hero')
    const [qubitState, setQubitState] = useState<QubitState>('idle')
    const [catPosition, setCatPosition] = useState<CatPosition>('center')
    const [isAwake, setAwake] = useState(false)

    const handleSetMode = useCallback((m: CatMode) => setMode(m), [])
    const handleSetQubit = useCallback((q: QubitState) => setQubitState(q), [])
    const handleSetPosition = useCallback((p: CatPosition) => setCatPosition(p), [])
    const handleSetAwake = useCallback((a: boolean) => setAwake(a), [])

    const { unlockBadge } = useProgress()

    // ─── SECRET: CAT SLEEP BADGE ─────────────────────────────────────────────
    useEffect(() => {
        // Only track if cat is asleep
        if (isAwake) return;

        // 3 minutes (180,000 ms) of uninterrupted sleep
        const timer = setTimeout(() => {
            unlockBadge('catZ')
        }, 180000)

        // Reset timer if cat wakes up or component unmounts
        return () => clearTimeout(timer)
    }, [isAwake, unlockBadge])

    return (
        <CatContext.Provider value={{
            mode,
            qubitState,
            catPosition,
            isAwake,
            setMode: handleSetMode,
            setQubitState: handleSetQubit,
            setCatPosition: handleSetPosition,
            setAwake: handleSetAwake,
        }}>
            {children}
        </CatContext.Provider>
    )
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
