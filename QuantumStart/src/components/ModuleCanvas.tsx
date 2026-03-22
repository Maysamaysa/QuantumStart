/**
 * ModuleCanvas.tsx — Shared Canvas wrapper for all module pages.
 * Provides consistent Canvas defaults and wraps children in Suspense.
 */
import { Suspense, type ReactNode, type CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'
import type { ToneMapping } from 'three'

interface CameraOverride {
    position?: [number, number, number]
    fov?: number
}

interface GlOverride {
    antialias?: boolean
    alpha?: boolean
    powerPreference?: 'default' | 'high-performance' | 'low-power'
    toneMapping?: ToneMapping
    toneMappingExposure?: number
}

interface ModuleCanvasProps {
    children: ReactNode
    /** Override the default camera. Defaults to position [0,0,11], fov 55. */
    camera?: CameraOverride
    /** Override default gl options. Merged with defaults. */
    gl?: GlOverride
    /** Additional style for the canvas element. */
    style?: CSSProperties
}

const DEFAULT_CAMERA: CameraOverride = { position: [0, 0, 11], fov: 55 }
const DEFAULT_GL: GlOverride = {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
}

export function ModuleCanvas({ children, camera, gl, style }: ModuleCanvasProps) {
    const mergedCamera = { ...DEFAULT_CAMERA, ...camera }
    const mergedGl = { ...DEFAULT_GL, ...gl }

    return (
        <Canvas
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                ...style,
            }}
            camera={mergedCamera}
            gl={mergedGl}
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                {children}
            </Suspense>
        </Canvas>
    )
}
