import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patients } from '../../data/mockData';
import { FaSearch, FaPaw, FaVenusMars, FaWeight, FaBirthdayCake, FaMapMarkerAlt, FaTree, FaDove, FaFrog } from 'react-icons/fa';
import { GiLion, GiTortoise } from 'react-icons/gi';
import styles from '../../styles/AnimalSelector.module.css';

const AnimalSelector = ({ onSelect }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('Todos');
    const [selectedLocation, setSelectedLocation] = useState('Todas');
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        if (!user) return;

        let result = patients;

        // 1. Filter by User Specialty (Context Level)
        if (user.role !== 'admin' && user.specialty !== 'all') {
            result = result.filter(p => p.category.toLowerCase() === user.specialty.toLowerCase());
        }

        // 2. Filter by Species (UI Level)
        if (selectedSpecies !== 'Todos') {
            // Basic mapping for demo purposes. 
            // In a real app, you might map 'Mamíferos' -> 'mamiferos' more robustly.
            // Based on mockData, 'category' is lowercase 'mamiferos', 'aves', etc.
            // And 'species' field is specific 'León', 'Tigre'.
            // PatientsPage uses categories for these buttons.

            const categoryMap = {
                'Mamíferos': 'mamiferos',
                'Aves': 'aves',
                'Reptiles': 'reptiles',
                'Anfibios': 'anfibios'
            };

            const targetCategory = categoryMap[selectedSpecies];
            if (targetCategory) {
                result = result.filter(p => p.category === targetCategory);
            }
        }

        // 3. Filter by Location
        if (selectedLocation !== 'Todas') {
            // Match logic from PatientsPage (simplified validation)
            if (selectedLocation === 'Cuarentena') {
                result = result.filter(p => p.locationType === 'Cuarentena' || p.isQuarantine);
            } else if (selectedLocation === 'Al aire libre') {
                result = result.filter(p => p.locationType === 'Al aire libre');
            }
        }

        // 4. Filter by Search Term
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.commonName.toLowerCase().includes(lowerSearch) ||
                p.id.toLowerCase().includes(lowerSearch) ||
                p.scientificName.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredPatients(result);
    }, [user, searchTerm, selectedSpecies, selectedLocation]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className={styles['animal-selector-container']}>
            <div className={styles['animal-selector-header']}>
                <h2>Selecciona un Ejemplar</h2>
                <p>Busca y selecciona el paciente para acceder a sus herramientas clínicas.</p>
            </div>

            <div className={styles['animal-selector-controls']}>

                {/* Search Bar - Full Width on Mobile, Auto on Desktop */}
                <div className={styles['search-input-wrapper']}>
                    <FaSearch className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ID, especie..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Filters - Only show if User is Admin or has 'all' access, 
                    OR (optional) always show if we want to filter within specialty? 
                    PatientsPage shows them for 'all'. Let's follow that. */}
                {(user?.role === 'admin' || user?.specialty === 'all') && (
                    <div className={styles['filter-chips-row']}>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'Todos' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('Todos')}
                        >
                            Todos
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'Mamíferos' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('Mamíferos')}
                        >
                            <GiLion /> Mamíferos
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'Aves' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('Aves')}
                        >
                            <FaDove /> Aves
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'Reptiles' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('Reptiles')}
                        >
                            <GiTortoise /> Reptiles
                        </button>
                        <button
                            className={`${styles['filter-chip-mini']} ${selectedSpecies === 'Anfibios' ? styles.active : ''}`}
                            onClick={() => setSelectedSpecies('Anfibios')}
                        >
                            <FaFrog /> Anfibios
                        </button>
                    </div>
                )}
            </div>

            <div className={styles['animal-grid']}>
                {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                        <div key={patient.id} className={styles['animal-card']} onClick={() => onSelect(patient)}>
                            <div className={styles['animal-card-image']}>
                                <img
                                    src={patient.imageUrl || 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800'}
                                    alt={patient.name}
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800'; }}
                                />
                                <div className={styles['animal-status-badge']} data-status={patient.status}>
                                    {patient.status}
                                </div>
                            </div>
                            <div className={styles['animal-card-details']}>
                                <div className={styles['animal-name-row']}>
                                    <h3>{patient.commonName || 'Sin Nombre Común'}</h3>
                                    <span className={styles['animal-id']}>{patient.id}</span>
                                </div>
                                <p className={styles['animal-scientific-name']}>{patient.scientificName}</p>

                                <div className={styles['animal-info-grid']}>
                                    <div className={styles['info-item']}>
                                        <FaVenusMars /> {patient.sex}
                                    </div>
                                    <div className={styles['info-item']}>
                                        <FaBirthdayCake /> {patient.age} años
                                    </div>
                                    <div className={styles['info-item']}>
                                        <FaWeight /> {patient.weight} kg
                                    </div>
                                </div>
                                <div className={styles['animal-location']}>
                                    <FaMapMarkerAlt /> {patient.location}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles['no-results']}>
                        <FaPaw className={styles['no-results-icon']} />
                        <p>No se encontraron pacientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimalSelector;
