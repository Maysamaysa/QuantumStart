import { type Badge } from '../config/badges'

// ─── PROGRESS TYPES ──────────────────────────────────────────────────────────
export interface ProgressData {
    completedModules: string[]
    completedTracks: Record<string, ('blue' | 'amber')[]>
    unlockedBadges: string[]
    lastPlayed: number
    devMode?: boolean
}

export interface ProgressContextValue {
    progress: ProgressData
    badges: Badge[]
    completeModule: (moduleId: string, track?: 'blue' | 'amber', perfectScore?: boolean) => void
    unlockBadge: (badgeId: string) => void
    isModuleLocked: (moduleId: string) => boolean
    resetProgress: () => void
    toggleDevMode: () => void
}

// ─── CAT TYPES ───────────────────────────────────────────────────────────────
export type QubitState = 'idle' | 'blue' | 'amber'
export type CatMode = 'hero' | 'npc'
export type CatPosition = 'center' | 'corner' | 'hidden'

export interface CatContextValue {
    mode: CatMode
    qubitState: QubitState
    catPosition: CatPosition
    isAwake: boolean
    setMode: (m: CatMode) => void
    setQubitState: (q: QubitState) => void
    setCatPosition: (p: CatPosition) => void
    setAwake: (a: boolean) => void
}
