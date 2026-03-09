import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch, FaTimes, FaSlidersH, FaBox, FaCrow, FaBug, FaPaw, FaTint, FaClinicMedical, FaTree, FaMapMarkerAlt, FaFeatherAlt, FaFrog } from 'react-icons/fa';
import { GiSnake } from 'react-icons/gi';
import styles from '../../styles/PatientsPage.module.css';

const FiltersBar = ({
    user,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedLocation,
    setSelectedLocation,
    selectedDoctor,
    setSelectedDoctor,
    selectedDate,
    setSelectedDate
}) => {
    const [showFilters, setShowFilters] = useState(false);

    // UI state for expandable drawer sections
    const [expandedSections, setExpandedSections] = useState({
        especie: true,
        formato: true,
        ubicacion: true,
        medico: true,
        fecha: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Handle body scroll lock
    useEffect(() => {
        if (showFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showFilters]);

    const canSeeCategories = user?.role === 'admin' || user?.specialty === 'all';

    return (
        <React.Fragment>
            {/* Search Row & Toggle Button (Exact replica of PatientsPage style) */}
            <div className={styles['filters-card']} style={{ marginBottom: '2rem' }}>
                <div className={styles['search-bar-row']}>
                    <button
                        className={`${styles['advanced-filters-toggle']} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(true)}
                    >
                        <FaSlidersH /> Filtros Avanzados
                    </button>

                    <div className={styles['search-wrapper']}>
                        <FaSearch className={styles['search-icon']} />
                        <input
                            type="text"
                            placeholder="Buscar por ID, nombre común o nombre científico..."
                            className={styles['search-input-ios']}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Advanced Filters Drawer Portal */}
            {createPortal(
                <>
                    <div
                        className={`${styles['filters-backdrop']} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(false)}
                    />

                    <div className={`${styles['filters-drawer']} ${showFilters ? styles.active : ''}`}>
                        <div className={styles['drawer-header']}>
                            <h2>Filtros Avanzados</h2>
                            <button className={styles['close-drawer-btn']} onClick={() => setShowFilters(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles['drawer-content']}>

                            {/* ESPECIE Filter (Only if allowed) */}
                            {canSeeCategories && (
                                <div className={styles['filter-section']}>
                                    <div className={styles['section-header']} onClick={() => toggleSection('especie')}>
                                        <span className={styles['filter-label']}>ESPECIE</span>
                                        <span className={`${styles['collapse-icon']} ${expandedSections.especie ? styles.expanded : ''}`}>▼</span>
                                    </div>
                                    {expandedSections.especie && (
                                        <div className={styles['filter-options-grid']}>
                                            {[
                                                { id: 'all', label: 'Todos', icon: null },
                                                { id: 'mamiferos', label: 'Mamíferos', icon: <FaPaw className={styles['filter-icon']} /> },
                                                { id: 'aves', label: 'Aves', icon: <FaFeatherAlt className={styles['filter-icon']} /> },
                                                { id: 'reptiles', label: 'Reptiles', icon: <GiSnake className={styles['filter-icon']} /> },
                                                { id: 'anfibios', label: 'Anfibios', icon: <FaFrog className={styles['filter-icon']} /> }
                                            ].map((opt) => (
                                                <label key={opt.id} className={`${styles['checkbox-item']} ${selectedCategory === opt.id ? styles.active : ''} ${opt.id === 'all' ? styles['full-width'] : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="species"
                                                        checked={selectedCategory === opt.id}
                                                        onChange={() => setSelectedCategory(opt.id)}
                                                    />
                                                    <div className={styles['checkbox-custom']}></div>
                                                    <div className={styles['checkbox-content']}>
                                                        {opt.icon}
                                                        <span>{opt.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FORMATO Filter */}
                            <div className={styles['filter-section']}>
                                <div className={styles['section-header']} onClick={() => toggleSection('formato')}>
                                    <span className={styles['filter-label']}>FORMATO</span>
                                    <span className={`${styles['collapse-icon']} ${expandedSections.formato ? styles.expanded : ''}`}>▼</span>
                                </div>
                                {expandedSections.formato && (
                                    <div className={`${styles['filter-options-grid']} ${styles['full-width-options']}`}>
                                        {[
                                            { id: 'all', label: 'Todos los Formatos' },
                                            { id: 'REVISIÓN CLÍNICA', label: 'Revisión Clínica' },
                                            { id: 'FORMATO DE VACUNACIÓN', label: 'Vacunación' },
                                            { id: 'CALENDARIO DE DESPARASITACIÓN', label: 'Desparasitación' },
                                            { id: 'REPORTE DE NECROPSIA', label: 'Necropsia' },
                                            { id: 'REGISTRO DE ANESTESIA', label: 'Anestesia' },
                                            { id: 'FORMATO DE TRATAMIENTO', label: 'Tratamiento P.' },
                                            { id: 'TRATAMIENTO GRUPAL', label: 'Tratamiento G.' },
                                            { id: 'SEGUIMIENTO HOSPITALIZACIÓN', label: 'Hospitalización' }
                                        ].map(opt => (
                                            <label key={opt.id} className={`${styles['checkbox-item']} ${styles['full-width']} ${selectedType === opt.id ? styles.active : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="format"
                                                    checked={selectedType === opt.id}
                                                    onChange={() => setSelectedType(opt.id)}
                                                />
                                                <div className={styles['checkbox-custom']}></div>
                                                <div className={styles['checkbox-content']}>
                                                    <span>{opt.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* UBICACION Filter */}
                            <div className={styles['filter-section']}>
                                <div className={styles['section-header']} onClick={() => toggleSection('ubicacion')}>
                                    <span className={styles['filter-label']}>UBICACIÓN</span>
                                    <span className={`${styles['collapse-icon']} ${expandedSections.ubicacion ? styles.expanded : ''}`}>▼</span>
                                </div>
                                {expandedSections.ubicacion && (
                                    <div className={styles['filter-options-grid']}>
                                        {[
                                            { id: 'all', label: 'Todas las Ubicaciones', icon: null },
                                            { id: 'Cuarentena', label: 'Cuarentena', icon: <FaClinicMedical className={styles['filter-icon']} /> },
                                            { id: 'Aire Libre', label: 'Al aire libre', icon: <FaTree className={styles['filter-icon']} /> },
                                            { id: 'Recinto', label: 'En Recinto', icon: <FaMapMarkerAlt className={styles['filter-icon']} /> },
                                            { id: 'Clínica', label: 'Clínica', icon: <FaClinicMedical className={styles['filter-icon']} /> }
                                        ].map((opt) => (
                                            <label key={opt.id} className={`${styles['checkbox-item']} ${selectedLocation === opt.id ? styles.active : ''} ${opt.id === 'all' ? styles['full-width'] : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="location"
                                                    checked={selectedLocation === opt.id}
                                                    onChange={() => setSelectedLocation(opt.id)}
                                                />
                                                <div className={styles['checkbox-custom']}></div>
                                                <div className={styles['checkbox-content']}>
                                                    {opt.icon}
                                                    <span>{opt.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* MEDICO Filter */}
                            <div className={styles['filter-section']}>
                                <div className={styles['section-header']} onClick={() => toggleSection('medico')}>
                                    <span className={styles['filter-label']}>MÉDICO RESPONSABLE</span>
                                    <span className={`${styles['collapse-icon']} ${expandedSections.medico ? styles.expanded : ''}`}>▼</span>
                                </div>
                                {expandedSections.medico && (
                                    <div className={`${styles['filter-options-grid']} ${styles['full-width-options']}`}>
                                        {[
                                            { id: 'all', label: 'Todos los Médicos' },
                                            { id: 'Dr. Alejandro Vera', label: 'Dr. Alejandro Vera' },
                                            { id: 'Dra. María Solís', label: 'Dra. María Solís' },
                                            { id: 'Dr. Carlos Méndez', label: 'Dr. Carlos Méndez' }
                                        ].map(opt => (
                                            <label key={opt.id} className={`${styles['checkbox-item']} ${styles['full-width']} ${selectedDoctor === opt.id ? styles.active : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="doctor"
                                                    checked={selectedDoctor === opt.id}
                                                    onChange={() => setSelectedDoctor(opt.id)}
                                                />
                                                <div className={styles['checkbox-custom']}></div>
                                                <div className={styles['checkbox-content']}>
                                                    <span>{opt.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* FECHA Filter */}
                            <div className={styles['filter-section']} style={{ borderBottom: 'none' }}>
                                <div className={styles['section-header']} onClick={() => toggleSection('fecha')}>
                                    <span className={styles['filter-label']}>FECHA DE ATENCIÓN</span>
                                    <span className={`${styles['collapse-icon']} ${expandedSections.fecha ? styles.expanded : ''}`}>▼</span>
                                </div>
                                {expandedSections.fecha && (
                                    <div style={{ padding: '0 0.5rem 1rem 0.5rem' }}>
                                        <input
                                            type="date"
                                            className="w-full h-11 px-3.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm cursor-pointer outline-none transition-colors hover:bg-white focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00e5ff]/20 font-medium"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                        {selectedDate && (
                                            <button
                                                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                onClick={() => setSelectedDate('')}
                                            >
                                                Limpiar fecha
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles['drawer-footer']}>
                            <button className={styles['apply-filters-btn']} onClick={() => setShowFilters(false)}>
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </React.Fragment>
    );
};

export default FiltersBar;
