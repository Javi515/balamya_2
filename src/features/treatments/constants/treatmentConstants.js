const CATEGORY_LABELS = {
    mamiferos: 'Mamiferos',
    aves: 'Aves',
    reptiles: 'Reptiles',
    anfibios: 'Anfibios',
};

const TREATMENT_STATUS_OPTIONS = [
    { key: 'enTratamiento', label: 'En tratamiento' },
    { key: 'alta', label: 'Altas' },
];

const normalizeText = (value = '') => String(value).trim().toLowerCase();

const getCategoryLabel = (category) => CATEGORY_LABELS[category] || category || 'Sin categoria';

const getTreatmentStatusLabel = (status) => (status === 'alta' ? 'Alta' : 'Historial');

const getPageNumbers = (page, totalPages) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let index = 1; index <= totalPages; index += 1) {
        if (index === 1 || index === totalPages || (index >= page - delta && index <= page + delta)) {
            range.push(index);
        }
    }

    for (const value of range) {
        if (last) {
            if (value - last === 2) {
                rangeWithDots.push(last + 1);
            } else if (value - last !== 1) {
                rangeWithDots.push('...');
            }
        }

        rangeWithDots.push(value);
        last = value;
    }

    return rangeWithDots;
};

export {
    CATEGORY_LABELS,
    TREATMENT_STATUS_OPTIONS,
    getCategoryLabel,
    getPageNumbers,
    getTreatmentStatusLabel,
    normalizeText,
};
