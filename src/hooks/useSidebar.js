import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useSidebar = (isOpen, toggle) => {
    const { user, logout, hasAccessToCategory } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isPatientsOpen, setIsPatientsOpen] = useState(false);
    const [isCasualtiesOpen, setIsCasualtiesOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleMobileClose = () => {
        if (window.innerWidth <= 1100 && isOpen) {
            toggle();
        }
    };

    const handleLinkClick = () => {
        setIsPatientsOpen(false);
        setIsCasualtiesOpen(false);
        handleMobileClose();
    };

    const handleSubMenuClick = () => {
        handleMobileClose();
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

    // Sync state with location
    useEffect(() => {
        if (location.pathname.startsWith('/patients')) {
            setIsPatientsOpen(true);
        }
        if (location.pathname.startsWith('/casualties')) {
            setIsCasualtiesOpen(true);
        }
    }, [location.pathname]);


    return {
        user,
        hasAccessToCategory,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        isPatientsOpen,
        setIsPatientsOpen,
        isCasualtiesOpen,
        setIsCasualtiesOpen,
        handleLinkClick,
        handleSubMenuClick,
        confirmLogout,
        location
    };
};

export default useSidebar;
