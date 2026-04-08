import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCat } from '../context/hooks'
import { useTypewriter } from '../hooks/useTypewriter'
import styles from './Landing.module.css'

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
export function Landing() {
    const navigate = useNavigate()
    const { setMode, setCatPosition, setQubitState, isAwake } = useCat()

    const [hoveredChoice, setHoveredChoice] = useState<'A' | 'B' | null>(null)
    const [dialoguePhase, setDialoguePhase] = useState(1)

    // On mount: configure cat for hero mode, centered
    useEffect(() => {
        setMode('hero')
        setCatPosition('center')
        setQubitState('idle')
    }, [setMode, setCatPosition, setQubitState])

    const phase1Text = "*Yawn*... Oh! An Observer? You caught me in a state of deep superposition. Or maybe just a fuzzy nap... both are equally valid until you clicked!"
    const phase2Text = "I'm Qubit, your guide to the weird, the tiny, and the 'both-at-once.' We call it Quantum, and it's the secret language of the universe. Want to learn how to break the 'on or off' rules of your boring old computer?"

    const { displayed: currentText, finished: textFinished, skip } = useTypewriter(
        dialoguePhase === 1 ? phase1Text : phase2Text,
        40,
        isAwake  // typewriter only runs after cat wakes up
    )

    const nextPhase = () => { setDialoguePhase(2); setHoveredChoice(null) }

    const handleBeginJourney = () => {
        setMode('npc')
        navigate('/learn')
    }

    const handleGoToPlayground = () => {
        setMode('npc')
        navigate('/playground')
    }

    return (
        <section
            className={styles.container}
            style={{ background: 'transparent', pointerEvents: 'none' }}
        >
            {/* All interactive elements need pointer-events: auto */}
            {isAwake && (
                <div className={styles.dialogueOverlay} style={{ pointerEvents: 'auto' }}>
                    <div 
                        className={styles.speechBubble} 
                        onClick={() => !textFinished && skip()}
                        style={{ cursor: textFinished ? 'default' : 'pointer' }}
                    >
                        <p className={styles.qubitName}>Qubit:</p>
                        <p className={styles.dialogueText}>
                            {currentText}
                            {!textFinished && <span className={styles.cursor}>_</span>}
                        </p>
                    </div>

                    {textFinished && (
                        <div className={styles.choices}>
                            {dialoguePhase === 1 ? (
                                <>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.blueChoice} ${styles.smallChoice}`}
                                        onMouseEnter={() => setHoveredChoice('A')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={nextPhase}
                                    >
                                        Okay?
                                    </button>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.amberChoice} ${styles.smallChoice}`}
                                        onMouseEnter={() => setHoveredChoice('B')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={nextPhase}
                                    >
                                        A cat?
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.blueChoice}`}
                                        onMouseEnter={() => setHoveredChoice('A')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={handleBeginJourney}
                                    >
                                        ✨ Begin Journey
                                    </button>
                                    <button
                                        className={`${styles.choiceBtn} ${styles.amberChoice}`}
                                        onMouseEnter={() => setHoveredChoice('B')}
                                        onMouseLeave={() => setHoveredChoice(null)}
                                        onClick={handleGoToPlayground}
                                    >
                                        🧪 Go to Playground
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Subtle hover effect on background lights driven by choice hover */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: hoveredChoice === 'A'
                    ? 'radial-gradient(ellipse at 30% 60%, rgba(93,167,219,0.06) 0%, transparent 70%)'
                    : hoveredChoice === 'B'
                        ? 'radial-gradient(ellipse at 70% 60%, rgba(196,149,90,0.06) 0%, transparent 70%)'
                        : 'transparent',
                transition: 'background 0.4s ease',
            }} />

            {/* CC Attribution for the 3D Koi Cat model */}
            <a
                href="https://sketchfab.com/3d-models/koi-cat-216615de5f91404a90ba0a721e13dd36"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'absolute', bottom: 16, right: 20,
                    pointerEvents: 'auto',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    color: 'rgba(248, 249, 255, 0.75)',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.01em',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(255,183,197,0.45)'
                    e.currentTarget.style.color = 'rgba(255,183,197,0.95)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.color = 'rgba(248, 249, 255, 0.75)'
                }}
            >
                🐱 "Koi Cat" by radiergummi · CC BY 4.0
            </a>
        </section>
    )
}
