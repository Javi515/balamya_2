import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaSignOutAlt, FaUserMd } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useAlertsContext } from '../../../context/AlertsContext';
import Modal from '../../common/Modal/Modal';
import styles from './Topbar.module.css';

const Topbar = ({ toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { bellAlerts: alerts } = useAlertsContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  const closeBell = () => {
    setIsBellOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }

      if (isBellOpen && bellRef.current && !bellRef.current.contains(event.target)) {
        closeBell();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [alerts, isBellOpen]);

  const bellTypeColor = (typeKey) => {
    if (typeKey === 'critica') return '#ef4444';
    if (typeKey === 'importante') return '#f59e0b';
    return '#3b82f6';
  };

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
            paddingRight: '20px',
          }}
        >
          <div className={styles['bell-wrapper']} ref={bellRef}>
            <div
              className={styles['bell-btn']}
              onClick={() => {
                if (isBellOpen) {
                  closeBell();
                  return;
                }

                setIsBellOpen(true);
              }}
            >
              <svg className={styles['topbar-icon']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              {alerts.length > 0 && (
                <span className={styles['bell-badge']}>
                  {alerts.length > 99 ? '99+' : alerts.length}
                </span>
              )}
            </div>

            {isBellOpen && (
              <div className={styles['bell-dropdown']}>
                <div className={styles['bell-dropdown-header']}>
                  Notificaciones
                  {alerts.length > 0 && (
                    <span className={styles['bell-dropdown-count']}>{alerts.length}</span>
                  )}
                </div>

                <div className={styles['bell-dropdown-list']}>
                  {alerts.length === 0 ? (
                    <p className={styles['bell-empty']}>Sin notificaciones pendientes</p>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.key || alert.id} className={styles['bell-item']}>
                        <span
                          className={styles['bell-item-dot']}
                          style={{ backgroundColor: bellTypeColor(alert.typeKey) }}
                        />
                        <div className={styles['bell-item-content']}>
                          <div className={styles['bell-item-title']}>{alert.title}</div>
                          <div className={styles['bell-item-desc']}>{alert.description}</div>
                          <div className={styles['bell-item-time']}>Autor: {alert.author || 'Usuario'}</div>
                          <div className={styles['bell-item-time']}>
                            {alert.time || 'Ahora'} · {alert.date || 'Hoy'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div
                  className={styles['bell-dropdown-footer']}
                  onClick={() => {
                    closeBell();
                    navigate('/alerts');
                  }}
                >
                  Ver tablero de prioridades
                </div>
              </div>
            )}
          </div>

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
                  Cerrar Sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirmar Cierre de Sesion"
        footer={
          <>
            <button
              className={`${styles['btn-modal']} ${styles['btn-cancel']}`}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancelar
            </button>
            <button className={`${styles['btn-modal']} ${styles['btn-confirm']}`} onClick={confirmLogout}>
              Cerrar Sesion
            </button>
          </>
        }
      >
        <p>Estas seguro de que deseas salir del sistema?</p>
      </Modal>
    </>
  );
};

export default Topbar;
