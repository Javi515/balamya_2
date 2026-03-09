import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserMd, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import modalStyles from '../../styles/Modal.module.css';
import styles from '../../styles/Topbar.module.css';

const Topbar = ({ toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    const overlay = document.createElement('div');
    overlay.className = 'logout-overlay';
    document.body.appendChild(overlay);
    void overlay.offsetWidth;
    overlay.classList.add('active');

    setTimeout(() => {
      logout();
      navigate('/');
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 100);
    }, 500);
  };

  return (
    <>
      <header className={styles['topbar']}>
        <div className={styles['topbar-left']}>
          <button className={styles['hamburger-menu']} onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>
        </div>
        <div
          className={styles['topbar-right']}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 1,
            paddingRight: '20px'
          }}
        >

          <svg className={styles['topbar-icon']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>

          {/* Profile icon with dropdown */}
          <div className={styles['profile-menu-wrapper']} ref={menuRef}>
            <div
              className={`${styles['profile-icon-container']} ${isMenuOpen ? styles['active'] : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className={styles['topbar-icon']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {isMenuOpen && (
              <div className={styles['profile-dropdown']}>
                <Link
                  to="/profile"
                  className={styles['profile-dropdown-item']}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserMd className={styles['dropdown-icon']} />
                  Mi Perfil
                </Link>
                <Link
                  to="/alerts"
                  className={styles['profile-dropdown-item']}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaBell className={styles['dropdown-icon']} />
                  Notificaciones
                </Link>
                <button
                  className={`${styles['profile-dropdown-item']} ${styles['logout']}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                >
                  <FaSignOutAlt className={styles['dropdown-icon']} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirmar Cierre de Sesión"
        footer={
          <>
            <button className={`${modalStyles['btn-modal']} ${modalStyles['btn-cancel']}`} onClick={() => setIsLogoutModalOpen(false)}>
              Cancelar
            </button>
            <button className={`${modalStyles['btn-modal']} ${modalStyles['btn-confirm']}`} onClick={confirmLogout}>
              Cerrar Sesión
            </button>
          </>
        }
      >
        <p>¿Está seguro de que desea salir del sistema?</p>
      </Modal>
    </>
  );
};

export default Topbar;
