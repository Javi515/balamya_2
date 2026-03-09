import React, { useRef, useState } from 'react';
import { FaUpload, FaTrash } from 'react-icons/fa';
import styles from '../../styles/ImageUploader.module.css';

const ImageUploader = ({
    initialImage = null,
    onImageUpload = null,
    placeholderText = "Subir Logo",
    className = ""
}) => {
    const [imagePreview, setImagePreview] = useState(initialImage);
    const fileInputRef = useRef(null);

    const handleContainerClick = () => {
        if (!imagePreview && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                setImagePreview(result);
                if (onImageUpload) {
                    onImageUpload(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation(); // Prevenir clic en contenedor
        setImagePreview(null);
        if (onImageUpload) onImageUpload(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    };

    return (
        <div
            className={`${styles['image-uploader-container']} ${imagePreview ? styles['has-image'] : `${styles['empty']} `} ${className}`}
            onClick={handleContainerClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {imagePreview ? (
                <>
                    <img src={imagePreview} alt="Uploaded logo" className={styles['uploaded-image']} />
                    <button
                        className={`${styles['remove-btn']} `}
                        onClick={handleRemoveImage}
                        title="Quitar imagen"
                    >
                        <FaTrash />
                    </button>
                </>
            ) : (
                <div className={`${styles['uploader-placeholder']} ${styles['']} `}>
                    <FaUpload className={styles['upload-icon']} />
                    <span className={styles['upload-text']}>{placeholderText}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
