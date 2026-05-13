import React from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from '../../pages/TreatmentsPage/TreatmentsPage.module.css';
import { TREATMENT_STATUS_OPTIONS } from '../../constants/treatmentConstants';

const TreatmentsFilters = ({
    canSeeAllCategories,
    categoryFilter,
    categoryOptions,
    getCategoryLabel,
    isGroupTab,
    onCategoryChange,
    onSearchChange,
    onStatusChange,
    resultsCountLabel,
    searchTerm,
    treatmentStatusFilter,
    visibleEnd,
    visibleStart,
    totalResults,
}) => (
    <>
        <section className={styles.toolbar}>
            <label className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={isGroupTab ? 'Buscar por grupo, especie o integrante' : 'Buscar por nombre, especie o ID'}
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </label>
        </section>

        <section className={styles.statusRow}>
            {TREATMENT_STATUS_OPTIONS.map((option) => (
                <button
                    key={option.key}
                    className={`${styles.statusChip} ${
                        treatmentStatusFilter === option.key
                            ? option.key === 'alta'
                                ? styles.statusChipAltaActive
                                : styles.statusChipActive
                            : ''
                    }`}
                    onClick={() => onStatusChange(option.key)}
                >
                    {option.label}
                </button>
            ))}
        </section>

        {canSeeAllCategories && (
            <section className={styles.categoryRow}>
                {categoryOptions.map((option) => (
                    <button
                        key={option}
                        className={`${styles.categoryChip} ${categoryFilter === option ? styles.categoryChipActive : ''}`}
                        onClick={() => onCategoryChange(option)}
                    >
                        {option === 'Todas' ? option : getCategoryLabel(option)}
                    </button>
                ))}
            </section>
        )}

        <section className={styles.resultsBar}>
            <div>
                <span className={styles.resultsCount}>{resultsCountLabel}</span>
                <p className={styles.resultsMeta}>
                    Mostrando {visibleStart}-{visibleEnd} de {totalResults} registros
                </p>
            </div>
            <p className={styles.resultsHint}>
                Cada tarjeta abre el historial clinico y desde ahi puedes continuar con nuevos registros.
            </p>
        </section>
    </>
);

export default TreatmentsFilters;
