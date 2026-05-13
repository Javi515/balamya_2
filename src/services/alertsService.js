import { io } from 'socket.io-client';
import { normalizedBaseUrl } from './api';

let socket = null;
let socketToken = null;
const listeners = new Set();

const connect = (accessToken) => {
    if (!accessToken) return;
    if (socket?.connected && socketToken === accessToken) return;

    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socketToken = accessToken;

    socket = io(normalizedBaseUrl || 'http://localhost:5051', {
        transports: ['websocket'],
        auth: {
            token: accessToken,
        },
    });

    socket.on('alerta_creada', (alerta) => {
        listeners.forEach((cb) => cb(alerta));
    });
};

const disconnect = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socketToken = null;
};

const onAlert = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

export default { connect, disconnect, onAlert };
