import React, { useState } from 'react';
import { FaKey, FaCopy, FaClock, FaCheckCircle, FaInfoCircle, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './GenerarTokenPage.module.css';

// TODO: reemplazar con fetch al backend
const MOCK_TOKEN = 'BLM-X7K2P9';
const MOCK_EXPIRES = new Date(Date.now() + 24 * 60 * 60 * 1000);

const GenerarTokenPage = () => {
    const [copied, setCopied] = useState(false);
    const [tokenVisible, setTokenVisible] = useState(false);

    // TODO: const { token, expiresAt } = await fetch('/api/tokens/current', { headers: { Authorization: ... } })
    const token = MOCK_TOKEN;
    const expiresAt = MOCK_EXPIRES;

    const handleCopy = () => {
        // TODO: descomentar cuando el token sea real
        // navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const expiresFormatted = expiresAt.toLocaleString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <FaKey />
                </div>
                <div>
                    <h2 className={styles.title}>Token de Acceso</h2>
                    <p className={styles.subtitle}>Gestiona el token de autenticación para integraciones externas con BALAMYA</p>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Card principal — token */}
                <div className={styles.tokenCard}>
                    <div className={styles.tokenCardHeader}>
                        <span className={styles.tokenCardLabel}>
                            <FaShieldAlt className={styles.labelIcon} />
                            Token activo
                        </span>
                        <span className={styles.expiryBadge}>
                            <FaClock className={styles.badgeIcon} />
                            Expira: {expiresFormatted}
                        </span>
                    </div>

                    <div className={styles.tokenDisplay}>
                        <code className={styles.tokenText}>
                            {tokenVisible ? token : '••••••••••'}
                        </code>
                        <button
                            className={styles.visibilityBtn}
                            onClick={() => setTokenVisible(v => !v)}
                            title={tokenVisible ? 'Ocultar token' : 'Mostrar token'}
                        >
                            {tokenVisible ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <p className={styles.renewNote}>El token se renueva automáticamente cada 24 horas.</p>

                    <button
                        className={`${styles.btn} ${styles.btnCopy} ${copied ? styles.btnCopied : ''}`}
                        onClick={handleCopy}
                    >
                        {copied ? <FaCheckCircle /> : <FaCopy />}
                        {copied ? 'Copiado' : 'Copiar token'}
                    </button>
                </div>

                {/* Card informativa */}
                <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>
                        <FaInfoCircle className={styles.infoIcon} />
                        ¿Cómo funciona?
                    </h3>
                    <ul className={styles.infoList}>
                        <li className={styles.infoItem}>
                            <span className={styles.infoStep}>1</span>
                            <div>
                                <strong>Copia el token</strong>
                                <p>Úsalo en el header de tus peticiones como <code>Authorization: Bearer &lt;token&gt;</code></p>
                            </div>
                        </li>
                        <li className={styles.infoItem}>
                            <span className={styles.infoStep}>2</span>
                            <div>
                                <strong>Vigencia de 24 horas</strong>
                                <p>El token expira automáticamente y se genera uno nuevo cada día.</p>
                            </div>
                        </li>
                        <li className={styles.infoItem}>
                            <span className={styles.infoStep}>3</span>
                            <div>
                                <strong>Solo para administradores</strong>
                                <p>Este módulo es exclusivo del rol <code>Administradores</code>. No compartas el token.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GenerarTokenPage;
