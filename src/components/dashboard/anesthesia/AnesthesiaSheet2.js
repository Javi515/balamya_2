import React from 'react';
import styles from '../../../styles/AnesthesiaForm.module.css';

const AnesthesiaSheet2 = ({
    monitoringRows,
    addMonitoringRow,
    removeMonitoringRow
}) => {
    return (
        <div className={styles['form-page']} id="anesthesia-hoja2">
            {/* Monitorización */}
            <div className={`${styles['form-section']} form-section`}>
                <h4 className={styles['section-title']}>Monitorización</h4>
                <table className={styles['anesthesia-table']}>
                    <thead>
                        <tr>
                            <th>HORA</th>
                            <th>F.C.</th>
                            <th>F.R.</th>
                            <th>T.LLC./SEG.</th>
                            <th>T (°C)</th>
                            <th>SAT. O₂ (%)</th>
                            <th>OBSERVACIONES</th>
                            <th className={`${styles['action-col']} `}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {monitoringRows.map((row) => (
                            <tr key={row.id} className={styles['protocol-row']}>
                                <td><input type="time" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={`${styles['table-input']} ${styles['wide']}`} /></td>
                                <td className={`${styles['action-col']} `}>
                                    <button
                                        className={styles['delete-row-btn']}
                                        onClick={() => removeMonitoringRow(row.id)}
                                        title="Eliminar fila"
                                    >
                                        -
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={`${styles['add-row-container']} `}>
                    <button className={styles['add-row-btn']} onClick={addMonitoringRow}>
                        + Agregar Fila
                    </button>
                </div>
            </div>

            {/* Toma de muestras */}
            <div className={`${styles['form-section']} form-section`}>
                <h4 className={styles['section-title']}>Toma de muestras y pruebas de diagnóstico</h4>
                <table className={styles['anesthesia-table']}>
                    <thead>
                        <tr>
                            <th>SANGRE</th>
                            <th>HECES</th>
                            <th>PIEL/PELO</th>
                            <th>ORINA</th>
                            <th>LCR</th>
                            <th>PARÁSITOS</th>
                            <th>RX</th>
                            <th>ENDOSCOPÍA</th>
                            <th>US</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                            <td><input type="checkbox" className={styles['sample-check']} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Médico Responsable */}
            <div className={`${styles['form-section']} form-section ${styles['signature-section']} signature-section`} style={{ marginTop: '40px' }}>
                <div className={styles['signature-block']}>
                    <input type="text" className={styles['form-input']} style={{ textAlign: 'center', borderBottom: '1px solid #333', borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', background: 'transparent' }} placeholder="Nombre del Médico" />
                    <label style={{ display: 'block', marginTop: '5px' }}>Médico Responsable</label>
                </div>
            </div>
        </div>
    );
};

export default AnesthesiaSheet2;
