import React, { useState } from 'react';

import StatGrid from '../components/StatGrid/StatGrid';
import HealthChart from '../components/HealthChart/HealthChart';
import PatientList from '../../patients/components/PatientList/PatientList';

import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const [dashboardData] = useState({
    totalPopulation: 150,
    healthy: 125,
    inTreatment: 15,
    quarantine: 10,
    deceased: 3
  });

  return (
    <div className={styles['dashboard-page']}>
      <div className={styles['dashboard-header']}>
        <h2 className={styles['dashboard-title']}>Control de la Colección Animal</h2>
        <p className={styles['dashboard-subtitle']}>Visión general y estado en tiempo real de los pacientes</p>
      </div>

      {/* Fila de Tarjetas Superiores */}
      <StatGrid data={dashboardData} />

      {/* Contenedor dividido: Gráfico a la izq, Lista a la der */}
      <div className={styles['dashboard-widgets']}>
        <div className={`${styles['widget-wrapper']} ${styles['chart-wrapper']}`}>
          <HealthChart data={dashboardData} />
        </div>
        <div className={`${styles['widget-wrapper']} ${styles['list-wrapper']}`}>
          <PatientList />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
