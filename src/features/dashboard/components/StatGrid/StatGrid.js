import React from 'react';
import { FiUsers, FiCheckCircle, FiActivity, FiAlertCircle, FiMinus } from 'react-icons/fi';
import cardStyles from '../../../../styles/shared/Card.module.css';
import styles from './StatGrid.module.css';
import statCardStyles from './StatCard.module.css';

const StatCard = ({ title, value, subtitle, icon, accent }) => {
  return (
    <div className={`${cardStyles.card} ${statCardStyles['stat-card']}`} style={{ borderLeft: `3px solid ${accent}` }}>
      <div className={statCardStyles['stat-icon-wrapper']} style={{ color: accent }}>
        {icon}
      </div>
      <div className={statCardStyles['stat-card-info']}>
        <div className={statCardStyles['stat-card-header']}>
          <span className={statCardStyles['stat-card-value']}>{value}</span>
          {subtitle && <span className={statCardStyles['stat-card-subtitle']} style={{ color: accent }}>{subtitle}</span>}
        </div>
        <span className={statCardStyles['stat-card-title']}>{title}</span>
      </div>
    </div>
  );
};

const StatGrid = ({ data }) => {
  if (!data) return null;
  const { totalPopulation, healthy, inTreatment, quarantine, deceased } = data;

  const activeTotal = healthy + inTreatment + quarantine + deceased;
  const getPercentage = (value) => activeTotal > 0 ? Math.round((value / activeTotal) * 100) + '%' : '0%';

  return (
    <div className={styles['stat-grid']}>
      <StatCard
        title="Población Total"
        value={totalPopulation}
        accent="#3b5bdb"
        icon={<FiUsers size={22} />}
      />
      <StatCard
        title="Sanos"
        value={healthy}
        subtitle={getPercentage(healthy)}
        accent="#2f9e44"
        icon={<FiCheckCircle size={22} />}
      />
      <StatCard
        title="En Tratamiento"
        value={inTreatment}
        subtitle={getPercentage(inTreatment)}
        accent="#1971c2"
        icon={<FiActivity size={22} />}
      />
      <StatCard
        title="Cuarentena / Hospital"
        value={quarantine}
        subtitle={getPercentage(quarantine)}
        accent="#e67700"
        icon={<FiAlertCircle size={22} />}
      />
      <StatCard
        title="Fallecidos"
        value={deceased}
        subtitle={getPercentage(deceased)}
        accent="#c92a2a"
        icon={<FiMinus size={22} />}
      />
    </div>
  );
};

export default StatGrid;
