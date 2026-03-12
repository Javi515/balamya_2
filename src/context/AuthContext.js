import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const MOCK_USERS = [
    { id: 1, name: 'Administrador',      email: 'admin@balamya.org',      password: 'admin',      role: 'admin',     specialty: 'all' },
    { id: 2, name: 'Dr. Alejandro Vera', email: 'aves@balamya.org',       password: 'aves',       role: 'aves',      specialty: 'aves' },
    { id: 3, name: 'Dra. María Solís',   email: 'mamiferos@balamya.org',  password: 'mamiferos',  role: 'mamiferos', specialty: 'mamiferos' },
    { id: 4, name: 'Dr. Carlos Méndez',  email: 'reptiles@balamya.org',   password: 'reptiles',   role: 'reptiles',  specialty: 'reptiles' },
    { id: 5, name: 'Dra. Ana Torres',    email: 'anfibios@balamya.org',   password: 'anfibios',   role: 'anfibios',  specialty: 'anfibios' },
    { id: 6, name: 'Asistente General',  email: 'asistente@balamya.org',  password: 'asistente',  role: 'assistant', specialty: null },
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('balamya_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const found = MOCK_USERS.find(
            (u) => u.email === email && u.password === password
        );
        if (!found) {
            throw new Error('Credenciales incorrectas');
        }
        const { password: _pw, ...userData } = found;
        setUser(userData);
        localStorage.setItem('balamya_user', JSON.stringify(userData));
        return userData;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('balamya_user');
    };

    const hasAccessToCategory = (category) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (category === 'all' && user.role === 'admin') return true; // Solo admin ve "Todos" (o ajustar segun logica)
        // Ahora el rol ES la categoría (aves, reptiles, etc.)
        return user.role === category;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        hasAccessToCategory
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
