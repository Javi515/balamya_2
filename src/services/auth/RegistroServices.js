import { apiFetch } from '../api';

const REGISTER_ENDPOINT = '/api/auth/register';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async ({
    idRol,
    nombreCompleto,
    telefono,
    email,
    password,
    codigoVerificacion,
}) => {
    const payload = {
        idRol: Number(idRol),
        nombreCompleto: nombreCompleto.trim(),
        telefono: telefono.replace(/\D/g, ''),
        email: email.trim(),
        password,
        codigoVerificacion: codigoVerificacion.trim(),
    };

    if (!Number.isInteger(payload.idRol) || payload.idRol < 1 || payload.idRol > 5) {
        throw new Error('El rol es obligatorio y debe estar entre 1 y 5.');
    }

    if (!payload.nombreCompleto) {
        throw new Error('El nombre completo es obligatorio.');
    }

    if (!/^\d{10}$/.test(payload.telefono)) {
        throw new Error('El telefono debe tener exactamente 10 digitos.');
    }

    if (!EMAIL_REGEX.test(payload.email)) {
        throw new Error('El correo debe tener un formato valido.');
    }

    if (!payload.password || payload.password.length < 8) {
        throw new Error('La contrasena debe tener al menos 8 caracteres.');
    }

    if (!/^\d{6}$/.test(payload.codigoVerificacion)) {
        throw new Error('El codigo de verificacion debe tener exactamente 6 digitos.');
    }

    return apiFetch(REGISTER_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export { register };
