import { useState, useRef, useEffect } from 'react';
import { FaPaperclip, FaFilePdf, FaFileImage, FaTimes } from 'react-icons/fa';
import { uploadArchivo, getArchivos, deleteArchivo } from '../../../services/archivosService';
import { buildUrl } from '../../../services/api';
import styles from './LabDocumentUploader.module.css';

const getFileIcon = (nombre) => {
    if ((nombre || '').toLowerCase().endsWith('.pdf'))
        return <FaFilePdf className={styles['icon-pdf']} />;
    return <FaFileImage className={styles['icon-img']} />;
};

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const LabDocumentUploader = ({ tipo, idRegistro }) => {
    const [files, setFiles] = useState([]);
    const [loadError, setLoadError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (!tipo || !idRegistro) return;
        setLoadError('');
        getArchivos(tipo, idRegistro)
            .then((response) => {
                const lista = response?.archivos || response || [];
                setFiles(
                    lista.map((a) => ({
                        id: `server-${a.id_archivo || a.idArchivo}`,
                        idArchivo: a.id_archivo || a.idArchivo,
                        nombre: a.nombre_archivo || a.nombre || a.name || 'Archivo',
                        url: a.url || a.ruta || null,
                        size: a.tamanio || a.size || null,
                        uploading: false,
                        error: null,
                    }))
                );
            })
            .catch(() => setLoadError('No se pudieron cargar los archivos existentes.'));
    }, [tipo, idRegistro]);

    const refreshFromServer = () => {
        getArchivos(tipo, idRegistro)
            .then((response) => {
                const lista = response?.archivos || response || [];
                setFiles(
                    lista.map((a) => ({
                        id: `server-${a.id_archivo || a.idArchivo}`,
                        idArchivo: a.id_archivo || a.idArchivo,
                        nombre: a.nombre_archivo || a.nombre || a.name || 'Archivo',
                        url: a.url || a.ruta || null,
                        size: a.tamanio || a.size || null,
                        uploading: false,
                        error: null,
                    }))
                );
            })
            .catch(() => {});
    };

    const handleFiles = async (incoming) => {
        for (const file of Array.from(incoming)) {
            const localId = `local-${file.name}-${Date.now()}`;
            setFiles((prev) => [
                ...prev,
                { id: localId, nombre: file.name, size: file.size, uploading: true, error: null },
            ]);

            if (tipo && idRegistro) {
                try {
                    await uploadArchivo(tipo, idRegistro, file);
                    refreshFromServer();
                } catch {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === localId ? { ...f, uploading: false, error: 'Error al subir' } : f
                        )
                    );
                }
            } else {
                setFiles((prev) =>
                    prev.map((f) => (f.id === localId ? { ...f, uploading: false } : f))
                );
            }
        }
    };

    const handleChange = (e) => {
        if (e.target.files.length) handleFiles(e.target.files);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    };

    const remove = async (item, e) => {
        e.stopPropagation();
        if (item.idArchivo) {
            try { await deleteArchivo(item.idArchivo); } catch { /* remove anyway */ }
        }
        setFiles((prev) => prev.filter((f) => f.id !== item.id));
    };

    const openFile = (item) => {
        if (item.url) window.open(buildUrl(item.url), '_blank');
    };

    return (
        <div className={styles.wrapper}>
            {loadError && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '8px' }}>{loadError}</p>
            )}
            <div
                className={styles['drop-zone']}
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <FaPaperclip className={styles['drop-icon']} />
                <span className={styles['drop-text']}>Adjuntar documentos de laboratorio</span>
                <span className={styles['drop-hint']}>PDF, JPG, PNG — clic o arrastra</span>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                className={styles.hidden}
                onChange={handleChange}
            />

            {files.length > 0 && (
                <ul className={styles['file-list']}>
                    {files.map((item) => (
                        <li
                            key={item.id}
                            className={styles['file-item']}
                            style={{ opacity: item.uploading ? 0.6 : 1, cursor: item.url ? 'pointer' : 'default' }}
                            onClick={() => !item.uploading && openFile(item)}
                        >
                            {getFileIcon(item.nombre)}
                            <div className={styles['file-info']}>
                                <span className={styles['file-name']}>{item.nombre}</span>
                                <span className={styles['file-size']}>
                                    {item.uploading
                                        ? 'Subiendo...'
                                        : item.error || formatSize(item.size)}
                                </span>
                            </div>
                            {!item.uploading && (
                                <button
                                    className={styles['remove-btn']}
                                    onClick={(e) => remove(item, e)}
                                    title="Quitar"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LabDocumentUploader;
