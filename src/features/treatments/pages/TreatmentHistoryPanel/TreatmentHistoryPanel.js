import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    FaCalendarAlt,
    FaClipboardList,
    FaChevronDown,
    FaNotesMedical,
    FaPlus,
    FaSignOutAlt,
    FaSkull,
    FaStethoscope,
    FaTimes,
    FaUserMd,
    FaUsers,
} from 'react-icons/fa';
import styles from './TreatmentHistoryPanel.module.css';

const formatLongDate = (value) => {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
};

const formatShortDate = (value) => {
    if (!value) {
        return 'Pendiente';
    }

    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(`${value}T00:00:00`));
};

const toneClassMap = {
    primary: styles.timelineMarkerPrimary,
    support: styles.timelineMarkerSupport,
    warning: styles.timelineMarkerWarning,
    neutral: styles.timelineMarkerNeutral,
};

const TreatmentHistoryPanel = ({
    history,
    isOpen,
    onClose,
    onCreateRecord,
    onStartTreatment,
    record,
    photo,
    treatmentMode = 'individual',
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setIsMenuOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isMenuOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, [isMenuOpen]);

    if (!isOpen || !record || !history || typeof document === 'undefined') {
        return null;
    }

    const handleMenuAction = (callback) => {
        setIsMenuOpen(false);
        callback?.();
    };
    const isDischargedCase = record.treatmentStatus === 'alta';

    const treatmentAction =
        treatmentMode === 'group'
            ? {
                  formKey: 'groupTreatment',
                  label: 'Nuevo tratamiento grupal',
                  icon: <FaUsers />,
              }
            : {
                  formKey: 'treatment',
                  label: 'Nuevo tratamiento individual',
                  icon: <FaStethoscope />,
              };

    const clinicians = Array.from(new Set(history.events.map((event) => event.clinician).filter(Boolean)));
    const summaryCards = [
        {
            label: 'Estado del caso',
            value: history.caseStage,
            icon: <FaStethoscope />,
        },
        {
            label: 'Ultimo control',
            value: formatLongDate(history.lastUpdated),
            icon: <FaCalendarAlt />,
        },
        {
            label: isDischargedCase ? 'Fecha de alta' : 'Proxima revision',
            value: isDischargedCase
                ? formatLongDate(record.dischargeDate || history.lastUpdated)
                : formatLongDate(history.nextCheckpoint),
            icon: <FaNotesMedical />,
        },
        {
            label: 'Intervenciones',
            value: `${history.events.length} eventos`,
            icon: <FaClipboardList />,
        },
    ];

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <aside
                className={styles.panel}
                onClick={(event) => event.stopPropagation()}
                aria-modal="true"
                role="dialog"
            >
                <div className={styles.hero}>
                    <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Cerrar historial">
                        <FaTimes />
                    </button>

                    <div className={styles.identityRow}>
                        <img src={photo} alt={record.name} className={styles.photo} />
                        <div className={styles.identityCopy}>
                            <span className={styles.recordId}>{record.id}</span>
                            <h2 className={styles.title}>{record.name}</h2>
                            <p className={styles.subtitle}>{record.commonName}</p>
                            <span className={styles.caption}>{record.species}</span>
                        </div>
                    </div>

                    <div className={styles.heroAside}>
                        <div className={styles.heroActionRail}>
                            <div className={styles.recordMenuWrap} ref={menuRef}>
                                <button
                                    className={styles.recordButton}
                                    type="button"
                                    onClick={() => setIsMenuOpen((previous) => !previous)}
                                >
                                    <FaPlus /> Nuevo registro <FaChevronDown className={styles.recordButtonChevron} />
                                </button>
                                {isMenuOpen && (
                                    <div className={styles.recordMenu}>
                                        <span className={styles.recordMenuSection}>Tratamientos</span>
                                        <button
                                            className={styles.recordMenuItem}
                                            type="button"
                                            onClick={() =>
                                                handleMenuAction(() => onStartTreatment?.(treatmentAction.formKey))
                                            }
                                        >
                                            {treatmentAction.icon} {treatmentAction.label}
                                        </button>
                                        <span className={styles.recordMenuSection}>Caso actual</span>
                                        <button
                                            className={styles.recordMenuItem}
                                            type="button"
                                            onClick={() => handleMenuAction(() => onCreateRecord?.('clinicalReview', record))}
                                        >
                                            <FaNotesMedical /> Revision
                                        </button>
                                        <button
                                            className={styles.recordMenuItem}
                                            type="button"
                                            onClick={() => handleMenuAction(() => onCreateRecord?.('notificacionAlta', record))}
                                        >
                                            <FaSignOutAlt /> Alta
                                        </button>
                                        <button
                                            className={`${styles.recordMenuItem} ${styles.recordMenuItemDanger}`}
                                            type="button"
                                            onClick={() => handleMenuAction(() => onCreateRecord?.('necropsy', record))}
                                        >
                                            <FaSkull /> Registrar muerte
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.heroMeta}>
                            <span className={styles.stagePill}>{history.emphasis}</span>
                        <p className={styles.heroText}>
                            Historial clinico del caso con trazabilidad de cambios, responsables y decisiones recientes.
                        </p>
                        </div>
                    </div>
                </div>

                <div className={styles.body}>
                    <section className={styles.mainColumn}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <span className={styles.sectionEyebrow}>Linea de tiempo</span>
                                <h3 className={styles.sectionTitle}>Historial del tratamiento</h3>
                            </div>
                            <span className={styles.sectionMeta}>
                                Ultima actualizacion {formatShortDate(history.lastUpdated)}
                            </span>
                        </div>

                        <div className={styles.timeline}>
                            {history.events.map((event) => (
                                <article key={event.id} className={styles.timelineItem}>
                                    <div className={styles.timelineRail}>
                                        <span
                                            className={`${styles.timelineMarker} ${
                                                toneClassMap[event.tone] || styles.timelineMarkerNeutral
                                            }`}
                                        />
                                        <span className={styles.timelineLine} />
                                    </div>

                                    <div className={styles.timelineCard}>
                                        <div className={styles.timelineCardHeader}>
                                            <div>
                                                <span className={styles.timelineDate}>{formatLongDate(event.date)}</span>
                                                <h4 className={styles.timelineTitle}>{event.title}</h4>
                                            </div>
                                            <span className={styles.timelineType}>{event.type}</span>
                                        </div>

                                        <div className={styles.timelineDoctor}>
                                            <FaUserMd />
                                            <span>{event.clinician}</span>
                                        </div>

                                        <p className={styles.timelineText}>{event.note}</p>

                                        <div className={styles.timelineOutcome}>
                                            <span className={styles.timelineOutcomeLabel}>Resultado</span>
                                            <p>{event.outcome}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <aside className={styles.sideColumn}>
                        <div className={styles.summaryGrid}>
                            {summaryCards.map((card) => (
                                <article key={card.label} className={styles.summaryCard}>
                                    <span className={styles.summaryIcon}>{card.icon}</span>
                                    <span className={styles.summaryLabel}>{card.label}</span>
                                    <strong className={styles.summaryValue}>{card.value}</strong>
                                </article>
                            ))}
                        </div>

                        <article className={styles.noteCard}>
                            <span className={styles.noteLabel}>Objetivo actual</span>
                            <p className={styles.noteText}>{history.careObjective}</p>
                        </article>

                        <article className={styles.noteCard}>
                            <span className={styles.noteLabel}>Anamnesis vigente</span>
                            <p className={styles.noteText}>{record.anamnesis}</p>
                        </article>

                        <article className={styles.noteCard}>
                            <span className={styles.noteLabel}>Observaciones vigentes</span>
                            <p className={styles.noteText}>{record.observations}</p>
                        </article>

                        <article className={styles.teamCard}>
                            <div className={styles.teamHeader}>
                                <FaUserMd />
                                <span>Equipo clinico</span>
                            </div>
                            <div className={styles.teamList}>
                                {clinicians.map((clinician) => (
                                    <span key={clinician} className={styles.teamChip}>
                                        {clinician}
                                    </span>
                                ))}
                            </div>
                            <div className={styles.teamMeta}>
                                <span>Responsable actual</span>
                                <strong>{record.responsibleClinico}</strong>
                            </div>
                            <div className={styles.teamMeta}>
                                <span>Alta clinica</span>
                                <strong>{history.dischargeReadiness}</strong>
                            </div>
                        </article>
                    </aside>
                </div>
            </aside>
        </div>,
        document.body,
    );
};

export default TreatmentHistoryPanel;
