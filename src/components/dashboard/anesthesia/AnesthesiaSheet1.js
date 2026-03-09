import React from 'react';
import styles from '../../../styles/AnesthesiaForm.module.css';
import ImageUploader from '../../common/ImageUploader';

const AnesthesiaSheet1 = ({
    patient,
    protocolRows,
    addProtocolRow,
    removeProtocolRow
}) => {
    return (
        <div className={styles['form-page']} id="anesthesia-hoja1">
            <div className={styles['anesthesia-header']} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                <ImageUploader placeholderText="Logo" className="header-logo-left" />
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.2rem', margin: '0 0 5px 0' }}>Zoológico Regional Miguel Álvarez del Toro</h1>
                    <h2 style={{ fontSize: '1rem', fontStyle: 'italic', margin: '0 0 10px 0', color: '#555' }}>Clínica Veterinaria</h2>
                    <hr style={{ margin: '10px 0', borderColor: '#ccc' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0' }}>REGISTRO DE ANESTESIA</h3>
                </div>
                <ImageUploader placeholderText="Logo" className="header-logo-right" />
            </div>

            {/* Datos Generales */}
            <div className={`${styles['form-section']} form-section`}>
                <h4 className={styles['section-title']}>Datos Generales</h4>
                <div className={styles['form-grid-4']}>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Fecha</label>
                        <input type="date" className={styles['form-input']} />
                    </div>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Especie</label>
                        <input type="text" className={styles['form-input']} defaultValue={patient?.scientificName || ''} placeholder="Canario" />
                    </div>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Identificación</label>
                        <input type="text" className={styles['form-input']} defaultValue={patient?.id || ''} placeholder="ID del ejemplar" />
                    </div>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Sexo</label>
                        <select className={styles['form-input']}>
                            <option value="">Seleccionar</option>
                            <option value="Macho">Macho</option>
                            <option value="Hembra">Hembra</option>
                            <option value="Indeterminado">Indeterminado</option>
                        </select>
                    </div>
                </div>
                <div className={styles['form-grid-4']}>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Peso (último registrado)</label>
                        <input type="text" className={styles['form-input']} placeholder="kg" />
                    </div>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Peso actualizado</label>
                        <input type="text" className={styles['form-input']} placeholder="kg" />
                    </div>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Edad</label>
                        <input type="text" className={styles['form-input']} defaultValue={patient?.age ? `${patient.age} años` : ''} placeholder="Edad" />
                    </div>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Método de administración</label>
                        <select className={styles['form-input']}>
                            <option value="">Seleccionar</option>
                            <option value="Cerbatana">Cerbatana</option>
                            <option value="Rifle">Rifle</option>
                            <option value="Inyección directa">Inyección directa</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Procedimiento */}
            <div className={`${styles['form-section']} form-section`}>
                <h4 className={styles['section-title']}>Procedimiento a realizar</h4>
                <textarea className={styles['form-textarea']} rows="2" placeholder="Describir el procedimiento..."></textarea>
            </div>

            {/* Clasificación y Estado */}
            <div className={styles['two-column-layout']}>
                <div className={`${styles['form-section']} form-section`}>
                    <h4 className={styles['section-title']}>Clasificación del Estado Físico Actual</h4>
                    <div className={styles['radio-group']}>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisico" value="1" /> Clase 1 (Saludable)</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisico" value="2" /> Clase 2 (Enfermo)</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisico" value="3" /> Clase 3 (Enfermedad sistémica grave)</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisico" value="4" /> Clase 4 (Enfermedad sistémica constante)</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisico" value="5" /> Clase 5 (Puede no sobrevivir)</label>
                    </div>
                </div>

                <div className={`${styles['form-section']} form-section`}>
                    <h4 className={styles['section-title']}>Estado Fisiológico del Ejemplar</h4>
                    <div className={styles['radio-group']}>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisiologico" value="cria" /> Cría</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisiologico" value="juvenil" /> Juvenil</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisiologico" value="adulto" /> Adulto/Sub adulto</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisiologico" value="senil" /> Senil</label>
                        <label className={styles['radio-label']}><input type="radio" name="estadoFisiologico" value="gestante" /> Hembra gestante</label>
                    </div>
                </div>
            </div>

            {/* Condición y Tiempos */}
            <div className={styles['two-column-layout']}>
                <div className={`${styles['form-section']} form-section`}>
                    <h4 className={styles['section-title']}>Condición Física del Ejemplar</h4>
                    <div className={styles['radio-group']}>
                        <label className={styles['radio-label']}><input type="radio" name="condicionFisica" value="emaciado" /> Emaciado</label>
                        <label className={styles['radio-label']}><input type="radio" name="condicionFisica" value="delgado" /> Delgado</label>
                        <label className={styles['radio-label']}><input type="radio" name="condicionFisica" value="ideal" /> Ideal</label>
                        <label className={styles['radio-label']}><input type="radio" name="condicionFisica" value="obeso" /> Obeso</label>
                    </div>
                </div>

                <div className={`${styles['form-section']} form-section`}>
                    <h4 className={styles['section-title']}>Tiempos del Procedimiento</h4>
                    <div className={styles['form-grid-1']}>
                        <div className={`${styles['form-group']} ${styles['compact']} form-group`}>
                            <label>Hora de inicio</label>
                            <input type="time" className={styles['form-input']} />
                        </div>
                        <div className={`${styles['form-group']} ${styles['compact']} form-group`}>
                            <label>Tamaño de sonda endotraqueal</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                <input type="text" className={styles['form-input']} style={{ flex: 1 }} placeholder="mm" />
                            </div>
                        </div>
                        <div className={`${styles['form-group']} ${styles['compact']} form-group`}>
                            <label>Tiempo de inducción</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                <input type="text" className={styles['form-input']} style={{ flex: 1 }} placeholder="min" />
                            </div>
                        </div>
                        <div className={`${styles['form-group']} ${styles['compact']} form-group`}>
                            <label>Tiempo de recuperación</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                <input type="text" className={styles['form-input']} style={{ flex: 1 }} placeholder="min" />
                            </div>
                        </div>
                        <div className={`${styles['form-group']} ${styles['compact']} form-group`}>
                            <label>Tiempo total de anestesia</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                <input type="text" className={styles['form-input']} style={{ flex: 1 }} placeholder="min" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Valoración Previa */}
            <div className={`${styles['form-section']} form-section`}>
                <h4 className={styles['section-title']}>Valoración Previa</h4>
                <div className={styles['form-grid-4']} style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Hemograma</label>
                        <input type="text" className={styles['form-input']} />
                    </div>
                    <div className={`${styles['form-group']} form-group`}>
                        <label>Bioquímica</label>
                        <input type="text" className={styles['form-input']} />
                    </div>
                </div>
                <div className={`${styles['form-group']} form-group`} style={{ marginTop: '10px' }}>
                    <label>Deshidratación</label>
                    <div className={styles['checkbox-row']}>
                        <label className={styles['radio-label']}><input type="radio" name="deshidratacion" value="ninguna" /> NINGUNA</label>
                        <label className={styles['radio-label']}><input type="radio" name="deshidratacion" value="5-6" /> 5-6%</label>
                        <label className={styles['radio-label']}><input type="radio" name="deshidratacion" value="6-8" /> 6-8%</label>
                        <label className={styles['radio-label']}><input type="radio" name="deshidratacion" value="10-12" /> 10-12%</label>
                        <label className={styles['radio-label']}><input type="radio" name="deshidratacion" value="+12" /> +12%</label>
                    </div>
                </div>
            </div>

            {/* Protocolo Anestésico */}
            <div className={`${styles['form-section']} form-section`}>
                <h4 className={styles['section-title']}>Protocolo Anestésico</h4>
                <table className={styles['anesthesia-table']}>
                    <thead>
                        <tr>
                            <th>FÁRMACO</th>
                            <th>DOSIS (MG/KG)</th>
                            <th>VOLUMEN (ML)</th>
                            <th>VÍA DE ADMÓN</th>
                            <th>HORA/INTERVALO</th>
                            <th className={`${styles['action-col']} `}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {protocolRows.map((row) => (
                            <tr key={row.id} className={styles['protocol-row']}>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td><input type="text" className={styles['table-input']} /></td>
                                <td className={`${styles['action-col']} `}>
                                    <button
                                        className={styles['delete-row-btn']}
                                        onClick={() => removeProtocolRow(row.id)}
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
                    <button className={styles['add-row-btn']} onClick={addProtocolRow}>
                        + Agregar Fila
                    </button>
                </div>
            </div>

            <div className={`${styles['form-section']} form-section`}>
                <h4 className={styles['section-title']}>COMENTARIOS / OBSERVACIONES</h4>
                <textarea className={styles['form-textarea']} rows="3"></textarea>
            </div>
        </div>
    );
};

export default AnesthesiaSheet1;
