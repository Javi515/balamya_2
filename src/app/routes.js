import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout/MainLayout';
import { useAuth } from '../context/AuthContext';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import PatientsPage from '../features/patients/pages/PatientsPage';
import PatientDetailsPage from '../features/patients/pages/PatientDetailsPage';
import MedicalHistoryPage from '../features/medical-history/pages/MedicalHistoryPage';
import ReportsPage from '../features/reports/pages/ReportsPage';
import FormsPage from '../features/forms/pages/FormsPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import HospitalizationPage from '../features/hospitalization/pages/HospitalizationPage';
import TreatmentsPage from '../features/treatments/pages/TreatmentsPage/TreatmentsPage';
import DewormingPage from '../features/deworming/pages/DewormingPage';
import VaccinationsPage from '../features/vaccinations/pages/VaccinationsPage';
import ClinicalReviewsPage from '../features/clinical/pages/ClinicalReviewsPage';
import AnesthesiaPage from '../features/anesthesia/pages/AnesthesiaPage';
import GenerarTokenPage from '../features/tokens/pages/GenerarTokenPage';

const AppShell = () => (
    <MainLayout>
        <Outlet />
    </MainLayout>
);

const PublicRoute = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

const publicRoutes = [
    { path: '/', element: <LoginPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
];

const protectedRoutes = [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/patients', element: <PatientsPage /> },
    { path: '/patients/:id', element: <PatientDetailsPage /> },
    { path: '/medical-history', element: <MedicalHistoryPage /> },
    { path: '/reports', element: <ReportsPage /> },
    { path: '/forms', element: <FormsPage /> },
    { path: '/alerts', element: <NotificationsPage /> },
    { path: '/profile', element: <ProfilePage /> },
    { path: '/casualties', element: <PatientsPage /> },
    { path: '/casualties/:id', element: <PatientDetailsPage /> },
    { path: '/hospitalization', element: <HospitalizationPage /> },
    { path: '/treatments', element: <TreatmentsPage /> },
    { path: '/deworming', element: <DewormingPage /> },
    { path: '/vaccinations', element: <VaccinationsPage /> },
    { path: '/clinical-reviews', element: <ClinicalReviewsPage /> },
    { path: '/anesthesia', element: <AnesthesiaPage /> },
    { path: '/tokens', element: <GenerarTokenPage /> },
];

const AppRoutes = () => (
    <Routes>
        <Route element={<PublicRoute />}>
            {publicRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
                {protectedRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Route>
    </Routes>
);

export { publicRoutes, protectedRoutes };

export default AppRoutes;
