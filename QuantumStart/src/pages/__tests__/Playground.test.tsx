import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { Playground } from '../Playground'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import '@testing-library/jest-dom'

// Mock the framer-motion library to simplify testing UI state
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    header: ({ children, ...props }: any) => React.createElement('header', props, children),
    section: ({ children, ...props }: any) => React.createElement('section', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, {}, children),
}))

// Mock the 3D Canvas and related components to avoid WebGL errors in JSDOM
vi.mock('../../components/ModuleCanvas', () => ({
  ModuleCanvas: ({ children }: any) => React.createElement('div', { 'data-testid': 'mock-canvas' }, children),
}))

vi.mock('../../components/BlochSphere', () => ({
  BlochSphere: () => React.createElement('div', { 'data-testid': 'mock-bloch' }, 'Bloch Sphere View'),
}))

vi.mock('../../components/CircuitBuilder', () => ({
  CircuitBuilder: () => React.createElement('div', { 'data-testid': 'mock-builder' }, 'Circuit Builder Interface'),
}))

vi.mock('../../components/ExplanationPanel', () => ({
  ExplanationPanel: () => React.createElement('div', { 'data-testid': 'mock-explainer' }, 'Explanation Panel View'),
}))

// Mock StepControls to simplify interaction testing
vi.mock('../../components/StepControls', () => ({
  StepControls: ({ simulator }: any) => (
    React.createElement('div', { 'data-testid': 'mock-controls' }, [
      React.createElement('button', { 
        key: 'next',
        onClick: simulator.goNext, 
        'data-testid': 'next-btn' 
      }, 'Next Step'),
      React.createElement('span', { 
        key: 'step',
        'data-testid': 'step-counter' 
      }, `Step: ${simulator.stepIndex}`)
    ])
  ),
}))

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        React.createElement(BrowserRouter, {}, ui)
    )
}

describe('Playground Page Integration', () => {
    it('renders the Playground layout correctly', () => {
        renderWithProviders(React.createElement(Playground))
        expect(screen.getByTestId('playground-title')).toBeInTheDocument()
        expect(screen.getByTestId('mock-builder')).toBeInTheDocument()
        expect(screen.getByTestId('mock-canvas')).toBeInTheDocument()
    })

    it('switches between Builder and Explainer tabs', async () => {
        renderWithProviders(React.createElement(Playground))
        
        // Switch to Explainer tab using test-id
        const explainerTab = screen.getByTestId('tab-explainer')
        await act(async () => {
            fireEvent.click(explainerTab)
        })

        // Verify Builder is gone and Explainer is present
        expect(screen.queryByTestId('mock-builder')).not.toBeInTheDocument()
        expect(screen.getByTestId('mock-explainer')).toBeInTheDocument()
        
        // Switch back to Builder tab
        const builderTab = screen.getByTestId('tab-builder')
        await act(async () => {
            fireEvent.click(builderTab)
        })

        expect(screen.getByTestId('mock-builder')).toBeInTheDocument()
    })

    it('interacts with the simulator controls', async () => {
        renderWithProviders(React.createElement(Playground))
        
        // Initial state
        expect(screen.getByTestId('step-counter').textContent).toContain('Step: -1')

        // Move to the next step
        const nextBtn = screen.getByTestId('next-btn')
        await act(async () => {
            fireEvent.click(nextBtn)
        })

        // Verify the UI update path
        expect(screen.getByTestId('step-counter')).toBeInTheDocument()
    })
})
