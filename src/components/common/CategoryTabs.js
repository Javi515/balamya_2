import React from 'react';
import { FaBox, FaCrow, FaBug, FaPaw, FaTint } from 'react-icons/fa';
import styles from '../../styles/CategoryTabs.module.css';

const CategoryTabs = ({ user, selectedCategory, onSelectCategory }) => {
    // Only render if user is admin or has access to all
    if (!(user?.role === 'admin' || user?.specialty === 'all')) {
        return null;
    }

    return (
        <div className={styles['category-tabs']}>
            <div
                className={`${styles['category-tab']} ${styles['tab-all']} ${selectedCategory === 'all' ? styles['active'] : ''}`}
                onClick={() => onSelectCategory('all')}
            >
                <div className={styles['tab-icon-circle']}><FaBox /></div>
                <label>TODOS</label>
            </div>
            <div
                className={`${styles['category-tab']} ${styles['tab-aves']} ${selectedCategory === 'aves' ? styles['active'] : ''}`}
                onClick={() => onSelectCategory('aves')}
            >
                <div className={styles['tab-icon-circle']}><FaCrow /></div>
                <label>AVES</label>
            </div>
            <div
                className={`${styles['category-tab']} ${styles['tab-reptiles']} ${selectedCategory === 'reptiles' ? styles['active'] : ''}`}
                onClick={() => onSelectCategory('reptiles')}
            >
                <div className={styles['tab-icon-circle']}><FaBug /></div>
                <label>REPTILES</label>
            </div>
            <div
                className={`${styles['category-tab']} ${styles['tab-mamiferos']} ${selectedCategory === 'mamiferos' ? styles['active'] : ''}`}
                onClick={() => onSelectCategory('mamiferos')}
            >
                <div className={styles['tab-icon-circle']}><FaPaw /></div>
                <label>MAMÍFEROS</label>
            </div>
            <div
                className={`${styles['category-tab']} ${styles['tab-anfibios']} ${selectedCategory === 'anfibios' ? styles['active'] : ''}`}
                onClick={() => onSelectCategory('anfibios')}
            >
                <div className={styles['tab-icon-circle']}><FaTint /></div>
                <label>ANFIBIOS</label>
            </div>
        </div>
    );
};

export default CategoryTabs;
