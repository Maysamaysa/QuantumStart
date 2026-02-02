import { useNavigate } from 'react-router-dom';
import styles from './Learn.module.css';

export function Learn() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => navigate('/')}
                >
                    ← Back to Home
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.placeholder}>
                    <div className={styles.icon}>🌌</div>
                    <h1 className={styles.title}>3D Quantum Learning Experience</h1>
                    <p className={styles.description}>
                        Coming Soon: Interactive 3D visualizations to help you understand
                        quantum computing from theory to practice
                    </p>

                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <span className={styles.emoji}>🎯</span>
                            <span>Quantum Theory Fundamentals</span>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.emoji}>🔮</span>
                            <span>3D Bloch Sphere Visualization</span>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.emoji}>⚛️</span>
                            <span>Interactive State Evolution</span>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.emoji}>💻</span>
                            <span>From Concepts to Quantum Programming</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.playgroundBtn}
                        onClick={() => navigate('/playground')}
                    >
                        Try the Playground Instead →
                    </button>
                </div>
            </div>
        </div>
    );
}
