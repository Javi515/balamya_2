import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { getTreatmentPhoto } from '../../../../services/treatmentsService';
import TreatmentCard from '../../components/TreatmentCard/TreatmentCard';
import TreatmentsFilters from '../../components/TreatmentsFilters/TreatmentsFilters';
import TreatmentsHero from '../../components/TreatmentsHero/TreatmentsHero';
import TreatmentsPagination from '../../components/TreatmentsPagination/TreatmentsPagination';
import {
    getCategoryLabel,
    getTreatmentStatusLabel,
} from '../../constants/treatmentConstants';
import useTreatmentsView from '../../hooks/useTreatmentsView';
import styles from './TreatmentsPage.module.css';
import TreatmentHistoryPanel from '../TreatmentHistoryPanel/TreatmentHistoryPanel';

const TreatmentsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        canSeeAllCategories,
        categoryFilter,
        categoryOptions,
        currentItems,
        currentPage,
        filteredRecords,
        handleCategoryChange,
        handleCloseHistory,
        handleOpenHistory,
        handleSearchChange,
        handleStatusChange,
        handleTabChange,
        isGroupTab,
        paginationNumbers,
        resetFilters,
        resultsCountLabel,
        searchTerm,
        selectedHistory,
        selectedHistoryPhoto,
        selectedHistoryRecord,
        setCurrentPage,
        totalPages,
        treatmentStatusFilter,
        visibleEnd,
        visibleStart,
    } = useTreatmentsView(user);

    const handleOpenForm = (formKey, patient) => {
        const patientLookupId = patient.formPatientId || patient.id;
        const queryParams = new URLSearchParams({
            form: formKey,
            animalName: patientLookupId,
            origin: 'treatments',
            patientId: patientLookupId,
        }).toString();

        navigate(`/forms?${queryParams}`);
    };

    const handleStartTreatment = (formKey) => {
        const queryParams = new URLSearchParams({
            form: formKey,
            origin: 'treatments',
            selectAnimal: 'true',
        }).toString();

        navigate(`/forms?${queryParams}`);
    };

    const handleCreateRecord = () => {
        handleStartTreatment(isGroupTab ? 'groupTreatment' : 'treatment');
    };

    return (
        <div className={styles.page}>
            <TreatmentsHero
                isGroupTab={isGroupTab}
                onCreateRecord={handleCreateRecord}
                onSelectTab={handleTabChange}
            />

            <TreatmentsFilters
                canSeeAllCategories={canSeeAllCategories}
                categoryFilter={categoryFilter}
                categoryOptions={categoryOptions}
                getCategoryLabel={getCategoryLabel}
                isGroupTab={isGroupTab}
                onCategoryChange={handleCategoryChange}
                onSearchChange={handleSearchChange}
                onStatusChange={handleStatusChange}
                resultsCountLabel={resultsCountLabel}
                searchTerm={searchTerm}
                totalResults={filteredRecords.length}
                treatmentStatusFilter={treatmentStatusFilter}
                visibleEnd={visibleEnd}
                visibleStart={visibleStart}
            />

            {currentItems.length > 0 ? (
                <section className={styles.cardsGrid}>
                    {currentItems.map((record) => (
                        <TreatmentCard
                            key={record.id}
                            record={record}
                            isGroup={isGroupTab}
                            getPhoto={getTreatmentPhoto}
                            getCategoryLabel={getCategoryLabel}
                            getStatusLabel={getTreatmentStatusLabel}
                            onOpenHistory={handleOpenHistory}
                        />
                    ))}
                </section>
            ) : (
                <section className={styles.emptyState}>
                    <h2>No hay registros con esos filtros</h2>
                    <p>
                        Prueba con otra busqueda o restablece el tablero para ver nuevamente todos los tratamientos.
                    </p>
                    <button className={styles.secondaryButton} onClick={resetFilters}>
                        Limpiar filtros
                    </button>
                </section>
            )}

            <TreatmentsPagination
                currentPage={currentPage}
                pageNumbers={paginationNumbers}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
            />

            <TreatmentHistoryPanel
                history={selectedHistory}
                isOpen={Boolean(selectedHistoryRecord)}
                onClose={handleCloseHistory}
                onCreateRecord={handleOpenForm}
                onStartTreatment={handleStartTreatment}
                photo={selectedHistoryPhoto}
                record={selectedHistoryRecord}
                treatmentMode={isGroupTab ? 'group' : 'individual'}
            />
        </div>
    );
};

export default TreatmentsPage;
