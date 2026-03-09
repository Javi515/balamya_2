import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import ReportsPage from './pages/ReportsPage';
import FormsPage from './pages/FormsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LabPage from './pages/LabPage';
import HospitalizationPage from './pages/HospitalizationPage';
import TreatmentsPage from './pages/TreatmentsPage';
import WelfarePage from './pages/WelfarePage';
import DewormingPage from './pages/DewormingPage';
import VaccinationsPage from './pages/VaccinationsPage';
import ClinicalReviewsPage from './pages/ClinicalReviewsPage';
import AnesthesiaPage from './pages/AnesthesiaPage';
import './styles/App.css';

import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';



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
                    <Route path="/lab" element={<LabPage />} />
                    <Route path="/welfare" element={<WelfarePage />} />
                    <Route path="/deworming" element={<DewormingPage />} />
                    <Route path="/vaccinations" element={<VaccinationsPage />} />
                    <Route path="/clinical-reviews" element={<ClinicalReviewsPage />} />
                    <Route path="/anesthesia" element={<AnesthesiaPage />} />
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