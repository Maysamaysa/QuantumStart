import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Profile } from '../Profile'
import { ProgressProvider } from '../../context/ProgressContext'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'

// Mock the framer-motion to simplify testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    span: ({ children, onClick, ...props }: any) => <span onClick={onClick} {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <ProgressProvider>
                {ui}
            </ProgressProvider>
        </BrowserRouter>
    )
}

describe('Profile Page Integration', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('renders the initial secret state', () => {
        renderWithProviders(<Profile />)
        const secretLink = screen.getByTestId('secret-link')
        expect(secretLink.textContent).toContain('SECRET')
    })

    it('unlocks the secret qubit counter after 10 clicks', async () => {
        renderWithProviders(<Profile />)
        const secretLink = screen.getByTestId('secret-link')

        // Click 10 times
        for (let i = 0; i < 10; i++) {
            await act(async () => {
                fireEvent.click(secretLink)
            })
        }

        // Verify it's now unlocked
        expect(secretLink.textContent).toMatch(/Quantum Impact: \d+/)
    })

    it('renders the Quantum Capsule for unified mastery modules', async () => {
        // Mock a completed Bloch Sphere (module ID 3)
        const completedProgress = {
            completedModules: ['bloch'],
            completedTracks: { 'bloch': ['blue', 'amber'] },
            unlockedBadges: [],
            lastPlayed: Date.now()
        }
        window.localStorage.setItem('quantum_start_progress_v1', JSON.stringify(completedProgress))

        renderWithProviders(<Profile />)

        // Find the Bloch Sphere row using test ID
        const blochRow = screen.getByTestId('module-row-bloch')
        expect(blochRow).toBeInTheDocument()
        
        // Assert that a capsule is rendered inside this row
        const capsule = blochRow.querySelector('[data-testid="quantum-capsule"]')
        expect(capsule).toBeInTheDocument()
    })
})
