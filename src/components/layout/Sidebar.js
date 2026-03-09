import { NavLink } from 'react-router-dom';
import React from 'react';
import { sidebarLinks } from './sidebar.config';
import { FaPaw, FaTimes } from 'react-icons/fa';
// import '../../styles/Sidebar.css'; // Removing CSS import

import useSidebar from '../../hooks/useSidebar';

const Sidebar = ({ isOpen, toggle }) => {
  const {
    location,
    handleLinkClick
  } = useSidebar(isOpen, toggle);

  return (
    <>
      <aside
        className={`
          flex flex-col flex-shrink-0 z-50
          h-screen overflow-hidden 
          bg-gradient-to-b from-blue-800 to-blue-950 text-white shadow-[4px_0_15px_rgba(0,0,0,0.1)]
          transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          fixed inset-y-0 left-0 w-[290px]
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header del Sidebar interactivo (Logo) */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/20 shrink-0 bg-transparent cursor-default">
          <div className="flex items-center gap-4 text-[1.8rem] font-extrabold pl-1 text-white">
            <span className="flex items-center justify-center w-10 mr-0">
              <FaPaw className="text-white text-[2.0rem] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
            </span>
            <span className="tracking-wide">BALAMYA</span>
          </div>
          <button
            className="lg:hidden text-white text-2xl cursor-pointer bg-none border-none"
            onClick={toggle}
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="px-5 py-4">
            <ul className="flex flex-col">
              {sidebarLinks.map((link) => {
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
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF,0_0_20px_#00E5FF] rounded-r"></span>
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
        <div className="shrink-0 p-5 border-t border-white/10 bg-white/5 mx-3 mb-4 rounded-xl backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00E5FF] to-blue-500 p-[2px]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjfRZ3q9uYGH-kgN8cgEX9FC3N2lKsw19D3gKe-cirCL8TLeYtqMW0s_ZKLo2PMQT4-ktj3SYJmxoiIwuzWS9SO1NExx6cFBUfqmz7Baf4hcP-OiKDdZ2seuAV9Z1m6Yo-XC9VxGmNPWfPbhpH7aVeNQrlvuQ_rwKF-Cki5dlwgEnlBvyqP_g1cZN3Gk-Buy64WDQ9e03Zjjmy47RYdv__X_9VvdHGOOW63Yc_Ep6roe_1hyp7ygvsnG_jHyu_GW0zouD_lcB12_Q"
                alt="Usuario"
                className="w-full h-full rounded-full object-cover border border-blue-900"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm leading-tight">Dr. Alejandro Vera</span>
              <span className="text-blue-300 text-xs font-medium">Administrador</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
