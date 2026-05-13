import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaIdCard, FaClipboardList } from 'react-icons/fa';
import PatientCard from '../PatientCard/PatientCard';
import styles from './PatientGrid.module.css';

const ITEMS_PER_PAGE = 30;
const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800';

const getSearchableValues = (patient) => [
    patient.id,
    patient.grouping,
    patient.commonName,
    patient.scientificName,
    patient.name,
    patient.species,
    patient.specimenCount,
    patient.taxonomicGroup,
]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

const getAgeLabel = (patient) => patient.ageText || (patient.age ? `${patient.age} anios` : 'N/A');

const PatientGrid = ({
    patients,
    searchTerm,
    category,
    location,
    procedencia,
    group,
    casualtyType,
    viewMode = 'grid',
    isCasualties = false,
    apiMode = false,
    detailsEnabled = true,
}) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, category, location, procedencia, group, casualtyType, apiMode]);

    useEffect(() => {
        let result = (Array.isArray(patients) ? [...patients] : [])
            .filter(p => (p.taxonomicGroup || '').toLowerCase() !== 'invertebrados');

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((patient) =>
                getSearchableValues(patient).some((value) => value.includes(term))
            );
        }

        if (category && category.length > 0 && !category.includes('todos')) {
            result = result.filter(
                (patient) => patient.category && category.includes(String(patient.category).toLowerCase())
            );
        }

        if (procedencia && procedencia.length > 0 && !procedencia.includes('Todas')) {
            result = result.filter((patient) =>
                procedencia.some((p) => patient.procedencia === p)
            );
        }

        if (location && location.length > 0 && !location.includes('Todas')) {
            const normalizeLocation = (v) =>
                String(v || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
            result = result.filter((patient) =>
                location.some((selectedLocation) =>
                    normalizeLocation(patient.locationType) === normalizeLocation(selectedLocation)
                )
            );
        }

        if (group && group.length > 0 && !group.includes('Todos')) {
            result = result.filter((patient) => {
                const patientGrouping = String(patient.grouping || '').toLowerCase();
                return group.some((g) => g.toLowerCase() === patientGrouping);
            });
        }

        if (isCasualties && casualtyType && casualtyType.length > 0 && !casualtyType.includes('Todas')) {
            result = result.filter(
                (patient) => patient.casualtyType && casualtyType.includes(patient.casualtyType)
            );
        }

        setFilteredPatients(result);
    }, [patients, searchTerm, category, location, procedencia, group, casualtyType, isCasualties, apiMode]);

    const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPageNumbers = (activePage, pageCount) => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let previousPage;

        for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
            if (
                pageNumber === 1 ||
                pageNumber === pageCount ||
                (pageNumber >= activePage - delta && pageNumber <= activePage + delta)
            ) {
                range.push(pageNumber);
            }
        }

        for (const pageNumber of range) {
            if (previousPage) {
                if (pageNumber - previousPage === 2) {
                    rangeWithDots.push(previousPage + 1);
                } else if (pageNumber - previousPage !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(pageNumber);
            previousPage = pageNumber;
        }

        return rangeWithDots;
    };

    if (filteredPatients.length === 0) {
        return (
            <div className={styles['no-results']}>
                <p>No se encontraron pacientes con los filtros seleccionados.</p>
            </div>
        );
    }

    return (
        <div className={styles['patient-grid-container']}>
            {viewMode === 'grid' ? (
                <div className={styles['patient-grid']}>
                    {currentItems.map((patient) => (
                        <PatientCard
                            key={patient.id}
                            patient={patient}
                            isCasualties={isCasualties}
                            detailsEnabled={detailsEnabled}
                            apiMode={apiMode}
                        />
                    ))}
                </div>
            ) : (
                <div className={`${styles['list-view-container']} ${styles['table-responsive-container']}`}>
                    <table className={styles['patient-table']}>
                        <colgroup>
                            {!apiMode && <col className={styles['col-foto']} />}
                            <col className={apiMode ? styles['col-id-api'] : styles['col-id']} />
                            <col className={apiMode ? styles['col-nombre-api'] : styles['col-nombre']} />
                            {apiMode ? (
                                <>
                                    <col className={styles['col-cientifico']} />
                                    <col className={styles['col-grupo']} />
                                    <col className={styles['col-edad-api']} />
                                    <col className={styles['col-sexo']} />
                                    <col className={styles['col-proc']} />
                                    <col className={styles['col-recinto']} />
                                    {detailsEnabled && <col className={styles['col-acc']} />}
                                </>
                            ) : (
                                <>
                                    <col className={styles['col-especie']} />
                                    <col className={styles['col-peso']} />
                                    <col className={styles['col-edad']} />
                                    <col className={styles['col-ubi']} />
                                    {detailsEnabled && <col className={styles['col-acc']} />}
                                </>
                            )}
                        </colgroup>
                        <thead>
                            <tr>
                                {!apiMode && <th>Foto</th>}
                                <th>ID</th>
                                {apiMode ? (
                                    <>
                                        <th>Nombre</th>
                                        <th>Nombre cientifico</th>
                                        <th>Grupo Taxonomico</th>
                                        <th>Edad</th>
                                        <th>Sexo</th>
                                        <th>Procedencia</th>
                                        <th>Ubicacion</th>
                                        {detailsEnabled && <th>Acciones</th>}
                                    </>
                                ) : (
                                    <>
                                        <th>Nombre</th>
                                        <th>Especie</th>
                                        <th>Peso</th>
                                        <th>Edad / Sexo</th>
                                        <th>Ubicacion</th>
                                        {detailsEnabled && <th>Acciones</th>}
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((patient) => (
                                <tr key={patient.id} className={styles['patient-table-row']}>
                                    {!apiMode && (
                                        <td className={styles['table-img-cell']}>
                                            <div className={styles['table-img-wrapper']}>
                                                <img
                                                    src={patient.imageUrl || FALLBACK_IMAGE}
                                                    alt={patient.commonName || patient.name || 'Paciente'}
                                                />
                                            </div>
                                        </td>
                                    )}
                                    <td className={styles['table-id-cell']}>{patient.id}</td>
                                    {apiMode ? (
                                        <>
                                            <td className={styles['table-cell-main']}>
                                                <div className={styles['table-name']}>
                                                    {patient.name || patient.commonName || 'Sin nombre'}
                                                </div>
                                                {patient.name && patient.commonName && patient.name !== patient.commonName && (
                                                    <div className={styles['table-subtext']}>{patient.commonName}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles['table-species']}>{patient.scientificName || '—'}</div>
                                                {patient.family && <div className={styles['table-subtext']}>{patient.family}</div>}
                                            </td>
                                            <td>
                                                <div className={styles['table-species']}>{patient.taxonomicGroup || '—'}</div>
                                                {patient.grouping && (
                                                    <div className={styles['table-subtext']}>
                                                        {patient.grouping}{patient.specimenCount ? ` (${patient.specimenCount})` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles['table-age']}>{getAgeLabel(patient)}</div>
                                            </td>
                                            <td>
                                                <div className={styles['table-subtext']}>{patient.sex || '—'}</div>
                                            </td>
                                            <td>
                                                <div className={styles['table-subtext']}>{patient.procedencia || '—'}</div>
                                            </td>
                                            <td>
                                                <span className={styles['table-badge']}>{patient.location || 'Sin recinto'}</span>
                                            </td>
                                            {detailsEnabled && (
                                                <td className={styles['table-actions-cell']}>
                                                    <div className={styles['table-actions-group']}>
                                                        <button
                                                            className={styles['table-action-btn']}
                                                            title="Expediente"
                                                            onClick={() =>
                                                                navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, { state: { patient } })
                                                            }
                                                        >
                                                            <FaIdCard size={16} />
                                                        </button>
                                                        <button
                                                            className={styles['table-action-btn']}
                                                            title="Historia Clinica"
                                                            onClick={() =>
                                                                navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, {
                                                                    state: { patient, initialTab: 'history' },
                                                                })
                                                            }
                                                        >
                                                            <FaClipboardList size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <td className={styles['table-cell-main']}>
                                                <div className={styles['table-name']}>{patient.name || patient.commonName}</div>
                                                {patient.name && patient.commonName && patient.name !== patient.commonName && (
                                                    <div className={styles['table-species']}>{patient.commonName}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles['table-species']}>{patient.species || patient.scientificName || '—'}</div>
                                                <div className={styles['table-subtext']} style={{ textTransform: 'capitalize' }}>
                                                    {patient.category}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles['table-weight']}>{patient.weight ? `${patient.weight} kg` : '—'}</div>
                                            </td>
                                            <td>
                                                <div className={styles['table-age']}>{getAgeLabel(patient)}</div>
                                                <div className={styles['table-subtext']}>{patient.sex || '—'}</div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`${styles['table-badge']} ${patient.locationType === 'Cuarentena' ? styles['badge-quarantine'] : ''}`}
                                                >
                                                    {patient.location || '—'}
                                                </span>
                                            </td>
                                            {detailsEnabled && (
                                                <td className={styles['table-actions-cell']}>
                                                    <div className={styles['table-actions-group']}>
                                                        <button
                                                            className={styles['table-action-btn']}
                                                            title="Expediente"
                                                            onClick={() =>
                                                                navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, { state: { patient } })
                                                            }
                                                        >
                                                            <FaIdCard size={16} />
                                                        </button>
                                                        <button
                                                            className={styles['table-action-btn']}
                                                            title="Historia Clinica"
                                                            onClick={() =>
                                                                navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, {
                                                                    state: { patient, initialTab: 'history' },
                                                                })
                                                            }
                                                        >
                                                            <FaClipboardList size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <div className={styles['pagination-controls']}>
                        <button
                            className={styles['page-btn-nav']}
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <FaChevronLeft style={{ marginRight: '6px', fontSize: '0.8rem' }} />
                            Anterior
                        </button>

                        <div className={styles['pagination-numbers']}>
                            {getPageNumbers(currentPage, totalPages).map((pageNumber, index) => (
                                <button
                                    key={index}
                                    className={`${styles['page-btn']} ${pageNumber === currentPage ? styles.active : ''} ${pageNumber === '...' ? styles.dots : ''}`}
                                    disabled={pageNumber === '...'}
                                    onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>

                        <button
                            className={styles['page-btn-nav']}
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
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

export default PatientGrid;
