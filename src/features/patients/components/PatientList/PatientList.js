import React from 'react';
import cardStyles from '../../../../styles/shared/Card.module.css';
import styles from './PatientList.module.css';
import rowStyles from './PatientRow.module.css';
import { getRecentPatients } from '../../../../services/patientsService';

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
  const patients = getRecentPatients();

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
            {patients.map((patient) => (
              <PatientRow key={patient.id} patient={patient} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
