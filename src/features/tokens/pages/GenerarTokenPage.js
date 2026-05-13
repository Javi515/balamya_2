import React, { useState, useEffect, useRef } from 'react';
import { FaKey, FaCopy, FaClock, FaCheckCircle, FaInfoCircle, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './GenerarTokenPage.module.css';
import { getVerificationCode } from '../../../services/verificationCodeService';

const GenerarTokenPage = () => {
    const [copied, setCopied] = useState(false);
    const [tokenVisible, setTokenVisible] = useState(false);
    const [code, setCode] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const refreshTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);

    const clearTimers = () => {
        clearTimeout(refreshTimerRef.current);
        clearInterval(countdownTimerRef.current);
        refreshTimerRef.current = null;
        countdownTimerRef.current = null;
    };

    useEffect(() => {
        let active = true;

        const doFetch = async () => {
            clearTimers();
            setLoading(true);
            setError('');
            try {
                const response = await getVerificationCode();
                if (!active) return;

                const newCode = response?.codigoVerificacion ?? null;
                const segundos = Math.max(response?.expiraEnSegundos ?? 60, 1);

                setCode(newCode);
                setCountdown(segundos);

                countdownTimerRef.current = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(countdownTimerRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                refreshTimerRef.current = setTimeout(doFetch, segundos * 1000 + 500);
            } catch (err) {
                if (!active) return;
                setError(err.message || 'No se pudo obtener el código de verificación.');
                refreshTimerRef.current = setTimeout(doFetch, 10000);
            } finally {
                if (active) setLoading(false);
            }
        };

        doFetch();

        return () => {
            active = false;
            clearTimers();
        };
    }, []);

    const handleCopy = () => {
        if (code) navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const countdownColor = countdown !== null && countdown <= 10 ? '#ef4444' : '#6366f1';

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <FaKey />
                </div>
                <div>
                    <h2 className={styles.title}>Código de Verificación</h2>
                    <p className={styles.subtitle}>Genera y comparte el código que necesitan los nuevos usuarios para registrarse en BALAMYA</p>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Card principal — código */}
                <div className={styles.tokenCard}>
                    <div className={styles.tokenCardHeader}>
                        <span className={styles.tokenCardLabel}>
                            <FaShieldAlt className={styles.labelIcon} />
                            Código activo
                        </span>
                        {countdown !== null && !loading && (
                            <span className={styles.expiryBadge} style={{ color: countdownColor }}>
                                <FaClock className={styles.badgeIcon} />
                                Rota en {countdown}s
                            </span>
                        )}
                    </div>

                    {loading && (
                        <p className={styles.renewNote}>Cargando código...</p>
                    )}

                    {error && !loading && (
                        <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '1rem 0' }}>{error}</p>
                    )}

                    {!loading && !error && (
                        <>
                            <div className={styles.tokenDisplay}>
                                <code className={styles.tokenText}>
                                    {tokenVisible ? (code || '—') : '••••••'}
                                </code>
                                <button
                                    className={styles.visibilityBtn}
                                    onClick={() => setTokenVisible(v => !v)}
                                    title={tokenVisible ? 'Ocultar código' : 'Mostrar código'}
                                >
                                    {tokenVisible ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            <button
                                className={`${styles.btn} ${styles.btnCopy} ${copied ? styles.btnCopied : ''}`}
                                onClick={handleCopy}
                                disabled={!code}
                            >
                                {copied ? <FaCheckCircle /> : <FaCopy />}
                                {copied ? 'Copiado' : 'Copiar código'}
                            </button>
                        </>
                    )}
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
                                <strong>Obtén el código</strong>
                                <p>Como administrador puedes ver y copiar el código de verificación actual desde esta pantalla.</p>
                            </div>
                        </li>
                        <li className={styles.infoItem}>
                            <span className={styles.infoStep}>2</span>
                            <div>
                                <strong>Compártelo con el nuevo usuario</strong>
                                <p>El nuevo usuario necesita este código para poder completar su registro en la plataforma.</p>
                            </div>
                        </li>
                        <li className={styles.infoItem}>
                            <span className={styles.infoStep}>3</span>
                            <div>
                                <strong>Solo para administradores</strong>
                                <p>Este módulo es exclusivo del rol <code>Administrador</code>. Comparte el código únicamente con personal autorizado.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GenerarTokenPage;
