import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaArrowLeft, FaExchangeAlt, FaBed, FaListAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AnimalSelector from '../components/dashboard/AnimalSelector';
import AnesthesiaForm from '../components/dashboard/AnesthesiaForm';
import { patients } from '../data/mockData';
import styles from '../styles/AnesthesiaForm.module.css';
import formStyles from '../styles/FormsPage.module.css';
import customStyles from '../styles/CustomTable.module.css';
import hospStyles from '../styles/HospitalizationPage.module.css';
import '../styles/FloatingActions.css';

const AnesthesiaPage = () => {
    const navigate = useNavigate();
    // viewState: 'menu' | 'selection' | 'summary' | 'anesthesia-form'
    const [viewState, setViewState] = useState('menu');
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [allRecords, setAllRecords] = useState(() => {
        try {
            const saved = localStorage.getItem('balamya_anesthesia_records');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    // Summary pagination
    const [summaryPage, setSummaryPage] = useState(1);
    const summaryItemsPerPage = 10;

    // For editing a specific record (full form state tracking is complex, we just store basic meta in records array for the table)
    const [editingIndex, setEditingIndex] = useState(null);
    // If we want to view a full record, we can pass it to AnesthesiaForm,
    // but the current AnesthesiaForm is designed for new inputs and export.
    // For now, we'll store basic info to show in the table.

    useEffect(() => {
        localStorage.setItem('balamya_anesthesia_records', JSON.stringify(allRecords));
    }, [allRecords]);

    const records = selectedAnimal ? (allRecords[selectedAnimal.id] || []) : [];

    // --- Navigation ---
    const goToMenu = () => {
        setViewState('menu');
        setSelectedAnimal(null);
    };

    const goToRegister = () => {
        setViewState('selection');
    };

    const goToSummary = () => {
        setViewState('summary');
    };

    const handleAnimalSelect = (animal) => {
        setSelectedAnimal(animal);
        setEditingIndex(null); // Ensure it's a new form
        setViewState('anesthesia-form');
    };

    const handleChangeAnimal = () => {
        setSelectedAnimal(null);
        setViewState('selection');
    };

    const viewHistoryFor = (patient) => {
        setSelectedAnimal(patient);
        setEditingIndex(null); // Optional: If we had a view mode, we'd pass index. For now, open form.
        setViewState('anesthesia-form');
    };

    const closeForm = () => {
        setViewState('menu');
        setEditingIndex(null);
        setSelectedAnimal(null);
    };

    const handleSaveForm = (recordMeta) => {
        const patientRecords = [...records];
        if (editingIndex !== null) {
            // update existing
            patientRecords[editingIndex] = { ...patientRecords[editingIndex], ...recordMeta };
        } else {
            patientRecords.push(recordMeta);
        }
        setAllRecords(prev => ({ ...prev, [selectedAnimal.id]: patientRecords }));
        // Close back to menu
        setViewState('menu');
        setSelectedAnimal(null);
    };

    // --- Summary data ---
    const getSummaryData = () => {
        return patients.map(p => {
            const recs = allRecords[p.id] || [];
            const lastRecord = recs.length > 0 ? recs[recs.length - 1] : null;
            return {
                patient: p,
                totalRecords: recs.length,
                lastAnesthesia: lastRecord ? (lastRecord.fecha || null) : null,
                lastProcedure: lastRecord ? (lastRecord.procedimiento || null) : null
            };
        });
    };

    const getPageNumbers = (current, total) => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }
        for (let i of range) {
            if (l) {
                if (i - l === 2) rangeWithDots.push(l + 1);
                else if (i - l !== 1) rangeWithDots.push('...');
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };


    // ==========================================
    // VIEW: MENU
    // ==========================================
    if (viewState === 'menu') {
        return (
            <div
                className={formStyles['forms-page-wrapper']}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 140px)',
                    marginTop: '0'
                }}
            >
                <div className={formStyles['forms-page-container']}>
                    <div className={formStyles['forms-page-header']} style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h1 className={formStyles['forms-page-title']} style={{ fontSize: '2.5rem' }}>Anestesias</h1>
                        <p className={formStyles['forms-page-subtitle']} style={{ fontSize: '1.1rem' }}>¿Qué deseas hacer?</p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '40px',
                        padding: '20px',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-general']}`} onClick={goToRegister} style={{ cursor: 'pointer', minHeight: '350px' }}>
                            <div className={formStyles['form-card-content']} style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', gap: '25px' }}>
                                <FaBed className={formStyles['form-card-icon']} style={{ color: '#0d6efd', fontSize: '72px' }} />
                                <div className={formStyles['form-card-text']} style={{ textAlign: 'center' }}>
                                    <h3 className={formStyles['form-card-title']} style={{ fontSize: '1.5rem', marginBottom: '15px' }}>REGISTRAR ANESTESIA</h3>
                                    <p className={formStyles['form-card-description']} style={{ fontSize: '1.1rem' }}>Selecciona un ejemplar y registra sus protocolos de sedación o anestesia.</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${formStyles['form-card']} ${formStyles['form-card-general']}`} onClick={goToSummary} style={{ cursor: 'pointer', minHeight: '350px' }}>
                            <div className={formStyles['form-card-content']} style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', gap: '25px' }}>
                                <FaListAlt className={formStyles['form-card-icon']} style={{ color: '#0d6efd', fontSize: '72px' }} />
                                <div className={formStyles['form-card-text']} style={{ textAlign: 'center' }}>
                                    <h3 className={formStyles['form-card-title']} style={{ fontSize: '1.5rem', marginBottom: '15px' }}>VER ANESTESIAS</h3>
                                    <p className={formStyles['form-card-description']} style={{ fontSize: '1.1rem' }}>Consulta el resumen de anestesias de todos los pacientes y accede a sus archivos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: ANIMAL SELECTION
    // ==========================================
    if (viewState === 'selection') {
        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <button onClick={goToMenu} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al menú
                    </button>
                    <AnimalSelector onSelect={handleAnimalSelect} />
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: SUMMARY TABLE
    // ==========================================
    if (viewState === 'summary') {
        const summaryData = getSummaryData();
        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <button onClick={goToMenu} className={formStyles['back-to-menu-btn']}>
                        <FaArrowLeft /> Volver al menú
                    </button>
                    <div className={customStyles['custom-table-container']}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Resumen de Anestesias</h3>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{summaryData.length} PACIENTES</span>
                        </div>
                        <table className={customStyles['custom-table']}>
                            <thead>
                                <tr>
                                    <th>Animal</th>
                                    <th>Identificación</th>
                                    <th>Última Anestesia</th>
                                    <th>Procedimiento</th>
                                    <th>Total Registros</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const totalSummaryPages = Math.ceil(summaryData.length / summaryItemsPerPage);
                                    const startIdx = (summaryPage - 1) * summaryItemsPerPage;
                                    const paginatedData = summaryData.slice(startIdx, startIdx + summaryItemsPerPage);
                                    return paginatedData.map((item) => (
                                        <tr key={item.patient.id}>
                                            <td>
                                                <div className={customStyles['species-info']}>
                                                    <div className={customStyles['highlight-text']}>{item.patient.commonName}</div>
                                                </div>
                                            </td>
                                            <td><span className={customStyles['id-text']}>{item.patient.id}</span></td>
                                            <td>{item.lastAnesthesia ? item.lastAnesthesia : <span className={customStyles['empty-value']}>Sin registro</span>}</td>
                                            <td>{item.lastProcedure ? item.lastProcedure : <span className={customStyles['empty-value']}>N/A</span>}</td>
                                            <td style={{ textAlign: 'center' }}>{item.totalRecords}</td>
                                            <td>
                                                <button
                                                    className={customStyles['action-button']}
                                                    onClick={() => viewHistoryFor(item.patient)}
                                                >
                                                    <FaEye /> Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                        {(() => {
                            const totalSummaryPages = Math.ceil(summaryData.length / summaryItemsPerPage);
                            if (totalSummaryPages <= 1) return null;
                            return (
                                <div className={hospStyles['pagination']}>
                                    <div className={hospStyles['pagination-controls']}>
                                        <button
                                            className={hospStyles['page-btn-nav']}
                                            disabled={summaryPage === 1}
                                            onClick={() => setSummaryPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            <FaChevronLeft /> Anterior
                                        </button>
                                        {getPageNumbers(summaryPage, totalSummaryPages).map((pageNumber, index) => (
                                            <button
                                                key={index}
                                                className={`${hospStyles['page-btn']} ${pageNumber === summaryPage ? hospStyles['active'] : ''} ${pageNumber === '...' ? hospStyles['dots'] : ''}`}
                                                disabled={pageNumber === '...'}
                                                onClick={() => pageNumber !== '...' && setSummaryPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                        <button
                                            className={hospStyles['page-btn-nav']}
                                            disabled={summaryPage === totalSummaryPages}
                                            onClick={() => setSummaryPage(prev => Math.min(prev + 1, totalSummaryPages))}
                                        >
                                            Siguiente <FaChevronRight />
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW: ANESTHESIA FULL FORM
    // ==========================================
    if (viewState === 'anesthesia-form') {
        const existingRecord = editingIndex !== null ? records[editingIndex] : null;

        return (
            <div className={formStyles['forms-page-wrapper']}>
                <div className={formStyles['form-entry-animation']}>
                    <div className={formStyles['form-header-controls']}>
                        <button onClick={closeForm} className={formStyles['back-to-menu-btn']}>
                            <FaArrowLeft /> Volver al menú
                        </button>
                        <div className={`${formStyles['selected-animal-banner']} ${formStyles.compact}`}>
                            <div className={formStyles['animal-banner-info']}>
                                <span className={formStyles['banner-label']}>Paciente:</span>
                                <span className={formStyles['banner-name']}>{selectedAnimal.commonName || 'Sin Nombre Común'}</span>
                                <span className={formStyles['banner-id']}>{selectedAnimal.id}</span>
                            </div>
                            <button onClick={handleChangeAnimal} className={formStyles['change-animal-btn']}>
                                <FaExchangeAlt /> Cambiar
                            </button>
                        </div>
                    </div>

                    <AnesthesiaForm
                        patient={selectedAnimal}
                        existingRecord={existingRecord}
                        onSave={handleSaveForm}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default AnesthesiaPage;
