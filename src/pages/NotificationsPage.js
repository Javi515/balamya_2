import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaSearch, FaPlus, FaBell, FaExclamationCircle, FaInfoCircle, FaClock } from 'react-icons/fa';
import styles from '../styles/NotificationsPage.module.css';

const NotificationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);


    // Initial empty state as requested until user adds alerts
    const [notifications, setNotifications] = useState([]);

    const [newAlert, setNewAlert] = useState({
        title: '',
        description: '',
        type: 'Informativa', // Default
        time: '',
        date: ''
    });

    // Filter notifications based on search term
    const filteredNotifications = notifications.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.date.includes(searchTerm)
    );

    const handleAddAlert = (e) => {
        e.preventDefault();
        if (!newAlert.title || !newAlert.description) return;

        const alertToAdd = {
            id: Date.now(),
            ...newAlert,
            timestamp: new Date().toLocaleString() // creation timestamp
        };

        setNotifications([alertToAdd, ...notifications]);
        setNewAlert({ title: '', description: '', type: 'Informativa', time: '', date: '' });
        setIsModalOpen(false);
    };

    const getColumnIcon = (type) => {
        switch (type) {
            case 'Crítica': return <FaExclamationCircle color="#ef4444" />;
            case 'Importante': return <FaBell color="#f59e0b" />;
            case 'Informativa': return <FaInfoCircle color="#3b82f6" />;
            default: return null;
        }
    };

    const getCardClass = (type) => {
        switch (type) {
            case 'Crítica': return styles['card-critical'];
            case 'Importante': return styles['card-important'];
            case 'Informativa': return styles['card-informative'];
            default: return '';
        }
    };

    const renderColumn = (title, type, colorClass) => {
        const notes = filteredNotifications.filter(n => n.type === type);

        return (
            <div className={`${styles['kanban-column']} ${styles[colorClass]}`}>
                <div className={styles['column-header']}>
                    <div className={styles['column-title']}>
                        <span className={`${styles['dot']} ${styles[`${colorClass}-dot`]}`}></span>
                        {title}
                    </div>
                    <span className={styles['notification-count']}>{notes.length}</span>
                </div>

                <div className={styles['column-content']}>
                    {notes.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
                            No hay alertas {title.toLowerCase()}
                        </p>
                    ) : (
                        notes.map(note => (
                            <div key={note.id} className={`${styles['notification-card']} ${getCardClass(note.type)}`}>
                                <div className={styles['card-header']}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {/* Icon based on avatar placeholder or generic */}
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {getColumnIcon(note.type)}
                                        </div>
                                        <div>
                                            <div className={styles['card-title']}>{note.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Autor: Dr. Alejandro Vera</div>
                                        </div>
                                    </div>
                                    <span className={styles['card-time']}>{note.time || 'Ahora'}</span>
                                </div>

                                <div className={styles['card-description']}>
                                    {note.description}
                                </div>

                                <div className={styles['card-footer']}>
                                    <FaClock size={12} />
                                    <span>{note.date || 'Hoy'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles['notifications-page-container']}>
            {/* Header */}
            <div className={styles['notifications-header']}>
                <div className={styles['header-left']}>
                    <h1>Tablero de Prioridades</h1>
                    <p>Gestión de alertas clínicas y seguimiento de pacientes</p>
                </div>

                <div className={styles['header-actions']}>
                    <div className={styles['search-wrapper-alerts']}>
                        <FaSearch className={styles['search-icon-alerts']} />
                        <input
                            type="text"
                            placeholder="Buscar por fecha o contenido..."
                            className={styles['search-input-alerts']}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className={styles['btn-new-alert']} onClick={() => setIsModalOpen(true)}>
                        <FaPlus /> Nueva Alerta
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className={styles['kanban-board']}>
                {renderColumn('Críticas', 'Crítica', 'col-critical')}
                {renderColumn('Importantes', 'Importante', 'col-important')}
                {renderColumn('Informativas', 'Informativa', 'col-informative')}
            </div>

            {/* Modal Nueva Alerta */}
            {isModalOpen && ReactDOM.createPortal(
                <div className={styles['modal-overlay']} onClick={() => setIsModalOpen(false)}>
                    <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva Alerta</h2>
                        <form onSubmit={handleAddAlert}>
                            <div className={styles['form-group']}>
                                <label>Título / Paciente</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Balam - Revisión urgente"
                                    value={newAlert.title}
                                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles['form-group']}>
                                <label>Tipo de Prioridad</label>
                                <select
                                    value={newAlert.type}
                                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                                >
                                    <option value="Crítica">Crítica 🔴</option>
                                    <option value="Importante">Importante 🟠</option>
                                    <option value="Informativa">Informativa 🔵</option>
                                </select>
                            </div>

                            <div className={styles['form-group']}>
                                <label>Descripción</label>
                                <textarea
                                    placeholder="Detalles de la alerta..."
                                    value={newAlert.description}
                                    onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label>Hora</label>
                                    <input
                                        type="time"
                                        value={newAlert.time}
                                        onChange={(e) => setNewAlert({ ...newAlert, time: e.target.value })}
                                    />
                                </div>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label>Fecha</label>
                                    <input
                                        type="date"
                                        value={newAlert.date}
                                        onChange={(e) => setNewAlert({ ...newAlert, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles['modal-actions']}>
                                <button type="button" className={styles['btn-cancel']} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles['btn-save']}>Crear Alerta</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default NotificationsPage;
