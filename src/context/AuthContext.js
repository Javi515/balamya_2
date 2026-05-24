import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getCurrentUser,
    hasAccessToCategory as hasAccessToCategoryForUser,
    isAuthenticated as hasActiveSession,
    login as loginUser,
    logout as logoutUser,
} from '../services/auth/LoginServices';
import { AUTH_STORAGE_KEY } from '../services/auth/authStorage';
import { buildUrl } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const withBuiltPhoto = (user) => {
    if (!user?.fotoUrl) return user;
    return { ...user, fotoUrl: buildUrl(user.fotoUrl) };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser ? withBuiltPhoto(currentUser) : null);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const userData = await loginUser(email, password);
        const userWithPhoto = withBuiltPhoto(userData);
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
            if (updated.fotoUrl) updated.fotoUrl = buildUrl(updated.fotoUrl);
            sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
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
