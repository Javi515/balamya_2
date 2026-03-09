import React from 'react';
import cardStyles from '../../styles/Card.module.css';
import styles from '../../styles/HealthChart.module.css';

const HealthChart = ({ data }) => {
  if (!data) return null;
  const { healthy, inTreatment, quarantine, deceased } = data;

  // Total dinámico solo de las 4 tarjetas (sin contar Población Total)
  const total = healthy + inTreatment + quarantine + deceased;

  const safePercent = (val) => total > 0 ? (val / total) * 100 : 0;

  const pHealthy = safePercent(healthy);
  const pInTreatment = safePercent(inTreatment);
  const pQuarantine = safePercent(quarantine);
  const pDeceased = safePercent(deceased);

  const stop1 = pHealthy.toFixed(2);
  const stop2 = (pHealthy + pInTreatment).toFixed(2);
  const stop3 = (pHealthy + pInTreatment + pQuarantine).toFixed(2);

  // Colores: Emerald (Sanos), Blue (En Tratamiento), Amber (Cuarentena/Hospital), Rose (Fallecidos)
  const conicGradient = `conic-gradient(
    #10b981 0% ${stop1}%,
    #3b82f6 ${stop1}% ${stop2}%,
    #f59e0b ${stop2}% ${stop3}%,
    #ef4444 ${stop3}% 100%
  )`;

  return (
    <div className={`${cardStyles.card} ${styles['health-chart-card']}`}>
      <h3 className={styles['dashboard-section-title']}>Estado de Salud General</h3>
      <div className={styles['health-chart-container']}>
        <div className={styles['health-chart-wrapper']}>
          <div className={styles['health-chart']} style={{ background: conicGradient }}>
            <div className={styles['inner-circle']}>
              <span className={styles['inner-total']}>{total}</span>
              <span className={styles['inner-label']}>Total</span>
            </div>
          </div>
        </div>
        <div className={styles['health-chart-legend']}>
          <div className={styles['legend-item']}>
            <span className={`${styles['legend-color']} ${styles['healthy']}`}></span>
            <span className={styles['legend-text']}>Sanos <span className={styles['legend-perc']}>({Math.round(pHealthy)}%)</span></span>
          </div>
          <div className={styles['legend-item']}>
            <span className={`${styles['legend-color']} ${styles['in-treatment']}`}></span>
            <span className={styles['legend-text']}>Tratamiento <span className={styles['legend-perc']}>({Math.round(pInTreatment)}%)</span></span>
          </div>
          <div className={styles['legend-item']}>
            <span className={`${styles['legend-color']} ${styles['quarantine']}`}></span>
            <span className={styles['legend-text']}>Cuarentena/Hosp. <span className={styles['legend-perc']}>({Math.round(pQuarantine)}%)</span></span>
          </div>
          <div className={styles['legend-item']}>
            <span className={`${styles['legend-color']} ${styles['deceased']}`}></span>
            <span className={styles['legend-text']}>Fallecidos <span className={styles['legend-perc']}>({Math.round(pDeceased)}%)</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthChart;
