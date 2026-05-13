import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getCurrentUser,
    hasAccessToCategory as hasAccessToCategoryForUser,
    isAuthenticated as hasActiveSession,
    login as loginUser,
    logout as logoutUser,
} from '../services/auth/LoginServices';
import { AUTH_STORAGE_KEY } from '../services/auth/authStorage';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const PHOTO_STORAGE_PREFIX = 'balamya_photo_';

const getPhotoKey = (user) => user?.email || user?.id ? `${PHOTO_STORAGE_PREFIX}${user.email || user.id}` : null;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const photoKey = getPhotoKey(currentUser);
            const savedPhoto = photoKey ? localStorage.getItem(photoKey) : null;
            setUser(savedPhoto ? { ...currentUser, fotoUrl: savedPhoto } : currentUser);
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const userData = await loginUser(email, password);
        const photoKey = getPhotoKey(userData);
        const savedPhoto = photoKey ? localStorage.getItem(photoKey) : null;
        const userWithPhoto = savedPhoto ? { ...userData, fotoUrl: savedPhoto } : userData;
        setUser(userWithPhoto);
        return userWithPhoto;
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    const updateUser = (updates) => {
        setUser((prev) => {
            const updated = { ...prev, ...updates };
            sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
            if (updates.fotoUrl !== undefined) {
                const photoKey = getPhotoKey(prev);
                if (photoKey) localStorage.setItem(photoKey, updates.fotoUrl);
            }
            return updated;
        });
    };

    const isAuthenticated = Boolean(user) && hasActiveSession();

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        hasAccessToCategory: (category) => hasAccessToCategoryForUser(user, category),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
