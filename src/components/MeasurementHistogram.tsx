import { useMemo } from 'react';
import styles from './MeasurementHistogram.module.css';

interface MeasurementHistogramProps {
  counts: Record<string, number>;
  totalShots: number;
}

export function MeasurementHistogram({ counts, totalShots }: MeasurementHistogramProps) {
  const data = useMemo(() => {
    return Object.entries(counts)
      .map(([bitstring, count]) => ({
        bitstring,
        count,
        percentage: (count / totalShots) * 100,
      }))
      .sort((a, b) => a.bitstring.localeCompare(b.bitstring));
  }, [counts, totalShots]);

  const maxCount = Math.max(...Object.values(counts), 1);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.histogram}>
      <div className={styles.header}>
        <span className={styles.title}>Results ({totalShots} shots)</span>
        <span className={styles.subtitle}>Frequency Distribution</span>
      </div>
      
      <div className={styles.barsContainer}>
        {data.map((item) => (
          <div key={item.bitstring} className={styles.barRow}>
            <div className={styles.label}>|{item.bitstring}⟩</div>
            <div className={styles.track}>
              <div 
                className={styles.fill} 
                style={{ 
                  width: `${(item.count / maxCount) * 100}%`,
                  opacity: 0.3 + (item.count / maxCount) * 0.7
                }}
              />
            </div>
            <div className={styles.info}>
              <span className={styles.count}>{item.count}</span>
              <span className={styles.pct}>{item.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        💡 <strong>Statistical Nature:</strong> Notice how the counts approximate the theoretical probabilities. This is the law of large numbers in action!
      </div>
    </div>
  );
}
