import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTh, FaThList } from 'react-icons/fa';
import styles from '../styles/MedicalHistoryPage.module.css';
import patientsStyles from '../styles/PatientsPage.module.css';
import { MOCK_HISTORY } from '../data/mockData';
import FiltersBar from '../components/common/FiltersBar';
import MedicalActivityChart from '../components/common/MedicalActivityChart';
import RecordsTable from '../components/common/RecordsTable';

const MedicalHistoryPage = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // Default to grid

  // Set initial category based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.specialty === 'all') {
        setSelectedCategory('all');
      } else {
        setSelectedCategory(user.specialty);
      }
    }
  }, [user]);

  // Filter Logic
  useEffect(() => {
    let results = MOCK_HISTORY;

    // 1. Filter by Category (Strict)
    if (selectedCategory !== 'all') {
      results = results.filter(record => record.category === selectedCategory);
    } else if (user && user.specialty !== 'all') {
      results = results.filter(record => record.category === user.specialty);
    }

    // 2. Filter by Format Type
    if (selectedType !== 'all') {
      results = results.filter(record => record.type.includes(selectedType));
    }

    // 3. Filter by Date
    if (selectedDate) {
      results = results.filter(record => record.date === selectedDate);
    }

    // 4. Filter by Location
    if (selectedLocation !== 'all') {
      results = results.filter(record => record.location === selectedLocation);
    }

    // 5. Filter by Doctor
    if (selectedDoctor !== 'all') {
      results = results.filter(record => record.doctor === selectedDoctor);
    }

    // 6. Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(record =>
        record.name.toLowerCase().includes(lowerTerm) ||
        record.commonName.toLowerCase().includes(lowerTerm) ||
        record.scientificName.toLowerCase().includes(lowerTerm) ||
        record.id.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredRecords(results);
  }, [selectedCategory, selectedType, selectedDate, selectedLocation, selectedDoctor, searchTerm, user]);

  return (
    <div className={styles['medical-history-container']}>
      <div className={patientsStyles['patients-page-header-row']} style={{ padding: '0 24px', marginBottom: '12px' }}>
        <div>
          <h1 className={styles['medical-history-title']} style={{ margin: 0 }}>Historial Clínico</h1>
          <p className={styles['medical-history-subtitle']} style={{ margin: 0, marginTop: '4px' }}>Gestión integral de expedientes médicos de la colección animal.</p>
        </div>
        <button
          className={patientsStyles['view-toggle-btn']}
          onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          title={`Cambiar a vista de ${viewMode === 'grid' ? 'tabla' : 'tarjetas'}`}
        >
          {viewMode === 'grid' ? <FaThList /> : <FaTh />}
        </button>
      </div>

      <FiltersBar
        user={user}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${viewMode === 'table' ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <MedicalActivityChart records={filteredRecords} />
      </div>

      <RecordsTable
        records={filteredRecords}
        viewMode={viewMode}
      />
    </div>
  );
};

export default MedicalHistoryPage;
