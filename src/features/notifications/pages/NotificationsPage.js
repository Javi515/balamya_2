import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    FaBell,
    FaClock,
    FaExclamationCircle,
    FaInfoCircle,
    FaPlus,
    FaSearch,
} from 'react-icons/fa';
import styles from './NotificationsPage.module.css';
import { useAlertsContext } from '../../../context/AlertsContext';

const PRIORITY_OPTIONS = [
    { value: 'Cr\u00EDtica', label: 'Critica', color: 'priority-critica' },
    { value: 'Importante', label: 'Importante', color: 'priority-importante' },
    { value: 'Informativa', label: 'Informativa', color: 'priority-informativa' },
];

const getLocalDateValue = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getNextMinuteValue = (date = new Date()) => {
    const nextMinute = new Date(date.getTime());
    nextMinute.setSeconds(0, 0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);

    const hours = String(nextMinute.getHours()).padStart(2, '0');
    const minutes = String(nextMinute.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
};

const parseScheduledDate = (date, time) => {
    if (!date || !time) return null;

    const scheduledDate = new Date(`${date}T${time}:00`);
    return Number.isNaN(scheduledDate.getTime()) ? null : scheduledDate;
};

const NotificationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { alerts: notifications, loading, addAlert, deleteAlert, refreshAlerts } = useAlertsContext();
    const [newAlert, setNewAlert] = useState({
        title: '',
        description: '',
        type: 'Informativa',
        time: '',
        date: '',
    });
    const now = new Date();
    const minDate = getLocalDateValue(now);
    const minTimeForSelectedDate = newAlert.date === minDate ? getNextMinuteValue(now) : undefined;
    const scheduledDate = parseScheduledDate(newAlert.date, newAlert.time);
    const hasScheduledDateError = Boolean(
        newAlert.date && newAlert.time && (!scheduledDate || scheduledDate.getTime() <= now.getTime()),
    );

    useEffect(() => {
        refreshAlerts?.(true);
    }, []);

    const filteredNotifications = notifications.filter((note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleAddAlert = async (event) => {
        event.preventDefault();

        if (!newAlert.title || !newAlert.description || !newAlert.time || !newAlert.date) {
            setFormError('Completa todos los campos antes de crear la alerta.');
            return;
        }

        if (hasScheduledDateError) {
            setFormError('La alerta debe programarse con una hora futura.');
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError('');
            await addAlert(newAlert);
            setNewAlert({
                title: '',
                description: '',
                type: 'Informativa',
                time: '',
                date: '',
            });
            setIsModalOpen(false);
        } catch (error) {
            setFormError(error.message || 'No se pudo crear la alerta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetModal = () => {
        setIsModalOpen(false);
        setFormError('');
        setIsSubmitting(false);
    };

    const updateNewAlert = (field, value) => {
        setFormError('');
        setNewAlert((currentAlert) => ({
            ...currentAlert,
            [field]: value,
        }));
    };

    const getColumnIcon = (typeKey) => {
        if (typeKey === 'critica') return <FaExclamationCircle color="#ef4444" />;
        if (typeKey === 'importante') return <FaBell color="#f59e0b" />;
        return <FaInfoCircle color="#3b82f6" />;
    };

    const getCardClass = (typeKey) => {
        if (typeKey === 'critica') return styles['card-critical'];
        if (typeKey === 'importante') return styles['card-important'];
        if (typeKey === 'informativa') return styles['card-informative'];
        return '';
    };

    const renderColumn = (title, typeKey, colorClass) => {
        const notes = filteredNotifications.filter((note) => note.typeKey === typeKey);

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
                        <p
                            style={{
                                color: '#9ca3af',
                                fontSize: '0.9rem',
                                textAlign: 'center',
                                marginTop: '20px',
                            }}
                        >
                            No hay alertas {title.toLowerCase()}
                        </p>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.key || note.id}
                                className={`${styles['notification-card']} ${getCardClass(note.typeKey)}`}
                            >
                                <div className={styles['card-header']}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                backgroundColor: '#e5e7eb',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {getColumnIcon(note.typeKey)}
                                        </div>
                                        <div>
                                            <div className={styles['card-title']}>{note.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                Autor: {note.author || 'Usuario'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className={styles['card-time']}>{note.time || 'Ahora'}</span>
                                    </div>
                                </div>

                                <div className={styles['card-description']}>{note.description}</div>

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
            <div className={styles['notifications-header']}>
                <div className={styles['header-left']}>
                    <h1>Tablero de Prioridades</h1>
                    <p>Gestion de alertas clinicas y seguimiento de pacientes</p>
                </div>

                <div className={styles['header-actions']}>
                    <div className={styles['search-wrapper-alerts']}>
                        <FaSearch className={styles['search-icon-alerts']} />
                        <input
                            type="text"
                            placeholder="Buscar por titulo..."
                            className={styles['search-input-alerts']}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <button
                        className={styles['btn-new-alert']}
                        onClick={() => {
                            setFormError('');
                            setIsSubmitting(false);
                            setIsModalOpen(true);
                        }}
                    >
                        <FaPlus /> Nueva Alerta
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles['notifications-loading']}>
                    <div className={styles['loading-spinner']} />
                    <p className={styles['loading-text']}>Cargando notificaciones...</p>
                </div>
            ) : (
                <div className={styles['kanban-board']}>
                    {renderColumn('Criticas', 'critica', 'col-critical')}
                    {renderColumn('Importantes', 'importante', 'col-important')}
                    {renderColumn('Informativas', 'informativa', 'col-informative')}
                </div>
            )}

            {isModalOpen && ReactDOM.createPortal(
                <div className={styles['modal-overlay']} onClick={resetModal}>
                    <div className={styles['modal-content']} onClick={(event) => event.stopPropagation()}>
                        <div className={styles['modal-header']}>
                            <div>
                                <h2>Nueva Alerta</h2>
                                <p className={styles['modal-subtitle']}>
                                    Completa los campos para programar una alerta
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles['modal-close-btn']}
                                onClick={resetModal}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleAddAlert}>
                            <div className={styles['form-group']}>
                                <label>Titulo / Paciente</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Balam - Revision urgente"
                                    value={newAlert.title}
                                    onChange={(event) => updateNewAlert('title', event.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles['form-group']}>
                                <label>Tipo de Prioridad</label>
                                <div className={styles['priority-selector']}>
                                    {PRIORITY_OPTIONS.map(({ value, label, color }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`${styles['priority-btn']} ${styles[color]} ${newAlert.type === value ? styles['priority-active'] : ''}`}
                                            onClick={() => updateNewAlert('type', value)}
                                        >
                                            <span className={styles['priority-dot']} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles['form-group']}>
                                <label>Descripcion</label>
                                <textarea
                                    placeholder="Detalles de la alerta..."
                                    value={newAlert.description}
                                    onChange={(event) => updateNewAlert('description', event.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles['time-date-row']}>
                                <div className={styles['form-group']}>
                                    <label>Hora programada</label>
                                    <input
                                        type="time"
                                        value={newAlert.time}
                                        onChange={(event) => updateNewAlert('time', event.target.value)}
                                        style={{ color: newAlert.time ? 'inherit' : 'transparent' }}
                                        min={minTimeForSelectedDate}
                                        required
                                    />
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Fecha programada</label>
                                    <input
                                        type="date"
                                        value={newAlert.date}
                                        onChange={(event) => updateNewAlert('date', event.target.value)}
                                        style={{ color: newAlert.date ? 'inherit' : 'transparent' }}
                                        min={minDate}
                                        required
                                    />
                                </div>
                            </div>

                            {(formError || hasScheduledDateError) && (
                                <p className={styles['form-error']}>
                                    {formError || 'La alerta debe programarse con una hora futura.'}
                                </p>
                            )}

                            <div className={styles['modal-actions']}>
                                <button
                                    type="button"
                                    className={styles['btn-cancel']}
                                    onClick={resetModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles['btn-save']}
                                    disabled={isSubmitting || hasScheduledDateError}
                                >
                                    {isSubmitting ? 'Creando...' : 'Crear Alerta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
};

export default NotificationsPage;
