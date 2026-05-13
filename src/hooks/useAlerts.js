import { useEffect, useRef, useState } from 'react';
import alertsService from '../services/alertsService';
import { apiFetch } from '../services/api';
import { getAccessToken, getCurrentUser } from '../services/auth/LoginServices';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const parseDate = (value) => {
    if (!value) return null;

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatAlertTime = (value) => {
    const parsedDate = parseDate(value);

    if (!parsedDate) return '';

    return parsedDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const formatAlertDate = (value) => {
    const parsedDate = parseDate(value);

    if (!parsedDate) return '';

    return parsedDate.toLocaleDateString('es-MX');
};

const normalizeAlertTypeKey = (type) =>
    String(type || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

const getAlertItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const dedupeAlerts = (items) => {
    const seen = new Set();

    return items.filter((alert, index) => {
        const key = alert?.key ?? `${alert?.scope || 'alert'}:${alert?.id ?? index}`;

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
};

const createBellAlertSignature = (alert) => [
    alert?.title ?? '',
    alert?.description ?? '',
    alert?.typeKey ?? '',
    alert?.author ?? '',
    alert?.rawFecha ?? '',
].join('|');

const sortAlertsBySchedule = (items) => [...items].sort((left, right) => {
    const leftDate = parseDate(left?.rawFecha);
    const rightDate = parseDate(right?.rawFecha);

    if (leftDate && rightDate) {
        return leftDate.getTime() - rightDate.getTime();
    }

    if (leftDate) return -1;
    if (rightDate) return 1;

    const leftTimestamp = parseDate(left?.timestamp)?.getTime() ?? 0;
    const rightTimestamp = parseDate(right?.timestamp)?.getTime() ?? 0;
    return rightTimestamp - leftTimestamp;
});

const buildBellAlerts = (privateAlerts, globalAlerts) => {
    const seen = new Set();

    return sortAlertsBySchedule([...privateAlerts, ...globalAlerts]).filter((alert) => {
        const signature = createBellAlertSignature(alert);

        if (seen.has(signature)) {
            return false;
        }

        seen.add(signature);
        return true;
    });
};

const getCurrentUserId = (user) => user?.idUsuario ?? user?.id_usuario ?? user?.id ?? null;

const normalizeAlertBase = (item, scope) => {
    const id = item?.id_notificacion ?? item?.id ?? Date.now();
    const rawFecha = item?.fecha_programada ?? null;
    const type = item?.prioridad ?? item?.type ?? 'Informativa';

    return {
        key: `${scope}:${id}`,
        id,
        scope,
        title: item?.titulo ?? item?.title ?? '',
        description: item?.mensaje ?? item?.description ?? '',
        type,
        typeKey: normalizeAlertTypeKey(type),
        author: item?.autor ?? item?.author ?? 'Usuario',
        rawFecha,
        time: formatAlertTime(rawFecha),
        date: formatAlertDate(rawFecha),
        timestamp: item?.created_at ?? new Date().toISOString(),
    };
};

const normalizePrivateAlert = (item) => ({
    ...normalizeAlertBase(item, 'private'),
    userId: item?.id_usuario ?? item?.idUsuario ?? null,
    read: Boolean(item?.leida),
});

const normalizeGlobalAlert = (item) => ({
    ...normalizeAlertBase(item, 'global'),
    creatorUserId: item?.id_usuario_creador ?? item?.id_usuario ?? item?.idUsuario ?? null,
    status: item?.estado ?? 'pendiente',
    viewedAt: item?.vista_at ?? null,
    socketEmittedAt: item?.socket_emitido_at ?? null,
    pushSentAt: item?.push_enviado_at ?? null,
});

const isPendingPrivateAlert = (alert, now = new Date()) => {
    const scheduledDate = parseDate(alert?.rawFecha);

    if (!scheduledDate) return false;

    return scheduledDate.getTime() > now.getTime();
};

const filterPendingAlerts = (items, now = new Date()) =>
    items.filter((alert) => isPendingPrivateAlert(alert, now));

const registerPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
        const registration = await navigator.serviceWorker.register('/BALAMYA/sw.js');
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') return;

        const { publicKey } = await apiFetch('/api/notificaciones/vapid-public-key', { auth: true });
        const existingSubscription = await registration.pushManager.getSubscription();
        const subscription = existingSubscription ?? await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await apiFetch('/api/notificaciones/suscripcion', {
            method: 'POST',
            auth: true,
            body: JSON.stringify({ suscripcion: subscription }),
        });
    } catch {
        // Ignore unsupported push flows.
    }
};

const serializeScheduledDate = (date, time) => {
    if (!date || !time) return null;

    const scheduledDate = new Date(`${date}T${time}:00`);

    if (Number.isNaN(scheduledDate.getTime())) {
        return null;
    }

    return scheduledDate.toISOString();
};

const isFutureScheduledDate = (value) => {
    const scheduledDate = parseDate(value);

    if (!scheduledDate) return false;

    return scheduledDate.getTime() > Date.now();
};

const getAudioContextClass = () => window.AudioContext || window.webkitAudioContext || null;

const ensureAudioContext = async (audioContextRef) => {
    if (typeof window === 'undefined') return null;

    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === 'suspended') {
        try {
            await audioContextRef.current.resume();
        } catch {
            return null;
        }
    }

    return audioContextRef.current;
};

const playAlertSound = async (audioContextRef) => {
    const audioContext = await ensureAudioContext(audioContextRef);

    if (!audioContext) return;

    const startTime = audioContext.currentTime;
    const notes = [
        { offset: 0, frequency: 740, duration: 0.12 },
        { offset: 0.16, frequency: 932, duration: 0.12 },
        { offset: 0.34, frequency: 740, duration: 0.18 },
    ];

    notes.forEach(({ offset, frequency, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const noteStart = startTime + offset;
        const noteEnd = noteStart + duration;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, noteStart);

        gainNode.gain.setValueAtTime(0.0001, noteStart);
        gainNode.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd);
    });
};

const useAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [bellAlerts, setBellAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const privateAlertsRef = useRef([]);
    const globalAlertsRef = useRef([]);
    const audioContextRef = useRef(null);
    const currentUser = getCurrentUser();
    const accessToken = getAccessToken();
    const currentUserId = getCurrentUserId(currentUser);
    const visibleBellAlerts = buildBellAlerts(alerts, bellAlerts);

    const updatePrivateAlerts = (newAlerts) => {
        const uniqueAlerts = dedupeAlerts(newAlerts);
        privateAlertsRef.current = uniqueAlerts;
        setAlerts(uniqueAlerts);
    };

    const updateGlobalAlerts = (newAlerts) => {
        const uniqueAlerts = dedupeAlerts(newAlerts);
        globalAlertsRef.current = uniqueAlerts;
        setBellAlerts(uniqueAlerts);
    };

    const loadPrivateAlerts = async () => {
        const now = new Date();
        const data = await apiFetch('/api/notificaciones', { auth: true });
        const privateAlerts = filterPendingAlerts(
            getAlertItems(data).map(normalizePrivateAlert),
            now,
        );

        updatePrivateAlerts(privateAlerts);
    };

    const loadGlobalAlerts = async () => {
        const now = new Date();
        const data = await apiFetch('/api/notificaciones/globales', { auth: true });
        const globalAlerts = filterPendingAlerts(
            getAlertItems(data).map(normalizeGlobalAlert),
            now,
        );
        updateGlobalAlerts(globalAlerts);
    };

    const refreshAlerts = async (showLoading = false) => {
        if (!currentUserId) {
            updatePrivateAlerts([]);
            updateGlobalAlerts([]);
            setLoading(false);
            return;
        }

        if (showLoading) {
            setLoading(true);
        }

        const [privateResult, globalResult] = await Promise.allSettled([
            loadPrivateAlerts(),
            loadGlobalAlerts(),
        ]);

        if (privateResult.status === 'rejected') {
            updatePrivateAlerts([]);
        }

        if (globalResult.status === 'rejected') {
            updateGlobalAlerts([]);
        }

        if (showLoading) {
            setLoading(false);
        }
    };

    const markGlobalAlertsAsViewed = async (ids) => {
        const uniqueIds = [...new Set((ids || []).map((id) => String(id)).filter(Boolean))];

        if (uniqueIds.length === 0) return;

        const results = await Promise.allSettled(
            uniqueIds.map((id) =>
                apiFetch(`/api/notificaciones/globales/${id}/vista`, {
                    method: 'PATCH',
                    auth: true,
                }),
            ),
        );

        const failedIds = new Set(
            uniqueIds.filter((_, index) => results[index]?.status === 'rejected'),
        );

        updateGlobalAlerts(
            globalAlertsRef.current.filter(
                (alert) => failedIds.has(String(alert.id)) || !uniqueIds.includes(String(alert.id)),
            ),
        );
    };

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const unlockAudio = () => {
            void ensureAudioContext(audioContextRef);
        };

        window.addEventListener('pointerdown', unlockAudio, { passive: true });
        window.addEventListener('keydown', unlockAudio);

        return () => {
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const intervalId = window.setInterval(() => {
            const now = new Date();
            const nextPrivateAlerts = filterPendingAlerts(privateAlertsRef.current, now);
            const nextGlobalAlerts = filterPendingAlerts(globalAlertsRef.current, now);

            if (nextPrivateAlerts.length !== privateAlertsRef.current.length) {
                updatePrivateAlerts(nextPrivateAlerts);
            }

            if (nextGlobalAlerts.length !== globalAlertsRef.current.length) {
                updateGlobalAlerts(nextGlobalAlerts);
            }
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (!currentUserId || !accessToken) {
            updatePrivateAlerts([]);
            updateGlobalAlerts([]);
            setLoading(false);
            return undefined;
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => registration.update());
            });
        }

        void refreshAlerts(true);

        alertsService.connect(accessToken);
        const unsubscribe = alertsService.onAlert((item) => {
            const normalized = normalizeGlobalAlert(item);
            const alreadyExists = globalAlertsRef.current.some(
                (alert) => alert.key === normalized.key,
            );

            if (!alreadyExists) {
                void playAlertSound(audioContextRef);
            }

            if (isPendingPrivateAlert(normalized, new Date())) {
                updateGlobalAlerts([normalized, ...globalAlertsRef.current]);
            }
        });

        void registerPush();

        return () => {
            unsubscribe();
            alertsService.disconnect();
        };
    }, [currentUserId, accessToken]);

    const addAlert = async (alertData) => {
        const scheduledDate = serializeScheduledDate(alertData.date, alertData.time);

        if (!isFutureScheduledDate(scheduledDate)) {
            throw new Error('La alerta debe programarse con una hora futura.');
        }

        await apiFetch('/api/notificaciones', {
            method: 'POST',
            auth: true,
            body: JSON.stringify({
                titulo: alertData.title,
                mensaje: alertData.description,
                prioridad: alertData.type,
                ...(scheduledDate ? { fecha_programada: scheduledDate } : {}),
            }),
        });

        await loadPrivateAlerts();
    };

    const deleteAlert = async (id) => {
        await apiFetch(`/api/notificaciones/${id}`, {
            method: 'DELETE',
            auth: true,
        });

        updatePrivateAlerts(privateAlertsRef.current.filter((alert) => alert.id !== id));
    };

    return {
        alerts,
        privateAlerts: alerts,
        bellAlerts: visibleBellAlerts,
        globalAlerts: bellAlerts,
        loading,
        addAlert,
        deleteAlert,
        refreshAlerts,
        markGlobalAlertsAsViewed,
    };
};

export default useAlerts;
