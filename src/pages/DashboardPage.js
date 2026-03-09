import React, { useState } from 'react';

// IMPORTACIONES DE COMPONENTES
// Usamos "../" (un nivel) porque 'pages' y 'components' son vecinos en 'src'
import StatGrid from '../components/dashboard/StatGrid';
import HealthChart from '../components/dashboard/HealthChart';
import PatientList from '../components/dashboard/PatientList';

// IMPORTACIÓN DE ESTILOS DE LA PÁGINA
import styles from '../styles/DashboardPage.module.css';

const DashboardPage = () => {
  // --- SINGLE SOURCE OF TRUTH ---
  // En el futuro, estos datos provendrán de la API.
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