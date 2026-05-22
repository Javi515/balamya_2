const formatScheduledLabel = (value) => {
    if (!value) return '';

    const scheduledDate = new Date(value);

    if (Number.isNaN(scheduledDate.getTime())) {
        return '';
    }

    const time = scheduledDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    const date = scheduledDate.toLocaleDateString('es-MX');

    return `\u{1F550} ${time}  \u{1F4C5} ${date}`;
};

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
    const data = (() => {
        try {
            return event.data?.json() || null;
        } catch {
            return null;
        }
    })();

    if (!data) {
        event.waitUntil(Promise.resolve());
        return;
    }

    const details = [
        data.mensaje || 'Sin descripcion',
        `\u{1F464} Autor: ${data.autor || 'Usuario'}`,
    ];

    const scheduledLabel = formatScheduledLabel(data.fecha_programada);
    if (scheduledLabel) {
        details.push(scheduledLabel);
    }

    details.push(`\u{1F4CB} Prioridad: ${data.prioridad || 'Informativa'}`);

    event.waitUntil(
        self.registration.showNotification(data.titulo || 'Nueva alerta', {
            body: details.filter(Boolean).join('\n'),
            icon: `${self.registration.scope}Logo_zoomat.png`,
            badge: `${self.registration.scope}Logo_zoomat.png`,
            tag: `global:${data.id_notificacion ?? 'alerta'}`,
            renotify: true,
            vibrate: [160, 80, 160],
            data,
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(`${self.registration.scope}alerts`));
});
