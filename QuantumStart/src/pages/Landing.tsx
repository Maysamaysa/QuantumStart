import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.title}>
                    Quantum<span className={styles.highlight}>Start</span>
                </h1>
                <p className={styles.subtitle}>
                    Your journey into the quantum realm begins here
                </p>
                <p className={styles.description}>
                    Explore quantum computing through interactive 3D visualizations,
                    hands-on circuit building, and step-by-step tutorials.
                </p>

                <div className={styles.buttons}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => navigate('/learn')}
                    >
                        <span className={styles.btnIcon}>🚀</span>
                        Let's Get Started
                    </button>

                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => navigate('/playground')}
                    >
                        <span className={styles.btnIcon}>⚡</span>
                        Go to Playground
                    </button>
                </div>

                <p className={styles.hint}>
                    Already familiar with quantum? Jump straight to the playground →
                </p>
            </div>

            <div className={styles.features}>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>📚</div>
                    <h3>Learn Theory</h3>
                    <p>Understand quantum principles with 3D visualizations</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🎮</div>
                    <h3>Build Circuits</h3>
                    <p>Drag and drop gates to create quantum algorithms</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🔬</div>
                    <h3>Experiment</h3>
                    <p>See real-time quantum state evolution</p>
                </div>
            </div>
        </div>
    );
}
