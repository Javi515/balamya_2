import React from 'react';
import { FaEye, FaHospitalAlt } from 'react-icons/fa';
import styles from './TreatmentCard.module.css';

const TreatmentCard = ({ record, isGroup, getPhoto, getCategoryLabel, getStatusLabel, onOpenHistory }) => (
    <article className={styles.caseCard}>
        {record.hospitalizacionId && (
            <div className={styles.hospBadge}>
                <FaHospitalAlt /> Hospitalizado
            </div>
        )}
        <div className={styles.cardHeader}>
            <div className={styles.patientIdentity}>
                <img
                    src={getPhoto(record.scientificName || record.species)}
                    alt={record.name}
                    className={styles.patientPhoto}
                />
                <div className={styles.patientInfo}>
                    <span className={styles.patientId}>{record.id}</span>
                    <h2 className={styles.patientName}>{record.name}</h2>
                    <p className={styles.patientType}>
                        {isGroup ? getCategoryLabel(record.category) : record.commonName}
                    </p>
                    <span className={styles.patientScientific}>
                        {isGroup ? `${record.memberCount} ejemplares en el grupo` : record.species}
                    </span>
                </div>
            </div>
        </div>

        <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
                <span className={styles.contentLabel}>Anamnesis</span>
                <p className={styles.contentText}>{record.anamnesis}</p>
            </div>
            <div className={styles.contentCard}>
                <span className={styles.contentLabel}>Observaciones</span>
                <p className={styles.contentText}>{record.observations}</p>
            </div>
        </div>

        <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{isGroup ? 'Inicio' : 'Ingreso'}</span>
                <span className={styles.detailValue}>{record.admissionDate}</span>
            </div>
            <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Categoria</span>
                <span className={styles.detailValue}>{getCategoryLabel(record.category)}</span>
            </div>
            <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Responsable clinico</span>
                <span className={styles.detailValue}>{record.responsibleClinico}</span>
            </div>
        </div>

        {isGroup && (
            <div className={styles.memberList}>
                {(record.memberPreview || []).map((member) => (
                    <span key={member} className={styles.memberChip}>{member}</span>
                ))}
            </div>
        )}

        <div className={styles.actionRow}>
            <button
                className={`${styles.actionButton} ${record.treatmentStatus === 'alta' ? styles.actionButtonAlta : ''}`}
                title={record.treatmentStatus === 'alta' ? 'Ver alta' : 'Historial clinico'}
                onClick={() => onOpenHistory(record)}
            >
                <FaEye /> {getStatusLabel(record.treatmentStatus)}
            </button>
        </div>
    </article>
);

export default TreatmentCard;
