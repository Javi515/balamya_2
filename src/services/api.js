import { AUTH_TOKEN_STORAGE_KEY } from './auth/authStorage';

const DEFAULT_API_BASE_URL = 'http://localhost:5051';
const normalizedBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

const parseResponseBody = async (response) => {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    try {
        return await response.text();
    } catch {
        return null;
    }
};

const getErrorMessage = (body, status) => {
    if (!body) {
        return `Request failed with status ${status}`;
    }

    if (typeof body === 'string') {
        return body;
    }

    // Extract top-level message/error string
    const topLevel = body.message || body.mensaje || body.error || body.msg || null;

    // Extract nested error lists (validation errors, details, etc.)
    const errorList = body.errors || body.errores || body.details || body.detalle || null;
    let errorDetail = null;

    if (Array.isArray(errorList) && errorList.length > 0) {
        errorDetail = errorList
            .map(e => (typeof e === 'string' ? e : e.message || e.msg || e.field || JSON.stringify(e)))
            .join('\n• ');
        errorDetail = '• ' + errorDetail;
    } else if (errorList && typeof errorList === 'object') {
        errorDetail = Object.entries(errorList)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n• ');
        errorDetail = '• ' + errorDetail;
    }

    if (topLevel && errorDetail) return `${topLevel}\n${errorDetail}`;
    if (errorDetail) return errorDetail;
    if (topLevel) return topLevel;

    return `Request failed with status ${status}`;
};

const buildUrl = (path = '') => {
    if (!path) {
        return normalizedBaseUrl;
    }

    if (/^https?:\/\//i.test(path)) {
        if (!normalizedBaseUrl || path.startsWith(normalizedBaseUrl)) return path;
        try {
            const { pathname, search, hash } = new URL(path);
            return `${normalizedBaseUrl}${pathname}${search}${hash}`;
        } catch {
            return path;
        }
    }

    if (!normalizedBaseUrl) {
        return path;
    }

    return `${normalizedBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const getStoredAccessToken = () => {
    const token = sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token || !token.trim()) {
        sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        return null;
    }

    return token;
};

const apiFetch = async (path, options = {}) => {
    const { auth = false, headers, ...fetchOptions } = options;
    const accessToken = auth ? getStoredAccessToken() : null;

    if (auth && !accessToken) {
        throw new Error('No hay una sesion activa.');
    }

    const isFormData = fetchOptions.body instanceof FormData;

    const response = await fetch(buildUrl(path), {
        ...fetchOptions,
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(headers || {}),
        },
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
        const err = new Error(getErrorMessage(body, response.status));
        err.status = response.status;
        err.data = body;
        throw err;
    }

    return body;
};

export { apiFetch, buildUrl, normalizedBaseUrl };
