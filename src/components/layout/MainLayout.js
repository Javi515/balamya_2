import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from '../../styles/MainLayout.module.css';

const MainLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false); // Close on resize to mobile
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to handle body scroll lock
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to reset scroll on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className={`${styles['main-layout']} ${sidebarOpen ? styles['sidebar-open'] : styles['sidebar-closed']}`}>
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className={styles['main-content']}>
        <Topbar toggleSidebar={toggleSidebar} />
        <main className={styles['content-area']}>
          <div key={location.pathname} className={styles['page-content-transition']}>
            {children}
          </div>
        </main>
      </div>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
