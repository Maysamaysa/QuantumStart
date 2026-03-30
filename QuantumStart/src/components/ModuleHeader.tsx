/**
 * ModuleHeader.tsx — Shared 3-zone top bar for all module pages.
 *
 * Zones:
 *   LEFT   — "← Hub" back button
 *   CENTER — Module name pill (prominent)
 *   RIGHT  — Phase nav dots (optional, for multi-phase modules)
 *
 * Usage:
 *   <ModuleHeader moduleNumber={1} moduleName="What is a Qubit?" />
 *   <ModuleHeader moduleNumber={3} moduleName="The Bloch Sphere"
 *     phases={['Intro','Z-Axis','Equator','Phase','Axes','Sandbox','Quiz']}
 *     currentPhase={step - 1} />
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TRANSITION_CONFIG } from '../config/transitions'
import styles from './ModuleHeader.module.css'

interface ModuleHeaderProps {
    moduleNumber: number
    moduleName: string
    /** Optional list of phase labels for multi-phase modules */
    phases?: string[]
    /** Index of the active phase (0-based) */
    currentPhase?: number
    /** Callback when a phase dot is clicked (optional) */
    onPhaseChange?: (phaseIndex: number) => void
    /** Override back destination (default '/learn') */
    backTo?: string
}

export function ModuleHeader({
    moduleNumber,
    moduleName,
    phases,
    currentPhase = 0,
    onPhaseChange,
    backTo = '/learn',
}: ModuleHeaderProps) {
    const navigate = useNavigate()
    const hasPhases = phases && phases.length > 1

    return (
        <motion.div 
            className={styles.header}
            variants={{
                initial: { opacity: 0, y: TRANSITION_CONFIG.header.yOffset },
                animate: { opacity: 1, y: 0 }
            }}
            initial="initial"
            animate="animate"
            transition={{ 
                duration: TRANSITION_CONFIG.header.duration, 
                delay: TRANSITION_CONFIG.header.delay, 
                ease: TRANSITION_CONFIG.header.ease 
            }}
        >
            {/* LEFT — back button */}
            <button
                className={styles.backBtn}
                onClick={() => navigate(backTo)}
                id="module-back-btn"
                aria-label="Back to hub"
            >
                <span className={styles.backArrow}>←</span>
                <span className={styles.backLabel}>Hub</span>
            </button>
 
            {/* CENTER — module name */}
            <div className={styles.nameZone}>
                <span className={styles.moduleNum}>MODULE {moduleNumber}</span>
                <span className={styles.moduleName}>{moduleName}</span>
            </div>
 
            {/* RIGHT — phase nav (only for multi-phase modules) */}
            <div className={styles.phaseZone}>
                {hasPhases && (
                    <nav className={styles.phaseNav}>
                        {phases.map((label, i) => (
                            <button
                                key={i}
                                className={`${styles.phaseDot} ${i === currentPhase ? styles.phaseDotActive : i < currentPhase ? styles.phaseDotDone : ''}`}
                                onClick={() => onPhaseChange?.(i)}
                                title={label}
                                aria-label={`Phase ${i + 1}: ${label}`}
                                aria-current={i === currentPhase ? 'step' : undefined}
                            >
                                <span className={styles.phaseTooltip}>{label}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </motion.div>
    )
}
