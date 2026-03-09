import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from '../../styles/Modal.module.css';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                    <h3 className={styles['modal-title']}>{title}</h3>
                </div>
                <div className={styles['modal-body']}>
                    {children}
                </div>
                {footer && <div className={styles['modal-footer']}>{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
