import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaBell,
    FaCamera,
    FaShare,
    FaEdit,
    FaEnvelope,
    FaPhone,
    FaCertificate,
    FaGraduationCap,
    FaCalendarAlt,
    FaLock,
    FaGlobe,
    FaChevronRight,
    FaSignOutAlt,
    FaNotesMedical,
    FaExclamationTriangle,
    FaCog,
    FaHistory,
    FaStickyNote,
    FaPenNib
} from 'react-icons/fa';
import { MdPlace, MdBadge, MdTrendingUp } from 'react-icons/md';

import pageStyles from '../styles/ProfilePage.module.css';
import headerStyles from '../styles/ProfileHeader.module.css';
import heroStyles from '../styles/ProfileHero.module.css';
import statsStyles from '../styles/ProfileStats.module.css';
import settingsStyles from '../styles/ProfileSettings.module.css';

const styles = Object.assign({}, pageStyles, headerStyles, heroStyles, statsStyles, settingsStyles);

const ProfilePage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const confirmLogout = () => {
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
        <div className={styles['profile-page-container']}>
            {/* Main Profile Content */}
            <main className={styles['profile-main']}>
                <h2 className={styles['profile-page-title']} style={{ marginBottom: '20px' }}>Perfil de Usuario</h2>
                <div className={styles['profile-content-wrapper']}>

                    {/* Hero Card */}
                    <div className={styles['profile-hero-card']}>
                        <div className={styles['hero-banner']}></div>
                        <div className={styles['hero-content']}>
                            <div className={styles['profile-avatar-container']}>
                                <div className={styles['profile-avatar-large']}>
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjfRZ3q9uYGH-kgN8cgEX9FC3N2lKsw19D3gKe-cirCL8TLeYtqMW0s_ZKLo2PMQT4-ktj3SYJmxoiIwuzWS9SO1NExx6cFBUfqmz7Baf4hcP-OiKDdZ2seuAV9Z1m6Yo-XC9VxGmNPWfPbhpH7aVeNQrlvuQ_rwKF-Cki5dlwgEnlBvyqP_g1cZN3Gk-Buy64WDQ9e03Zjjmy47RYdv__X_9VvdHGOOW63Yc_Ep6roe_1hyp7ygvsnG_jHyu_GW0zouD_lcB12_Q" alt="Dr. Alejandro Vera" />
                                </div>
                                <button className={styles['camera-btn']} title="Cambiar Foto">
                                    <FaCamera size={14} />
                                </button>
                            </div>

                            <div className={styles['hero-text']}>
                                <h1 className={styles['hero-name']}>Dr. Alejandro Vera</h1>
                                <p className={styles['hero-role']}>Médico Veterinario Jefe</p>
                                <div className={styles['hero-badges']}>
                                    <span className={styles['badge-item']}><MdBadge /> ID: VET-0042</span>
                                    <span>•</span>
                                    <span className={styles['badge-item']}><MdPlace /> Clínica Principal - Sector A</span>
                                </div>
                            </div>

                            <div className={styles['hero-actions']}>
                                <button className={styles['btn-share']}><FaShare /> Compartir</button>
                                <button className={styles['btn-edit']}><FaEdit /> Editar Perfil</button>

                            </div>
                        </div>
                    </div>

                    {/* Grid Layout - Two Independent Columns */}
                    <div className={styles['profile-grid']}>

                        {/* Left Column Stack */}
                        <div className={styles['profile-column']}>
                            {/* Personal Info */}
                            <div className={styles['info-card']}>
                                <h3 className={styles['card-title']}>Información Personal</h3>
                                <div className={styles['info-group']}>
                                    <div className={styles['info-item']}>
                                        <label>Correo Electrónico</label>
                                        <div className={styles['info-value']}>
                                            <FaEnvelope className={styles['info-icon']} /> a.vera@balamya.zoo
                                        </div>
                                    </div>
                                    <div className={styles['info-item']}>
                                        <label>Teléfono</label>
                                        <div className={styles['info-value']}>
                                            <FaPhone className={styles['info-icon']} /> +52 55 1234 5678
                                        </div>
                                    </div>
                                    <div className={styles['info-item']}>
                                        <label>Cédula Profesional</label>
                                        <div className={styles['info-value']}>
                                            <FaCertificate className={styles['info-icon']} /> 987654321
                                        </div>
                                    </div>
                                    <div className={styles['info-item']}>
                                        <label>Especialidad</label>
                                        <div className={styles['info-value']}>
                                            <FaGraduationCap className={styles['info-icon']} /> Fauna Silvestre y Exótica
                                        </div>
                                    </div>
                                    <div className={styles['info-item']}>
                                        <label>Fecha de Ingreso</label>
                                        <div className={styles['info-value']}>
                                            <FaCalendarAlt className={styles['info-icon']} /> 15 de Marzo, 2018
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Notes */}
                            <div className={`${styles['info-card']} ${styles['notes-card-wrapper']}`}>
                                <div className={styles['card-header-simple']}>
                                    <FaStickyNote size={20} className={styles['text-yellow-note']} />
                                    <h4>Notas Rápidas</h4>
                                </div>
                                <textarea
                                    className={styles['notes-area']}
                                    placeholder="Escribe una nota rápida aquí..."
                                    defaultValue="Recordar revisar expediente de Leo mañana a primera hora."
                                ></textarea>
                            </div>
                        </div>

                        {/* Right Column Stack */}
                        <div className={styles['profile-column']}>
                            {/* Settings Card */}
                            <div className={styles['info-card']}>
                                <h3 className={styles['card-title']}>Configuración de Cuenta</h3>
                                <div className={styles['settings-list']}>

                                    <div className={`${styles['setting-item']} ${styles['group']}`}>
                                        <div className={styles['setting-left']}>
                                            <div className={styles['setting-icon-box']}><FaLock /></div>
                                            <div className={styles['setting-text']}>
                                                <h4>Seguridad y Contraseña</h4>
                                                <p>Actualizar contraseña y 2FA</p>
                                            </div>
                                        </div>
                                        <FaChevronRight className={styles['setting-arrow']} />
                                    </div>

                                    <div className={`${styles['setting-item']} ${styles['group']}`}>
                                        <div className={styles['setting-left']}>
                                            <div className={styles['setting-icon-box']}><FaBell /></div>
                                            <div className={styles['setting-text']}>
                                                <h4>Notificaciones</h4>
                                                <p>Alertas de pacientes y turnos</p>
                                            </div>
                                        </div>
                                        <div className={styles['toggle-wrapper']}>
                                            <input type="checkbox" id="toggle" className={styles['toggle-checkbox']} />
                                            <label htmlFor="toggle" className={styles['toggle-label']}></label>
                                        </div>
                                    </div>

                                    <div className={`${styles['setting-item']} ${styles['group']}`}>
                                        <div className={styles['setting-left']}>
                                            <div className={styles['setting-icon-box']}><FaGlobe /></div>
                                            <div className={styles['setting-text']}>
                                                <h4>Idioma y Región</h4>
                                                <p>Español (México) / GMT-6</p>
                                            </div>
                                        </div>
                                        <FaChevronRight className={styles['setting-arrow']} />
                                    </div>

                                    {/* Action: Cerrar Sesión */}
                                    <div
                                        className={`${styles['setting-item']} ${styles['group']}`}
                                        style={{ marginTop: '1rem', cursor: 'pointer', border: '1px solid #ef4444', backgroundColor: '#fef2f2' }}
                                        onClick={confirmLogout}
                                    >
                                        <div className={styles['setting-left']}>
                                            <div className={styles['setting-icon-box']} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}><FaSignOutAlt /></div>
                                            <div className={styles['setting-text']}>
                                                <h4 style={{ color: '#ef4444', margin: 0 }}>Cerrar Sesión</h4>
                                                <p style={{ color: '#ef4444' }}>Salir de la cuenta de forma segura</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Split Row: Signature & Activity */}
                            <div className={styles['split-row']}>

                                {/* Signature Zone (Left) */}
                                <div className={styles['info-card']} style={{ padding: '0px', overflow: 'hidden' }}>
                                    <div className={styles['signature-zone']}>
                                        <FaPenNib size={32} color="#d1d5db" />
                                        <span className={styles['signature-text']}>Agregar Firma Digital</span>
                                    </div>
                                </div>

                                {/* Activity Card (Right - Compact) */}
                                <div className={styles['info-card']}>
                                    <div className={styles['card-header-simple']}>
                                        <FaHistory size={20} className={styles['text-blue-500']} />
                                        <h4>Actividad</h4>
                                    </div>
                                    <div className={styles['activity-list']}>
                                        <div className={styles['activity-item']}>
                                            <div className={`${styles['activity-dot']} ${styles['dot-blue']}`}></div>
                                            <div className={styles['activity-content']}>
                                                <h5>Ingreso P003</h5>
                                                <p className={styles['activity-meta']}>Hace 2h</p>
                                            </div>
                                        </div>
                                        <div className={styles['activity-item']}>
                                            <div className={`${styles['activity-dot']} ${styles['dot-green']}`}></div>
                                            <div className={styles['activity-content']}>
                                                <h5>Alta Luna</h5>
                                                <p className={styles['activity-meta']}>Ayer</p>
                                            </div>
                                        </div>
                                        <div className={styles['activity-item']}>
                                            <div className={`${styles['activity-dot']} ${styles['dot-yellow']}`}></div>
                                            <div className={styles['activity-content']}>
                                                <h5>Pass Updated</h5>
                                                <p className={styles['activity-meta']}>20 Oct</p>
                                            </div>
                                        </div>
                                    </div>
                                    <a href="#" className={styles['view-all-link']}>Ver historial</a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
