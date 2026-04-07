import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgress } from '../context/hooks'
import { TRANSITION_CONFIG } from '../config/transitions'
import { MODULE_DATA } from '../config/modules'
import styles from './Profile.module.css'
import { useState } from 'react'

export function Profile() {
    const navigate = useNavigate()
    const { progress, badges, resetProgress, toggleDevMode, unlockBadge } = useProgress()
    const [qubitClicks, setQubitClicks] = useState(0)

    const TOTAL_MODULES = 7
    const MODULE_LIST = [
        { id: 'qubit', name: 'Qubit Basics' },
        { id: 'superposition', name: 'Superposition' },
        { id: 'bloch', name: 'Bloch Sphere' },
        { id: 'measurement', name: 'Measurement' },
        { id: 'entanglement', name: 'Entanglement' },
        { id: 'gates', name: 'Quantum Gates' },
        { id: 'algorithms', name: 'Algorithms' }
    ]

    const handleQubitClick = () => {
        if (progress.unlockedBadges.includes('qubit_equal')) return
        const newCount = qubitClicks + 1
        setQubitClicks(newCount)
        if (newCount >= 10) {
            unlockBadge('qubit_equal')
        }
    }

    const blueCount = Object.values(progress.completedTracks).filter(tracks => tracks.includes('blue')).length
    const amberCount = Object.values(progress.completedTracks).filter(tracks => tracks.includes('amber')).length

    const bluePercent = (blueCount / TOTAL_MODULES) * 100
    const amberPercent = (amberCount / TOTAL_MODULES) * 100

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
            resetProgress()
        }
    }

    return (
        <div className={styles.container}>
            <motion.header 
                className={styles.header}
                initial={{ opacity: 0, y: TRANSITION_CONFIG.header.yOffset }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    duration: TRANSITION_CONFIG.header.duration, 
                    delay: TRANSITION_CONFIG.header.delay, 
                    ease: TRANSITION_CONFIG.header.ease 
                }}
            >
                <div className={styles.titleSection}>
                    <h1>Observer Identity</h1>
                    <p>Tracking your quantum journey across the multiverse</p>
                </div>
                <button className={styles.backBtn} onClick={() => navigate('/learn')}>
                    ← Learn Hub
                </button>
            </motion.header>

            <main className={styles.mainGrid}>
                <div className={styles.statsPanel}>
                    <div className={styles.trackCard}>
                        <div className={styles.trackHeader}>
                            <h3>Quantum Mastery</h3>
                        </div>
                        
                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                                <span>Intuition Track</span>
                                <span>{blueCount}/{TOTAL_MODULES}</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={`${styles.progressFill} ${styles.blueFill}`} style={{ width: `${bluePercent}%` }} />
                            </div>
                        </div>

                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                                <span>Technical Track</span>
                                <span>{amberCount}/{TOTAL_MODULES}</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={`${styles.progressFill} ${styles.amberFill}`} style={{ width: `${amberPercent}%` }} />
                            </div>
                        </div>

                        <div className={styles.trackHeader} style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3>Secret Archive</h3>
                            <motion.span 
                                data-testid="secret-link"
                                className={styles.secretLink} 
                                onClick={handleQubitClick}
                                animate={qubitClicks > 0 && qubitClicks < 10 ? { x: [0, -2, 2, -2, 2, 0] } : {}}
                                transition={{ duration: 0.1, repeat: 2 }}
                                style={{ cursor: progress.unlockedBadges.includes('qubit_equal') ? 'default' : 'pointer' }}
                            >
                                {progress.unlockedBadges.includes('qubit_equal') 
                                    ? `Quantum Impact: ${(blueCount + amberCount) * 127 + 42}` 
                                    : qubitClicks > 0 ? `OBSERVING... (${10 - qubitClicks} left)` : 'Quantum Impact: SECRET' 
                                }
                            </motion.span>
                        </div>

                        <div className={styles.moduleBreakdown}>
                            <h4>Convergence Status</h4>
                            <div className={styles.moduleGrid}>
                                {MODULE_LIST.map(m => {
                                    const tracks = progress.completedTracks[m.id] || []
                                    const hasIntuition = tracks.includes('blue')
                                    const hasTechnical = tracks.includes('amber')
                                    
                                    const modConfig = MODULE_DATA.find(mod => mod.id === m.id)
                                    const supportsIntuition = !!modConfig?.blueLabel
                                    const supportsTechnical = !!modConfig?.amberLabel
                                    
                                    return (
                                        <div key={m.id} className={styles.moduleRow} data-testid={`module-row-${m.id}`}>
                                            <span className={styles.moduleName} data-testid={`module-name-${m.id}`}>{m.name}</span>
                                            <div className={styles.trackIndicators}>
                                                {supportsIntuition && supportsTechnical ? (
                                                    <>
                                                        <div className={`${styles.dot} ${hasIntuition ? styles.blueDot : styles.emptyDot}`} data-testid="intuition-dot" />
                                                        <div className={`${styles.dot} ${hasTechnical ? styles.amberDot : styles.emptyDot}`} data-testid="technical-dot" />
                                                    </>
                                                ) : (
                                                    <div 
                                                        className={`${styles.capsule} ${hasIntuition ? styles.mergedCapsule : styles.emptyCapsule}`} 
                                                        title="Unified Mastery" 
                                                        data-testid="quantum-capsule"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.terrarium}>
                    <h2 className={styles.terrariumTitle}>Quantum Terrarium</h2>
                    <div className={styles.badgeGrid}>
                        {badges.map(badge => {
                            const isUnlocked = progress.unlockedBadges.includes(badge.id)
                            const isSecret = badge.rarity === 'Secret' && !isUnlocked

                            return (
                                <div key={badge.id} className={styles.badgeItem}>
                                    <div className={`${styles.badgeIcon} ${isUnlocked ? styles.unlockedIcon : styles.lockedIcon} ${isUnlocked ? styles[badge.rarity.toLowerCase()] : ''}`}>
                                        {isSecret ? '?' : badge.emoji}
                                    </div>
                                    <div className={styles.tooltip}>
                                        <span className={styles.tooltipTitle}>{isSecret ? '???' : badge.name}</span>
                                        <span className={`${styles.tooltipRarity} ${styles[badge.rarity.toLowerCase() + 'Text']}`}>{badge.rarity}</span>
                                        <span className={styles.tooltipDesc}>{isSecret ? 'This achievement is hidden in the quantum noise.' : badge.description}</span>
                                        <span className={styles.tooltipCondition}>{isSecret ? 'Condition: ???' : `Condition: ${badge.unlockCondition}`}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>

            <div className={styles.resetZone}>
                <button className={styles.resetBtn} onClick={handleReset}>Reset Quantum State (Clear Progress)</button>
                {!import.meta.env.PROD && (
                    <button 
                        className={`${styles.resetBtn} ${progress.devMode ? styles.devModeActive : ''}`}
                        style={{ marginLeft: '16px' }}
                        onClick={toggleDevMode}
                    >
                        {progress.devMode ? 'Disable Dev Mode' : 'Enable Dev Mode (Unlock All)'}
                    </button>
                )}
            </div>
        </div>
    )
}
