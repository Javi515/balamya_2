import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '../../pages/TreatmentsPage/TreatmentsPage.module.css';

const TreatmentsPagination = ({ currentPage, pageNumbers, setCurrentPage, totalPages }) => (
    <div className={styles.pagination}>
        <div className={styles.paginationControls}>
            <button
                className={styles.pageNav}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
            >
                <FaChevronLeft /> Anterior
            </button>

            {pageNumbers.map((pageNumber, index) => (
                <button
                    key={`${pageNumber}-${index}`}
                    className={`${styles.pageButton} ${pageNumber === currentPage ? styles.pageButtonActive : ''} ${
                        pageNumber === '...' ? styles.pageButtonDots : ''
                    }`}
                    disabled={pageNumber === '...'}
                    onClick={() => pageNumber !== '...' && setCurrentPage(pageNumber)}
                >
                    {pageNumber}
                </button>
            ))}

            <button
                className={styles.pageNav}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages))}
            >
                Siguiente <FaChevronRight />
            </button>
        </div>
    </div>
);

export default TreatmentsPagination;
