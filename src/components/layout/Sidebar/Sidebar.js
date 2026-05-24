import { NavLink } from 'react-router-dom';
import React, { useRef } from 'react';
import { sidebarLinks } from './sidebar.config';
import { FaTimes, FaCamera } from 'react-icons/fa';
import logoZoomat from '../../../assets/Logo_zoomat.png';
import useSidebar from '../../../hooks/useSidebar';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch, normalizedBaseUrl } from '../../../services/api';

const Sidebar = ({ isOpen, toggle }) => {
  const { user, updateUser } = useAuth();
  const photoInputRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await apiFetch('/api/users/profile-photo', {
        method: 'POST',
        body: formData,
        auth: true,
      });
      updateUser({ fotoUrl: `${normalizedBaseUrl}${response.fotoUrl}` });
    } catch (err) {
      console.error('Error al subir foto:', err.message);
    }
  };
  const {
    location,
    handleLinkClick
  } = useSidebar(isOpen, toggle);

  const visibleLinks = sidebarLinks.filter(link =>
    !link.roles || link.roles.includes(user?.role)
  );

  return (
    <>
      <aside
        className={`
          flex flex-col flex-shrink-0 z-50
          h-screen overflow-hidden
          bg-gradient-to-b from-green-800 to-green-950 text-white shadow-[4px_0_15px_rgba(0,0,0,0.1)]
          transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          fixed inset-y-0 left-0 w-[290px]
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header del Sidebar interactivo (Logo) */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-white/20 shrink-0 bg-transparent cursor-default">
          <div className="flex items-center gap-2 pl-1 min-w-0">
            <img src={logoZoomat} alt="Logo ZOOMAT" className="h-[72px] w-auto object-contain flex-shrink-0" />
            <span className="text-white text-[1.6rem] font-extrabold tracking-wide truncate">BALAMYA</span>
          </div>
          <button
            className="lg:hidden text-white text-2xl cursor-pointer bg-none border-none flex-shrink-0 ml-2"
            onClick={toggle}
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="px-5 py-4">
            <ul className="flex flex-col">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path} className="mb-1.5">
                    <NavLink
                      to={link.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) => `
                        flex items-center gap-3.5 no-underline text-white text-[0.95rem] p-3 rounded-xl
                        transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                        mx-3 border-r-0
                        ${isActive
                          ? 'bg-gradient-to-r from-white/10 to-transparent font-semibold active-glow text-white relative overflow-hidden rounded-l-[4px]'
                          : 'hover:bg-white/15 hover:scale-[1.02] hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-white'}
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FF88] shadow-[0_0_10px_#00FF88,0_0_20px_#00FF88] rounded-r"></span>
                          )}
                          <Icon className={`text-[1.15rem] w-5 text-center transition-all duration-300 ${isActive ? 'text-white' : 'text-white hover:drop-shadow-[0_0_5px_currentColor] hover:scale-110'}`} />
                          {link.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Mini-User Profile Footer */}
        <div className="shrink-0 p-5 border-t border-white/10">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00FF88] to-green-500 p-[2px]">
                {user?.fotoUrl ? (
                  <img
                    src={user.fotoUrl}
                    alt={user.name || 'Usuario'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-green-800 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <button
                onClick={() => photoInputRef.current.click()}
                title="Cambiar foto de perfil"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center border-none cursor-pointer shadow-md hover:bg-gray-100 transition-colors"
              >
                <FaCamera style={{ fontSize: '9px', color: '#16a34a' }} />
              </button>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-white font-semibold text-sm leading-tight truncate">{user?.name || 'Usuario'}</span>
              <span className="text-green-300 text-xs font-medium">
                {user?.role === 'admin' ? 'Administrador' : `Médico ${user?.specialty || ''}`}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
