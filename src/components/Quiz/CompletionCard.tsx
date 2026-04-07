/**
 * CompletionCard.tsx — Unified module completion badge card
 *
 * Used by all modules for their "complete" phase.
 * Always offers both "Next Module" and "Return to Hub" buttons.
 */

import { useNavigate } from 'react-router-dom'
import styles from './Quiz.module.css'

export interface CompletionCardProps {
    emoji: string
    badgeName: string
    subtitle: string
    nextRoute?: string
    nextLabel?: string
    className?: string
}

export function CompletionCard({
    emoji,
    badgeName,
    subtitle,
    nextRoute,
    nextLabel = 'Next Module →',
    className,
}: CompletionCardProps) {
    const navigate = useNavigate()

    return (
        <div className={`${styles.completionCard} ${className || ''}`}>
            <div className={styles.badgeGlow}>{emoji}</div>
            <h2 className={styles.badgeName}>{badgeName}</h2>
            <p className={styles.badgeSubtitle}>{subtitle}</p>
            <div className={styles.completionBtns}>
                {nextRoute && (
                    <button
                        className={styles.primaryBtn}
                        onClick={() => navigate(nextRoute)}
                        id="completion-next-btn"
                    >
                        {nextLabel}
                    </button>
                )}
                <button
                    className={styles.secondaryBtn}
                    onClick={() => navigate('/learn')}
                    id="completion-hub-btn"
                >
                    Return to Learning Hub
                </button>
            </div>
        </div>
    )
}
