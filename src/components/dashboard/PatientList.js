import React from 'react';
import cardStyles from '../../styles/Card.module.css';
import { patients } from '../../data/mockData';
import styles from '../../styles/PatientList.module.css';
import rowStyles from '../../styles/PatientRow.module.css';

const PatientRow = ({ patient }) => {
  return (
    <tr className={rowStyles['patient-row']}>
      <td>{patient.id}</td>
      <td>{patient.species}</td>
      <td>{patient.breed}</td>
      <td>{patient.age}</td>
    </tr>
  );
};

const PatientList = () => {
  return (
    <div className={`${cardStyles.card} ${styles['patient-list-card']}`}>
      <h3 className={styles['dashboard-section-title']}>Pacientes Recientes</h3>
      <div className={styles['table-responsive-container']}>
        <table className={styles['patient-list-table']}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Especie</th>
              <th>Raza</th>
              <th>Edad</th>
            </tr>
          </thead>
          <tbody>
            {patients.slice(0, 5).map((patient) => (
              <PatientRow key={patient.id} patient={patient} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
