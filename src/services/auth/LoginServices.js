import { apiFetch } from '../api';
import { AUTH_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY } from './authStorage';

const LOGIN_ENDPOINT = '/api/auth/login';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_CONFIG = {
    1: { role: 'doctor', specialty: 'aves' },
    2: { role: 'doctor', specialty: 'reptiles' },
    3: { role: 'doctor', specialty: 'mamiferos' },
    4: { role: 'doctor', specialty: 'anfibios' },
    5: { role: 'admin', specialty: 'all' },
};

const clearStoredSession = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

const normalizeCategory = (value) => String(value || '').trim().toLowerCase();

const getAccessToken = () => {
    const token = sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token || !token.trim()) {
        sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        return null;
    }

    return token;
};

const normalizeBackendUser = (user) => {
    const roleConfig = ROLE_CONFIG[Number(user?.idRol)];

    if (!roleConfig) {
        throw new Error('El usuario autenticado tiene un rol no soportado.');
    }

    const backendSpecialty = normalizeCategory(user?.especialidad);
    const specialty = roleConfig.specialty === 'all'
        ? 'all'
        : backendSpecialty || roleConfig.specialty;

    return {
        ...user,
        name: user?.nombreCompleto || '',
        role: roleConfig.role,
        specialty,
    };
};

const getCurrentUser = () => {
    const savedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);
    const accessToken = getAccessToken();

    if (!savedUser || !accessToken) {
        clearStoredSession();
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch {
        clearStoredSession();
        return null;
    }
};

const isAuthenticated = () => Boolean(getCurrentUser() && getAccessToken());

const login = async (email, password) => {
    clearStoredSession();

    const payload = {
        email: email.trim(),
        password,
    };

    if (!payload.email) {
        throw new Error('El correo es obligatorio.');
    }

    if (!EMAIL_REGEX.test(payload.email)) {
        throw new Error('El correo debe tener un formato valido.');
    }

    if (!payload.password) {
        throw new Error('La contrasena es obligatoria.');
    }

    const response = await apiFetch(LOGIN_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (!response?.accessToken || !response?.user) {
        throw new Error('La respuesta del servidor no incluye la sesion esperada.');
    }

    if (response.user.activo !== true) {
        throw new Error('Tu cuenta no esta activa.');
    }

    const normalizedUser = normalizeBackendUser(response.user);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.accessToken);

    return normalizedUser;
};

const logout = () => {
    clearStoredSession();
};

const hasAccessToCategory = (user, category) => {
    if (!user) {
        return false;
    }

    const normalizedUserCategory = normalizeCategory(user.specialty);
    const normalizedCategory = normalizeCategory(category);

    if (user.role === 'admin' || normalizedUserCategory === 'all') {
        return true;
    }

    if (normalizedCategory === 'all') {
        return false;
    }

    return normalizedUserCategory === normalizedCategory;
};

export {
    getAccessToken,
    getCurrentUser,
    hasAccessToCategory,
    isAuthenticated,
    login,
    logout,
};
