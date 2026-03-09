
import { FaHome, FaPaw, FaHeartBroken, FaProcedures, FaFileMedical, FaClipboardList, FaStethoscope, FaBug, FaSyringe, FaNotesMedical, FaSyringe as FaSyringeAnaesthesia } from 'react-icons/fa';

export const sidebarLinks = [
    {
        path: '/dashboard',
        label: 'Inicio',
        icon: FaHome,
        iconClass: 'icon-home'
    },
    {
        path: '/patients',
        label: 'Pacientes',
        icon: FaPaw,
        iconClass: 'icon-patients'
    },
    {
        path: '/casualties',
        label: 'Bajas',
        icon: FaHeartBroken,
        iconClass: 'icon-casualties'
    },
    {
        path: '/hospitalization',
        label: 'Hospitalizados',
        icon: FaProcedures,
        iconClass: 'icon-hospitalized'
    },
    {
        path: '/treatments',
        label: 'Tratamientos',
        icon: FaStethoscope,
        iconClass: 'icon-treatments'
    },
    {
        path: '/deworming',
        label: 'Desparasitaciones',
        icon: FaBug,
        iconClass: 'icon-deworming'
    },
    {
        path: '/vaccinations',
        label: 'Vacunaciones',
        icon: FaSyringe,
        iconClass: 'icon-vaccinations'
    },
    {
        path: '/clinical-reviews',
        label: 'Revisiones Clínicas',
        icon: FaNotesMedical,
        iconClass: 'icon-clinical-reviews'
    },
    {
        path: '/anesthesia',
        label: 'Anestesias',
        icon: FaSyringeAnaesthesia,
        iconClass: 'icon-anesthesia'
    },
    {
        path: '/medical-history',
        label: 'Reportes Clínicos',
        icon: FaFileMedical,
        iconClass: 'icon-history'
    },
    {
        path: '/forms',
        label: 'Herramientas',
        icon: FaClipboardList,
        iconClass: 'icon-forms'
    }
];
