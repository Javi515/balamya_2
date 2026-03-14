import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout/MainLayout';
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
import TreatmentsPage from '../features/treatments/pages/TreatmentsPage';
import DewormingPage from '../features/deworming/pages/DewormingPage';
import VaccinationsPage from '../features/vaccinations/pages/VaccinationsPage';
import ClinicalReviewsPage from '../features/clinical/pages/ClinicalReviewsPage';
import AnesthesiaPage from '../features/anesthesia/pages/AnesthesiaPage';
import GenerarTokenPage from '../features/tokens/pages/GenerarTokenPage';
import '../styles/App.css';

import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';



function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/patients" element={<PatientsPage />} />
                    <Route path="/patients/:id" element={<PatientDetailsPage />} />
                    <Route path="/medical-history" element={<MedicalHistoryPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/forms" element={<FormsPage />} />
                    <Route path="/alerts" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/casualties" element={<PatientsPage />} />
                    <Route path="/casualties/:id" element={<PatientDetailsPage />} />
                    <Route path="/hospitalization" element={<HospitalizationPage />} />
                    <Route path="/treatments" element={<TreatmentsPage />} />
                    <Route path="/deworming" element={<DewormingPage />} />
                    <Route path="/vaccinations" element={<VaccinationsPage />} />
                    <Route path="/clinical-reviews" element={<ClinicalReviewsPage />} />
                    <Route path="/anesthesia" element={<AnesthesiaPage />} />
                    <Route path="/tokens" element={<GenerarTokenPage />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
