import { render, screen, act } from '@testing-library/react'
import { ProgressProvider, useProgress } from '../ProgressContext'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

const TestConsumer = () => {
    const { progress, completeModule } = useProgress()
    return (
        <div>
            <div data-testid="modules-count">{progress.completedModules.length}</div>
            <div data-testid="tracks-bloch">{JSON.stringify(progress.completedTracks['bloch'] || [])}</div>
            <div data-testid="badges-count">{progress.unlockedBadges.length}</div>
            <button onClick={() => completeModule('qubit', 'blue')}>Complete Qubit Blue</button>
            <button onClick={() => completeModule('bloch')}>Complete Bloch Shortcut</button>
        </div>
    )
}

describe('ProgressContext Logic', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('initializes with empty progress', () => {
        render(
            <ProgressProvider>
                <TestConsumer />
            </ProgressProvider>
        )
        expect(screen.getByTestId('modules-count').textContent).toBe('0')
        expect(screen.getByTestId('badges-count').textContent).toBe('0')
    })

    it('handles manual track completion (Qubit)', async () => {
        render(
            <ProgressProvider>
                <TestConsumer />
            </ProgressProvider>
        )
        const btn = screen.getByText('Complete Qubit Blue')
        await act(async () => {
            btn.click()
        })
        expect(screen.getByTestId('modules-count').textContent).toBe('1')
    })

    it('applies Quantum Shortcut for higher modules (Bloch)', async () => {
        render(
            <ProgressProvider>
                <TestConsumer />
            </ProgressProvider>
        )
        const btn = screen.getByText('Complete Bloch Shortcut')
        await act(async () => {
            btn.click()
        })
        const tracksStr = screen.getByTestId('tracks-bloch').textContent || '[]'
        const tracks = JSON.parse(tracksStr)
        expect(tracks).toContain('blue')
        expect(tracks).toContain('amber')
    })
})
