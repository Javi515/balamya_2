import React from 'react';
import ReactDOM from 'react-dom';
import { FaArrowLeft, FaEdit, FaExchangeAlt, FaFilePdf, FaPlus, FaSave } from 'react-icons/fa';
import ImageUploader from '../../../../components/common/ImageUploader/ImageUploader';
import styles from '../DewormingCalendar/DewormingCalendar.module.css';
import formStyles from '../../../forms/pages/FormsPage.module.css';
import '../../../../styles/FloatingActions.css';

const DewormingCalendarView = ({
    selectedAnimal,
    onBack,
    onChangeAnimal,
    formRef,
    editableGrupo,
    editablePeso,
    onPesoChange,
    editableEstadoFisiologico,
    onEstadoChange,
    sheets,
    currentSheetIndex,
    onSheetIndexChange,
    onSetSaved,
    isViewMode,
    isSaved,
    records,
    registradoresActuales = [],
    onAddRecord,
    isModalOpen,
    currentRecord,
    onRecordChange,
    onSaveRecord,
    onCloseModal,
    editingIndex,
    onSave,
    onExportPDF,
    selectedRow,
    onSelectRow,
    onEditRecord,
    isEditingSaved,
    currentUserId,
    isAdmin,
    isLoadingRecords,
}) => (
    <div className={formStyles['forms-page-wrapper']}>
        <div className={formStyles['form-entry-animation']}>
            <div className="global-form-width">
            <div className={formStyles['form-header-controls']}>
                <button onClick={onBack} className={formStyles['back-to-menu-btn']}>
                    <FaArrowLeft /> Volver al menú
                </button>
                <div className={`${formStyles['selected-animal-banner']} ${formStyles.compact}`}>
                    <div className={formStyles['animal-banner-info']}>
                        <span className={formStyles['banner-label']}>Paciente:</span>
                        <span className={formStyles['banner-name']}>{selectedAnimal.commonName || 'Sin nombre común'}</span>
                        <span className={formStyles['banner-id']}>{selectedAnimal.id}</span>
                    </div>
                    <button onClick={onChangeAnimal} className={formStyles['change-animal-btn']}>
                        <FaExchangeAlt /> Cambiar
                    </button>
                </div>
            </div>

            <div className={styles['deworming-card']} ref={formRef}>
                <div className={styles['deworming-header-flex']}>
                    <ImageUploader placeholderText="Logo" className="header-logo-left" />
                    <div className={styles['deworming-header']} style={{ flex: 1, textAlign: 'center' }}>
                        <div className={styles['deworming-header-subtitle']} style={{ marginBottom: '5px' }}>
                            MANTENIMIENTO PREVENTIVO
                        </div>
                        <div className={styles['deworming-header-title']}>
                            CALENDARIO DE DESPARASITACIÓN
                        </div>
                    </div>
                    <ImageUploader placeholderText="Logo" className="header-logo-right" />
                </div>

                <h4>DATOS GENERALES</h4>
                <div className={styles['deworming-form-grid']}>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>GRUPO</label><input type="text" className={styles['deworming-form-input']} value={editableGrupo} readOnly /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>NOMBRE CIENTÍFICO</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.scientificName || ''} readOnly /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>NOMBRE COMÚN</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.commonName || ''} readOnly /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>SEXO</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.sex || ''} readOnly /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>EDAD</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.age ? `${selectedAnimal.age} años` : ''} readOnly /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>IDENTIFICACIÓN</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.id || ''} readOnly /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PESO (kg)</label><input type="text" className={styles['deworming-form-input']} value={editablePeso} onChange={(e) => onPesoChange(e.target.value)} placeholder="Ej: 12.5" readOnly={isViewMode} /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>UBICACIÓN</label><input type="text" className={styles['deworming-form-input']} value={selectedAnimal.location || ''} readOnly /></div>
                    <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>ESTADO FISIOLÓGICO</label><input type="text" className={styles['deworming-form-input']} value={editableEstadoFisiologico} onChange={(e) => onEstadoChange(e.target.value)} readOnly={isViewMode} /></div>
                </div>

                {isViewMode && (
                    <p className={styles['row-selection-hint']}>
                        Selecciona una fila para ver el peso y el estado fisiológico registrados en ese evento.
                    </p>
                )}

                {!isViewMode && (
                    <div className={styles['add-record-button-container']}>
                        <button onClick={onAddRecord} className={styles['add-record-button']}>
                            <FaPlus /> Agregar Registro
                        </button>
                    </div>
                )}

                <div className={styles['table-container']}>
                    <table className={styles['deworming-table']}>
                        <thead>
                            <tr>
                                <th>FECHA</th>
                                <th>PRINCIPIO ACTIVO</th>
                                <th>DOSIS MG/KG</th>
                                <th>PRODUCTO COMERCIAL</th>
                                <th>DOSIS TOTAL (ml o tabletas)</th>
                                <th>VÍA DE ADMINISTRACIÓN</th>
                                <th>FRECUENCIA</th>
                                <th>PRÓXIMA DESPARASITACIÓN</th>
                                {isViewMode && <th>REGISTRADO POR</th>}
                                {isViewMode && <th>ACCIONES</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingRecords ? (
                                <tr>
                                    <td colSpan="10">
                                        <div className={styles['table-loading-wrap']}>
                                            <div className={styles['table-spinner']} />
                                            <span className={styles['table-loading-text']}>Cargando registros...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
                                        No hay registros.
                                    </td>
                                </tr>
                            ) : (
                                records.map((rec, index) => (
                                    <tr
                                        key={index}
                                        className={[
                                            isViewMode ? styles['table-row-selectable'] : '',
                                            selectedRow?.sheetIndex === currentSheetIndex && selectedRow?.recordIndex === index
                                                ? styles['deworming-row-selected']
                                                : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={isViewMode ? () => onSelectRow?.(index) : undefined}
                                    >
                                        <td>{rec.fecha}</td>
                                        <td>{rec.principioActivo}</td>
                                        <td>{rec.dosisMgKg}</td>
                                        <td>{rec.productoComercial}</td>
                                        <td>{rec.dosisTotal}</td>
                                        <td>{rec.via}</td>
                                        <td>{rec.frecuencia}</td>
                                        <td>{rec.proxima}</td>
                                        {isViewMode && <td>{rec.registradoPor || '-'}</td>}
                                        {isViewMode && (
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {(isAdmin || (rec.idUsuario != null && currentUserId != null && String(rec.idUsuario) === String(currentUserId))) && (
                                                    <button
                                                        className={styles['edit-record-btn']}
                                                        onClick={() => onEditRecord?.(index)}
                                                        title="Editar registro"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="floating-actions">
                    {isViewMode ? (
                        <button className="floating-btn pdf-btn" onClick={onExportPDF} title="Descargar PDF"><FaFilePdf /></button>
                    ) : (
                        !isSaved
                            ? <button className="floating-btn save-btn" onClick={onSave} title="Guardar"><FaSave /></button>
                            : <button className="floating-btn pdf-btn" onClick={onExportPDF} title="Descargar PDF"><FaFilePdf /></button>
                    )}
                </div>
            </div>

            {isModalOpen && ReactDOM.createPortal(
                <div className={styles['modal-overlay']} onClick={onCloseModal}>
                    <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles['modal-title']}>
                            {editingIndex !== null ? 'Editar Registro de Desparasitación' : 'Agregar Registro de Desparasitación'}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); onSaveRecord(); }}>
                            <div className={styles['modal-form-grid']}>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>FECHA</label><input type="date" className={styles['deworming-form-input']} style={{ color: currentRecord.fecha ? 'inherit' : 'transparent' }} name="fecha" value={currentRecord.fecha} onChange={onRecordChange} /></div>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PRINCIPIO ACTIVO</label><input type="text" className={styles['deworming-form-input']} name="principioActivo" value={currentRecord.principioActivo} onChange={onRecordChange} /></div>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>DOSIS MG/KG</label><input type="text" className={styles['deworming-form-input']} name="dosisMgKg" value={currentRecord.dosisMgKg} onChange={onRecordChange} /></div>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PRODUCTO COMERCIAL</label><input type="text" className={styles['deworming-form-input']} name="productoComercial" value={currentRecord.productoComercial} onChange={onRecordChange} /></div>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>DOSIS TOTAL (ml o tabletas)</label><input type="text" className={styles['deworming-form-input']} name="dosisTotal" value={currentRecord.dosisTotal} onChange={onRecordChange} /></div>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>VÍA DE ADMINISTRACIÓN</label><input type="text" className={styles['deworming-form-input']} name="via" value={currentRecord.via} onChange={onRecordChange} /></div>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>FRECUENCIA</label><input type="text" className={styles['deworming-form-input']} name="frecuencia" value={currentRecord.frecuencia} onChange={onRecordChange} /></div>
                                <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PRÓXIMA DESPARASITACIÓN</label><input type="date" className={styles['deworming-form-input']} style={{ color: currentRecord.proxima ? 'inherit' : 'transparent', textAlign: 'center', textAlignLast: 'center' }} name="proxima" value={currentRecord.proxima} onChange={onRecordChange} /></div>
                                {isEditingSaved && (
                                    <>
                                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>PESO (kg)</label><input type="text" className={styles['deworming-form-input']} name="peso" value={currentRecord.peso || ''} onChange={onRecordChange} placeholder="Ej: 12.5" /></div>
                                        <div className={styles['deworming-form-field']}><label className={styles['deworming-form-label']}>ESTADO FISIOLÓGICO</label><input type="text" className={styles['deworming-form-input']} name="estadoFisiologico" value={currentRecord.estadoFisiologico || ''} onChange={onRecordChange} /></div>
                                    </>
                                )}
                            </div>
                            <div className={styles['modal-actions']}>
                                <button type="button" className={`${styles['footer-button']} ${styles['cancel-button']}`} onClick={onCloseModal}>Cancelar</button>
                                <button type="submit" className={`${styles['footer-button']} ${styles['save-button']}`}>
                                    {editingIndex !== null ? 'Actualizar' : 'Aceptar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
            </div>
    </div>
);

export default DewormingCalendarView;
