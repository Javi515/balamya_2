import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Mock Users Database (Solo para Referencia)
const MOCK_USERS = [
    {
        email: 'admin@balamya.org',
        password: 'admin',
        name: 'Administrador Principal',
        role: 'admin',
        specialty: 'all',
        avatar: 'admin-avatar.jpg'
    },
    {
        email: 'aves@balamya.org',
        password: 'aves',
        name: 'Dr. Ornitólogo',
        role: 'veterinarian',
        specialty: 'aves',
        avatar: 'vet-aves.jpg'
    },
    {
        email: 'mamiferos@balamya.org',
        password: 'mamiferos',
        name: 'Dr. Mastozoológo',
        role: 'veterinarian',
        specialty: 'mamiferos',
        avatar: 'vet-mamiferos.jpg'
    },
    {
        email: 'reptiles@balamya.org',
        password: 'reptiles',
        name: 'Dr. Herpetólogo (Reptiles)',
        role: 'veterinarian',
        specialty: 'reptiles',
        avatar: 'vet-reptiles.jpg'
    },
    {
        email: 'anfibios@balamya.org',
        password: 'anfibios',
        name: 'Dr. Herpetólogo (Anfibios)',
        role: 'veterinarian',
        specialty: 'anfibios',
        avatar: 'vet-anfibios.jpg'
    },
    {
        email: 'asistente@balamya.org',
        password: 'assist',
        name: 'Asistente General',
        role: 'assistant',
        specialty: 'all',
        avatar: 'assistant.jpg'
    }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved session on load
        const savedUser = localStorage.getItem('balamya_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la autenticación');
            }

            // Compatibilidad con frontend legado: Mapear role -> specialty
            if (!data.specialty) {
                data.specialty = (data.role === 'admin' || data.role === 'mamiferos') ? 'all' : data.role;
                // Nota: mamiferos tiene acceso a todo en la app original? 
                // Ajuste rápido: si es admin -> all. Si es otro -> su propio rol.
                if (data.role === 'admin') data.specialty = 'all';
            }

            setUser(data);
            localStorage.setItem('balamya_user', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
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
