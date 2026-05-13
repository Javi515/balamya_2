import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getGroupTreatments,
    getTreatmentHistory,
    getTreatmentPhoto,
    getTreatments,
} from '../../../services/treatmentsService';
import {
    getPageNumbers,
    normalizeText,
} from '../constants/treatmentConstants';

const ITEMS_PER_PAGE = 10;

const useTreatmentsView = (user) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const t = searchParams.get('tab');
        return ['individual', 'group'].includes(t) ? t : 'individual';
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [treatmentStatusFilter, setTreatmentStatusFilter] = useState('enTratamiento');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);

    const isGroupTab = activeTab === 'group';
    const canSeeAllCategories = user?.role === 'admin' || user?.specialty === 'all';

    const sourceRecords = useMemo(
        () => (isGroupTab ? getGroupTreatments() : getTreatments()),
        [isGroupTab],
    );

    const allRecords = useMemo(
        () =>
            canSeeAllCategories
                ? sourceRecords
                : sourceRecords.filter((record) => record.category === user?.specialty),
        [canSeeAllCategories, sourceRecords, user?.specialty],
    );

    const effectiveCategoryFilter = canSeeAllCategories ? categoryFilter : user?.specialty || 'Todas';

    const categoryOptions = useMemo(
        () => ['Todas', ...Array.from(new Set(allRecords.map((record) => record.category)))],
        [allRecords],
    );

    const filteredRecords = useMemo(
        () =>
            allRecords
                .filter((record) => {
                    const searchValue = normalizeText(searchTerm);
                    const matchesSearch =
                        searchValue === '' ||
                        [record.name, record.commonName, record.species, record.id, ...(record.memberPreview || [])]
                            .filter(Boolean)
                            .some((value) => normalizeText(value).includes(searchValue));
                    const matchesCategory =
                        effectiveCategoryFilter === 'Todas' || record.category === effectiveCategoryFilter;
                    const matchesTreatmentStatus = record.treatmentStatus === treatmentStatusFilter;

                    return matchesSearch && matchesCategory && matchesTreatmentStatus;
                })
                .sort((firstRecord, secondRecord) => firstRecord.name.localeCompare(secondRecord.name)),
        [allRecords, effectiveCategoryFilter, searchTerm, treatmentStatusFilter],
    );

    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const visibleStart = filteredRecords.length === 0 ? 0 : indexOfFirstItem + 1;
    const visibleEnd = Math.min(indexOfLastItem, filteredRecords.length);

    const selectedHistory = selectedHistoryRecord ? getTreatmentHistory(selectedHistoryRecord.id) : null;
    const selectedHistoryPhoto = selectedHistoryRecord
        ? getTreatmentPhoto(selectedHistoryRecord.scientificName || selectedHistoryRecord.species)
        : null;

    const resultsCountLabel = isGroupTab
        ? treatmentStatusFilter === 'alta'
            ? `${filteredRecords.length} grupos con alta`
            : `${filteredRecords.length} grupos en tratamiento`
        : treatmentStatusFilter === 'alta'
          ? `${filteredRecords.length} altas registradas`
          : `${filteredRecords.length} pacientes en tratamiento`;

    const paginationNumbers = getPageNumbers(currentPage, totalPages);

    const handleTabChange = (nextTab) => {
        setSearchParams({ tab: nextTab });
        setActiveTab(nextTab);
        setCurrentPage(1);
        setSelectedHistoryRecord(null);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (status) => {
        setTreatmentStatusFilter(status);
        setCurrentPage(1);
        setSelectedHistoryRecord(null);
    };

    const handleCategoryChange = (category) => {
        setCategoryFilter(category);
        setCurrentPage(1);
    };

    const handleOpenHistory = (record) => {
        setSelectedHistoryRecord(record);
    };

    const handleCloseHistory = () => {
        setSelectedHistoryRecord(null);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('Todas');
        setTreatmentStatusFilter('enTratamiento');
        setCurrentPage(1);
        setSelectedHistoryRecord(null);
    };

    return {
        activeTab,
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
    };
};

export default useTreatmentsView;
