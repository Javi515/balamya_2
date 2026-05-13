import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    FaSearch,
    FaPaw,
    FaVenusMars,
    FaBirthdayCake,
    FaMapMarkerAlt,
    FaTree,
    FaDove,
    FaFrog,
    FaChevronLeft,
    FaChevronRight,
    FaCheckCircle,
} from 'react-icons/fa';
import { GiLion, GiTortoise } from 'react-icons/gi';
import styles from './AnimalSelector.module.css';
import paginationStyles from '../../../styles/shared/Pagination.module.css';

const ITEMS_PER_PAGE = 50;
import { fetchPatientListings } from '../../../services/patientsService';
import { getAdmissions } from '../../../services/hospitalizationService';

const CATEGORY_LABELS = {
    mamiferos: 'Mamiferos',
    aves: 'Aves',
    reptiles: 'Reptiles',
    anfibios: 'Anfibios',
};

const getSpeciesLabel = (patient) =>
    patient.taxonomicGroup || CATEGORY_LABELS[patient.category] || 'Sin grupo';

const getAgeLabel = (patient) => patient.ageText || (patient.age ? `${patient.age} anios` : 'Sin edad');

const AnimalCardImage = ({ patient }) => {
    const [imageFailed, setImageFailed] = useState(false);
    const shouldRenderImage = Boolean(patient.imageUrl) && !imageFailed;

    if (!shouldRenderImage) {
        return (
            <div className={styles['animal-image-placeholder']}>
                <FaPaw />
            </div>
        );
    }

    return (
        <img
            src={patient.imageUrl}
            alt={patient.name || patient.commonName || patient.scientificName || patient.id}
            onError={() => setImageFailed(true)}
        />
    );
};

const AnimalSelector = ({ onSelect, minSpecimenCount, maxSelectionCount, excludeHospitalized }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('todos');
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPatients, setSelectedPatients] = useState([]);
    const [admittedIds, setAdmittedIds] = useState(new Set());
    const showSpeciesFilters = user?.role === 'admin' || user?.specialty === 'all';
    const selectionLimit = Number(maxSelectionCount) || 0;
    const isMultiSelect = selectionLimit > 1;

    useEffect(() => {
        let isActive = true;

        if (!user) {
            setPatients([]);
            setFilteredPatients([]);
            return () => {
                isActive = false;
            };
        }

        const loadPatients = async () => {
            setIsLoading(true);
            setLoadError('');

            try {
                const response = await fetchPatientListings();
                if (!isActive) return;
                setPatients(response.patients);
            } catch (error) {
                if (!isActive) return;
                console.error(error);
                setPatients([]);
                setLoadError(error?.message || 'No fue posible cargar pacientes.');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadPatients();

        return () => {
            isActive = false;
        };
    }, [user]);

    useEffect(() => {
        let result = Array.isArray(patients) ? [...patients] : [];

        if (user?.role !== 'admin' && user?.specialty !== 'all') {
            result = result.filter(
                (patient) =>
                    String(patient.category || '').toLowerCase() === String(user?.specialty || '').toLowerCase()
            );
        }

        if (selectedSpecies !== 'todos') {
            result = result.filter((patient) => patient.category === selectedSpecies);
        }

        if (minSpecimenCount !== undefined) {
            result = result.filter((patient) => (patient.specimenCount || 0) >= minSpecimenCount);
        }

        if (excludeHospitalized) {
            result = result.filter((patient) => {
                if ((patient.estadoActual || '').toLowerCase().trim() === 'hospitalizado') {
                    return false;
                }
                if (admittedIds.size > 0) {
                    const pid = String(patient.id || '');
                    const pIdEjemplar = String(patient.idEjemplar || '');
                    if (admittedIds.has(pid) || admittedIds.has(pIdEjemplar)) {
                        return false;
                    }
                }
                return true;
            });
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter((patient) =>
                [patient.name, patient.commonName, patient.id, patient.idEjemplar, patient.scientificName]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(lowerSearch))
            );
        }

        setFilteredPatients(result);
        setCurrentPage(1);
    }, [patients, searchTerm, selectedSpecies, user, minSpecimenCount, excludeHospitalized, admittedIds]);

    useEffect(() => {
        if (!excludeHospitalized) {
            setAdmittedIds(new Set());
            return;
        }
        getAdmissions()
            .then((admissions) => {
                const ids = new Set();
                admissions.forEach((a) => {
                    if (a.id) ids.add(String(a.id));
                    if (a.identificacionMarcaje) ids.add(String(a.identificacionMarcaje));
                });
                setAdmittedIds(ids);
            })
            .catch(() => setAdmittedIds(new Set()));
    }, [excludeHospitalized]);

    const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
    const pagedPatients = filteredPatients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getPageNumbers = (current, total) => {
        const delta = 1;
        const range = [];
        const result = [];
        let l;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
        }
        for (let i of range) {
            if (l && i - l === 2) result.push(l + 1);
            else if (l && i - l !== 1) result.push('...');
            result.push(i);
            l = i;
        }
        return result;
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const getPatientKey = (patient) => String(patient.id || patient.idEjemplar || '');

    const isPatientSelected = (patient) => {
        const patientKey = getPatientKey(patient);
        return selectedPatients.some((selectedPatient) => getPatientKey(selectedPatient) === patientKey);
    };

    const handlePatientClick = (patient) => {
        if (!isMultiSelect) {
            onSelect(patient);
            return;
        }

        setSelectedPatients((previous) => {
            const patientKey = getPatientKey(patient);
            const alreadySelected = previous.some(
                (selectedPatient) => getPatientKey(selectedPatient) === patientKey
            );

            if (alreadySelected) {
                return previous.filter((selectedPatient) => getPatientKey(selectedPatient) !== patientKey);
            }

            if (previous.length >= selectionLimit) {
                return previous;
            }

            return [...previous, patient];
        });
    };

    const handleConfirmSelection = () => {
        if (selectedPatients.length === 0) return;
        onSelect(selectedPatients);
    };

    return (
        <div className={styles['animal-selector-container']}>
            <div className={styles['animal-selector-header']}>
                <h2>Selecciona un Ejemplar</h2>
                <p>Busca y selecciona el paciente para acceder a sus herramientas clinicas.</p>
            </div>

            <div className={styles['animal-selector-controls']}>
                <div className={styles['search-input-wrapper']}>
                    <FaSearch className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ID o especie..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                {showSpeciesFilters && (
                    <div className={styles['filter-chips-row']}>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'todos' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('todos')}
                        >
                            Todos
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'mamiferos' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('mamiferos')}
                        >
                            <GiLion /> Mamiferos
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'aves' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('aves')}
                        >
                            <FaDove /> Aves
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'reptiles' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('reptiles')}
                        >
                            <GiTortoise /> Reptiles
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'anfibios' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('anfibios')}
                        >
                            <FaFrog /> Anfibios
                        </button>
                    </div>
                )}
            </div>

            {isMultiSelect && (
                <div className={styles['multi-selection-bar']}>
                    <span className={styles['selection-counter']}>
                        <span className={styles['selection-counter-badge']}>{selectedPatients.length}</span>
                        de {selectionLimit} pacientes seleccionados
                    </span>
                    <button
                        className={styles['confirm-selection-btn']}
                        onClick={handleConfirmSelection}
                        disabled={selectedPatients.length === 0}
                    >
                        Continuar
                    </button>
                </div>
            )}

            <div className={styles['animal-grid']}>
                {isLoading ? (
                    <div className={styles['animals-loading']}>
                        <div className={styles['loading-spinner']} />
                        <p className={styles['loading-text']}>Cargando pacientes...</p>
                    </div>
                ) : loadError ? (
                    <div className={styles['no-results']}>
                        <FaPaw className={styles['no-results-icon']} />
                        <p>No fue posible cargar pacientes.</p>
                    </div>
                ) : filteredPatients.length > 0 ? (
                    pagedPatients.map((patient) => {
                        const selected = isPatientSelected(patient);

                        return (
                        <div
                            key={patient.id || patient.idEjemplar}
                            className={`${styles['animal-card']} ${selected ? styles.selected : ''}`}
                            onClick={() => handlePatientClick(patient)}
                        >
                            <div className={styles['animal-card-image']}>
                                <AnimalCardImage patient={patient} />
                                {isMultiSelect && selected && (
                                    <span className={styles['selection-check']}>
                                        <FaCheckCircle />
                                    </span>
                                )}
                            </div>
                            <div className={styles['animal-card-details']}>
                                <div className={styles['animal-name-row']}>
                                    <h3>{patient.name || patient.commonName || 'Sin nombre'}</h3>
                                    <span className={styles['animal-id']}>{patient.id || patient.idEjemplar}</span>
                                </div>
                                <div className={styles['animal-name-labels']}>
                                    {patient.name && (
                                        <p className={styles['animal-name-label-row']}>
                                            <span className={styles['animal-label-tag']}>Nombre propio</span>
                                            <span>{patient.name}</span>
                                        </p>
                                    )}
                                    {patient.commonName && (
                                        <p className={styles['animal-name-label-row']}>
                                            <span className={styles['animal-label-tag']}>Común</span>
                                            <span>{patient.commonName}</span>
                                        </p>
                                    )}
                                    {patient.scientificName && (
                                        <p className={styles['animal-name-label-row']}>
                                            <span className={styles['animal-label-tag']}>Científico</span>
                                            <span style={{ fontStyle: 'italic' }}>{patient.scientificName}</span>
                                        </p>
                                    )}
                                </div>
                                {patient.family && (
                                    <p className={styles['animal-scientific-name']}>
                                        Familia: <span style={{ fontStyle: 'normal', fontWeight: '500' }}>{patient.family}</span>
                                    </p>
                                )}

                                <div className={styles['animal-info-grid']}>
                                    <div className={styles['info-item']}>
                                        <FaVenusMars /> {patient.sex || 'N/A'}
                                    </div>
                                    <div className={styles['info-item']}>
                                        <FaBirthdayCake /> {getAgeLabel(patient)}
                                    </div>
                                    <div className={styles['info-item']}>
                                        <FaTree /> {getSpeciesLabel(patient)}
                                    </div>
                                </div>
                                <div className={styles['animal-location']}>
                                    <FaMapMarkerAlt /> {patient.location || 'Sin recinto'}
                                </div>
                                {(patient.grouping || patient.specimenCount) && (
                                    <div className={styles['animal-location']}>
                                        <FaPaw /> {patient.grouping || 'Sin agrupacion'}
                                        {patient.specimenCount ? ` - ${patient.specimenCount} ejemplares` : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                        );
                    })
                ) : (
                    <div className={styles['no-results']}>
                        <FaPaw className={styles['no-results-icon']} />
                        <p>No se encontraron pacientes.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className={paginationStyles.pagination}>
                    <div className={paginationStyles['pagination-controls']}>
                        <button
                            className={paginationStyles['page-btn-nav']}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <FaChevronLeft style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                            Anterior
                        </button>
                        <div className={paginationStyles['pagination-numbers']}>
                            {getPageNumbers(currentPage, totalPages).map((num, i) => (
                                <button
                                    key={i}
                                    className={`${paginationStyles['page-btn']} ${num === currentPage ? paginationStyles.active : ''} ${num === '...' ? paginationStyles.dots : ''}`}
                                    disabled={num === '...'}
                                    onClick={() => num !== '...' && setCurrentPage(num)}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button
                            className={paginationStyles['page-btn-nav']}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Siguiente
                            <FaChevronRight style={{ marginLeft: '6px', fontSize: '0.8rem' }} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimalSelector;
