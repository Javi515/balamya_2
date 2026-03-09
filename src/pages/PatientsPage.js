import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaTree, FaDove, FaFrog, FaUsers, FaUser, FaClinicMedical, FaSlidersH, FaMapMarkerAlt, FaTh, FaThList, FaTimes, FaPaw, FaFeatherAlt } from 'react-icons/fa';
import { GiSnake } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import PatientGrid from '../components/dashboard/PatientGrid';
import { patients as mockPatients } from '../data/mockData';
import styles from '../styles/PatientsPage.module.css';

const PatientsPage = () => {
  const { user, hasAccessToCategory } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // New state for toggling filters
  const [viewMode, setViewMode] = useState('grid');
  const [selectedLocations, setSelectedLocations] = useState(['Todas']);
  const [selectedSpecies, setSelectedSpecies] = useState(['todos']);
  const [selectedGroups, setSelectedGroups] = useState(['Todos']);
  const [expandedSections, setExpandedSections] = useState({
    especie: true,
    ubicacion: true,
    agrupacion: true
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Get category from URL
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');

  useEffect(() => {
    if (user && user.specialty !== 'all') {
      if (category !== user.specialty) {
        navigate(`/patients?category=${user.specialty}`, { replace: true });
      } else {
        setSelectedSpecies([category]);
      }
    }
  }, [category, user, navigate]);

  // Handle body scroll lock when filters are open
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

  // Toggle filter selections
  const toggleFilter = (value, currentValues, setValues, allValue) => {
    if (value === allValue) {
      setValues([allValue]);
      return;
    }

    let nextValues = currentValues.filter(v => v !== allValue);
    if (nextValues.includes(value)) {
      nextValues = nextValues.filter(v => v !== value);
      if (nextValues.length === 0) nextValues = [allValue];
    } else {
      nextValues.push(value);
    }
    setValues(nextValues);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isCasualtiesPage = location.pathname.startsWith('/casualties');

  let pageTitle = 'Todos los Ejemplares';
  const isAllAnimalsView = !category || category === 'todos';

  if (isCasualtiesPage) {
    pageTitle = 'Todas las Bajas';
  } else if (!isAllAnimalsView) {
    if (category === 'mamiferos') pageTitle = 'Mamíferos';
    else if (category === 'aves') pageTitle = 'Aves';
    else if (category === 'reptiles') pageTitle = 'Reptiles';
    else if (category === 'anfibios') pageTitle = 'Anfibios';
  }

  const handleSpeciesClick = (species) => {
    toggleFilter(species.toLowerCase(), selectedSpecies, setSelectedSpecies, 'todos');
  };

  return (
    <div className={styles['patients-page-container']}>
      <div className={styles['patients-page-header-row']}>
        <h1 className={styles['patients-page-title']}>{pageTitle}</h1>
        <button
          className={styles['view-toggle-btn']}
          onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          title={`Cambiar a vista de ${viewMode === 'grid' ? 'tabla' : 'tarjetas'}`}
        >
          {viewMode === 'grid' ? <FaThList /> : <FaTh />}
        </button>
      </div>

      {/* Advanced Filters via Portal to escape stacking context */}
      {createPortal(
        <>
          {/* Filters Backdrop */}
          <div
            className={`${styles['filters-backdrop']} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(false)}
          />

          {/* Advanced Filters Drawer */}
          <div className={`${styles['filters-drawer']} ${showFilters ? styles.active : ''}`}>
            <div className={styles['drawer-header']}>
              <h2>Filtros Avanzados</h2>
              <button className={styles['close-drawer-btn']} onClick={() => setShowFilters(false)}>
                <FaTimes />
              </button>
            </div>

            <div className={styles['drawer-content']}>
              {/* Especie Section */}
              <div className={styles['filter-section']}>
                <div className={styles['section-header']} onClick={() => toggleSection('especie')}>
                  <span className={styles['filter-label']}>ESPECIE</span>
                  <span className={`${styles['collapse-icon']} ${expandedSections.especie ? styles.expanded : ''}`}>▼</span>
                </div>
                {expandedSections.especie && (
                  <div className={styles['filter-options-grid']}>
                    {[
                      { id: 'todos', label: 'Todos', icon: null },
                      { id: 'mamiferos', label: 'Mamíferos', icon: <FaPaw className={styles['filter-icon']} /> },
                      { id: 'aves', label: 'Aves', icon: <FaFeatherAlt className={styles['filter-icon']} /> },
                      { id: 'reptiles', label: 'Reptiles', icon: <GiSnake className={styles['filter-icon']} /> },
                      { id: 'anfibios', label: 'Anfibios', icon: <FaFrog className={styles['filter-icon']} /> }
                    ].map((opt) => (
                      <label key={opt.id} className={`${styles['checkbox-item']} ${selectedSpecies.includes(opt.id) ? styles.active : ''} ${opt.id === 'todos' ? styles['full-width'] : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedSpecies.includes(opt.id)}
                          onChange={() => handleSpeciesClick(opt.id)}
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

              {/* Ubicación Section */}
              <div className={styles['filter-section']}>
                <div className={styles['section-header']} onClick={() => toggleSection('ubicacion')}>
                  <span className={styles['filter-label']}>UBICACIÓN</span>
                  <span className={`${styles['collapse-icon']} ${expandedSections.ubicacion ? styles.expanded : ''}`}>▼</span>
                </div>
                {expandedSections.ubicacion && (
                  <div className={styles['filter-options-grid']}>
                    {[
                      { id: 'Todas', label: 'Todas las Ubicaciones', icon: null },
                      { id: 'Cuarentena', label: 'Cuarentena', icon: <FaClinicMedical className={styles['filter-icon']} /> },
                      { id: 'Al aire libre', label: 'Al aire libre', icon: <FaTree className={styles['filter-icon']} /> },
                      { id: 'Recinto', label: 'En Recinto', icon: <FaMapMarkerAlt className={styles['filter-icon']} /> }
                    ].map((opt) => (
                      <label key={opt.id} className={`${styles['checkbox-item']} ${selectedLocations.includes(opt.id) ? styles.active : ''} ${opt.id === 'Todas' ? styles['full-width'] : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(opt.id)}
                          onChange={() => toggleFilter(opt.id, selectedLocations, setSelectedLocations, 'Todas')}
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

              {/* Agrupación Section */}
              <div className={styles['filter-section']}>
                <div className={styles['section-header']} onClick={() => toggleSection('agrupacion')}>
                  <span className={styles['filter-label']}>AGRUPACIÓN</span>
                  <span className={`${styles['collapse-icon']} ${expandedSections.agrupacion ? styles.expanded : ''}`}>▼</span>
                </div>
                {expandedSections.agrupacion && (
                  <div className={styles['filter-options-grid']}>
                    {[
                      { id: 'Todos', label: 'Todos', icon: null },
                      { id: 'Grupal', label: 'Grupal', icon: <FaUsers className={styles['filter-icon']} /> },
                      { id: 'Individual', label: 'Individual', icon: <FaUser className={styles['filter-icon']} /> }
                    ].map((opt) => (
                      <label key={opt.id} className={`${styles['checkbox-item']} ${selectedGroups.includes(opt.id) ? styles.active : ''} ${opt.id === 'Todos' ? styles['full-width'] : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(opt.id)}
                          onChange={() => toggleFilter(opt.id, selectedGroups, setSelectedGroups, 'Todos')}
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

      <div className={styles['filters-card']}>
        {/* Search Row & Toggle Button */}
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

      <PatientGrid
        patients={mockPatients}
        searchTerm={searchTerm}
        category={selectedSpecies}
        location={selectedLocations}
        group={selectedGroups}
        viewMode={viewMode}
        isCasualties={isCasualtiesPage}
      />
    </div>
  );
};

export default PatientsPage;
