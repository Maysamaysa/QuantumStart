import { useContext } from 'react'
import { ProgressContext } from './ProgressContext'
import { CatContext } from './CatContext'

export function useProgress() {
    const ctx = useContext(ProgressContext)
    if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>')
    return ctx
}

export function useCat() {
    const ctx = useContext(CatContext)
    if (!ctx) throw new Error('useCat must be used inside <CatProvider>')
    return ctx
}

export type { CatPosition, QubitState } from './types'
