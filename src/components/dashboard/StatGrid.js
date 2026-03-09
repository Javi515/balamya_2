import React from 'react';
import cardStyles from '../../styles/Card.module.css';
import styles from '../../styles/StatGrid.module.css';
import statCardStyles from '../../styles/StatCard.module.css';

const StatCard = ({ title, value, subtitle, icon, iconType = "default" }) => {
  return (
    <div className={`${cardStyles.card} ${statCardStyles['stat-card']}`}>
      <div className={`${statCardStyles['stat-icon-wrapper']} ${statCardStyles[`type-${iconType}`]}`}>
        {icon}
      </div>
      <div className={statCardStyles['stat-card-info']}>
        <div className={statCardStyles['stat-card-header']}>
          <span className={statCardStyles['stat-card-value']}>{value}</span>
          {subtitle && <span className={statCardStyles['stat-card-subtitle']}>{subtitle}</span>}
        </div>
        <span className={statCardStyles['stat-card-title']}>{title}</span>
      </div>
    </div>
  );
};

const StatGrid = ({ data }) => {
  if (!data) return null;
  const { totalPopulation, healthy, inTreatment, quarantine, deceased } = data;

  // Excluimos Población Total para sacar el porcentaje correcto de las 4 subcategorías
  const activeTotal = healthy + inTreatment + quarantine + deceased;
  const getPercentage = (value) => activeTotal > 0 ? Math.round((value / activeTotal) * 100) + '%' : '0%';

  return (
    <div className={styles['stat-grid']}>
      <StatCard
        title="Población Total"
        value={totalPopulation}
        iconType="primary"
        icon='🐾'
      />
      <StatCard
        title="Sanos"
        value={healthy}
        subtitle={getPercentage(healthy)}
        iconType="success"
        icon='💓'
      />
      <StatCard
        title="En Tratamiento"
        value={inTreatment}
        subtitle={getPercentage(inTreatment)}
        iconType="info"
        icon='🩺'
      />
      <StatCard
        title={"Cuarentena/\nHospital"}
        value={quarantine}
        subtitle={getPercentage(quarantine)}
        iconType="warning"
        icon='⚠️'
      />
      <StatCard
        title="Fallecidos"
        value={deceased}
        subtitle={getPercentage(deceased)}
        iconType="danger"
        icon='🕊️'
      />
    </div>
  );
};

export default StatGrid;
