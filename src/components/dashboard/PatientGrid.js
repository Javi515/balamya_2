import React, { useState, useEffect } from 'react';
import PatientCard from './PatientCard';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaIdCard, FaClipboardList } from 'react-icons/fa';
import styles from '../../styles/PatientGrid.module.css';

const ITEMS_PER_PAGE = 10;

const PatientGrid = ({ patients, searchTerm, category, location, group, viewMode = 'grid', isCasualties = false }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredPatients, setFilteredPatients] = useState([]);

    // reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, category, location, group]);

    useEffect(() => {
        let result = patients;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.id.toLowerCase().includes(term) ||
                (p.species && p.species.toLowerCase().includes(term))
            );
        }

        // Filter by Category (if not "todos")
        if (category && category.length > 0 && !category.includes('todos')) {
            result = result.filter(p => p.category && category.includes(p.category.toLowerCase()));
        }

        // Filter by Location
        if (location && location.length > 0 && !location.includes('Todas')) {
            result = result.filter(p => location.includes(p.locationType));
        }

        // Filter by Group
        if (group && group !== 'Todos') {
            // Assuming 'group' or logic exists in patient data. 
            // If not present in mock data, this might be a placeholder or need adaptation.
            // For now checking if a 'group' property exists or ignoring if data incomplete.
            if (group === 'Grupal') {
                result = result.filter(p => p.isGroup === true);
            } else if (group === 'Individual') {
                result = result.filter(p => !p.isGroup);
            }
        }

        setFilteredPatients(result);
    }, [patients, searchTerm, category, location, group]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (filteredPatients.length === 0) {
        return (
            <div className={styles['no-results']}>
                <p>No se encontraron pacientes con los filtros seleccionados.</p>
            </div>
        );
    }

    const getPageNumbers = (currentPage, totalPages) => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div className={styles['patient-grid-container']}>
            {viewMode === 'grid' ? (
                <div className={styles['patient-grid']}>
                    {currentItems.map((patient) => (
                        <PatientCard key={patient.id} patient={patient} isCasualties={isCasualties} />
                    ))}
                </div>
            ) : (
                <div className={`${styles['table-responsive-container']} ${styles['list-view-container']}`}>
                    <table className={styles['patient-table']}>
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Especie / Categoría</th>
                                <th>Peso</th>
                                <th>Edad / Sexo</th>
                                <th>Ubicación</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((patient) => (
                                <tr key={patient.id} className={styles['patient-table-row']}>
                                    <td className={styles['table-img-cell']}>
                                        <div className={styles['table-img-wrapper']}>
                                            <img
                                                src={patient.imageUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800"}
                                                alt={patient.name}
                                            />
                                        </div>
                                    </td>
                                    <td className={styles['table-id-cell']}>{patient.id}</td>
                                    <td>
                                        <div className={styles['table-name']}>{patient.name}</div>
                                        <div className={styles['table-subtext']}>{patient.commonName}</div>
                                    </td>
                                    <td>
                                        <div className={styles['table-species']}>{patient.species}</div>
                                        <div className={styles['table-subtext']} style={{ textTransform: 'capitalize' }}>{patient.category}</div>
                                    </td>
                                    <td>
                                        <div className={styles['table-weight']}>{patient.weight ? `${patient.weight} kg` : 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div className={styles['table-age']}>{patient.age} años</div>
                                        <div className={styles['table-subtext']}>{patient.sex}</div>
                                    </td>
                                    <td>
                                        <span className={`${styles['table-badge']} ${styles[`badge-${patient.locationType === 'Cuarentena' ? 'quarantine' : 'normal'}`]}`}>
                                            {patient.location}
                                        </span>
                                    </td>
                                    <td className={styles['table-actions-cell']}>
                                        <div className="flex justify-center flex-row gap-2">
                                            <button
                                                className="bg-transparent border-none cursor-pointer p-2 rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                                                title="Expediente"
                                                onClick={() => navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`)}
                                            >
                                                <FaIdCard size={18} />
                                            </button>
                                            <button
                                                className="bg-transparent border-none cursor-pointer p-2 rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                                                title="Historia Clínica"
                                                onClick={() => navigate(`/${isCasualties ? 'casualties' : 'patients'}/${patient.id}`, { state: { initialTab: 'history' } })}
                                            >
                                                <FaClipboardList size={18} />
                                            </button>
                                        </div>
                                    </td>
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
