import React from 'react';
import { FaPlus, FaStethoscope, FaUsers } from 'react-icons/fa';
import styles from '../../pages/TreatmentsPage/TreatmentsPage.module.css';

const TreatmentsHero = ({ isGroupTab, onCreateRecord, onSelectTab }) => (
    <section className={styles.hero}>
        <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>Tratamientos</h1>
            <p className={styles.heroText}>
                {isGroupTab
                    ? 'Administra tratamientos para lotes o grupos completos con acceso directo al formato grupal.'
                    : 'Un tablero propio para monitoreo clinico, prioridades diarias y acceso rapido a historial, revision y alta sin depender de estilos compartidos con otros modulos.'}
            </p>
            <div className={styles.heroActions}>
                <button className={styles.primaryButton} onClick={onCreateRecord}>
                    <FaPlus /> {isGroupTab ? 'Nuevo tratamiento grupal' : 'Nuevo tratamiento'}
                </button>
            </div>
        </div>

        <aside className={styles.heroPanel}>
            <div className={styles.heroPanelHeader}>
                <span className={styles.heroPanelEyebrow}>Exploracion clinica</span>
                <h2 className={styles.heroPanelTitle}>
                    {isGroupTab ? 'Vista grupal activa' : 'Vista individual activa'}
                </h2>
                <p className={styles.heroPanelText}>
                    {isGroupTab
                        ? 'Cambia entre grupos, busca integrantes y abre el formato grupal desde el mismo panel.'
                        : 'Busca ejemplares, abre su historial clinico y continua con revision o alta sin salir del modulo.'}
                </p>
            </div>

            <div className={styles.tabRow}>
                <button
                    className={`${styles.tabButton} ${!isGroupTab ? styles.tabButtonActive : ''}`}
                    onClick={() => onSelectTab('individual')}
                >
                    <FaStethoscope /> Tratamiento individual
                </button>
                <button
                    className={`${styles.tabButton} ${isGroupTab ? styles.tabButtonActive : ''}`}
                    onClick={() => onSelectTab('group')}
                >
                    <FaUsers /> Tratamiento grupal
                </button>
            </div>
        </aside>
    </section>
);

export default TreatmentsHero;
