import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageLoader } from '@/components/common/LoadingSpinner';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import { PublicLayout, AuthLayout, DashboardLayout } from '@/components/layouts';

// Lazy-load every page
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ResendVerificationPage = lazy(() => import('@/pages/auth/ResendVerificationPage'));

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminPatientListPage = lazy(() => import('@/pages/admin/AdminPatientListPage'));
const AdminPatientDetailPage = lazy(() => import('@/pages/admin/AdminPatientDetailPage'));
const StaffManagementPage = lazy(() => import('@/pages/admin/StaffManagementPage'));
const ReferralManagementPage = lazy(() => import('@/pages/admin/ReferralManagementPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

// Staff
const DashboardPage = lazy(() => import('@/pages/staff/DashboardPage'));
const PatientListPage = lazy(() => import('@/pages/staff/PatientListPage'));
const PatientRegistrationPage = lazy(() => import('@/pages/staff/PatientRegistrationPage'));
const PatientDetailPage = lazy(() => import('@/pages/staff/PatientDetailPage'));
const PatientSummaryPage = lazy(() => import('@/pages/staff/PatientSummaryPage'));
const PatientProgressPage = lazy(() => import('@/pages/staff/PatientProgressPage'));
const RecordVisitPage = lazy(() => import('@/pages/staff/RecordVisitPage'));
const VisitDetailPage = lazy(() => import('@/pages/staff/VisitDetailPage'));
const OrderMedicationPage = lazy(() => import('@/pages/staff/OrderMedicationPage'));
const MedicationDetailPage = lazy(() => import('@/pages/staff/MedicationDetailPage'));
const OrderLabPage = lazy(() => import('@/pages/staff/OrderLabPage'));
const LabDetailPage = lazy(() => import('@/pages/staff/LabDetailPage'));
const RequestReferralPage = lazy(() => import('@/pages/staff/RequestReferralPage'));
const ReferralDetailPage = lazy(() => import('@/pages/staff/ReferralDetailPage'));
const RecordAdmissionPage = lazy(() => import('@/pages/staff/RecordAdmissionPage'));
const AdmissionDetailPage = lazy(() => import('@/pages/staff/AdmissionDetailPage'));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public landing */}
    <Route path="/" element={<S><LandingPage /></S>} />

    {/* Auth pages — redirect away if already logged in */}
    <Route element={<PublicRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<S><LoginPage /></S>} />
        <Route path="/register" element={<S><RegisterPage /></S>} />
      </Route>
      <Route path="/verify-email" element={<S><VerifyEmailPage /></S>} />
      <Route path="/resend-verification" element={<S><ResendVerificationPage /></S>} />
    </Route>

    {/* Admin-only */}
    <Route element={<ProtectedRoute role="admin" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<S><AdminDashboardPage /></S>} />
        <Route path="/admin/patients" element={<S><AdminPatientListPage /></S>} />
        <Route path="/admin/patients/:patientId" element={<S><AdminPatientDetailPage /></S>} />
        {/* Admin sub-record detail routes — reuse staff detail pages (read-only view) */}
        <Route path="/admin/patients/:id/visits/:visitId" element={<S><VisitDetailPage /></S>} />
        <Route path="/admin/patients/:id/medications/:medicationId" element={<S><MedicationDetailPage /></S>} />
        <Route path="/admin/patients/:id/labs/:labId" element={<S><LabDetailPage /></S>} />
        <Route path="/admin/patients/:id/referrals/:referralId" element={<S><ReferralDetailPage /></S>} />
        <Route path="/admin/patients/:id/admissions/:admissionId" element={<S><AdmissionDetailPage /></S>} />
        <Route path="/admin/staff" element={<S><StaffManagementPage /></S>} />
        <Route path="/admin/referrals" element={<S><ReferralManagementPage /></S>} />
        <Route path="/admin/reports" element={<S><ReportsPage /></S>} />
        <Route path="/admin/settings" element={<S><SettingsPage /></S>} />
      </Route>
    </Route>

    {/* Staff-only */}
    <Route element={<ProtectedRoute role="staff" />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<S><DashboardPage /></S>} />
        <Route path="/patients" element={<S><PatientListPage /></S>} />
        <Route path="/patients/new" element={<S><PatientRegistrationPage /></S>} />
        <Route path="/patients/:id" element={<S><PatientDetailPage /></S>} />
        <Route path="/patients/:id/summary" element={<S><PatientSummaryPage /></S>} />
        <Route path="/patients/:id/progress" element={<S><PatientProgressPage /></S>} />
        <Route path="/patients/:id/visits" element={<S><RecordVisitPage /></S>} />
        <Route path="/patients/:id/visits/:visitId" element={<S><VisitDetailPage /></S>} />
        <Route path="/patients/:id/medications" element={<S><OrderMedicationPage /></S>} />
        <Route path="/patients/:id/medications/:medicationId" element={<S><MedicationDetailPage /></S>} />
        <Route path="/patients/:id/labs" element={<S><OrderLabPage /></S>} />
        <Route path="/patients/:id/labs/:labId" element={<S><LabDetailPage /></S>} />
        <Route path="/patients/:id/referrals" element={<S><RequestReferralPage /></S>} />
        <Route path="/patients/:id/referrals/:referralId" element={<S><ReferralDetailPage /></S>} />
        <Route path="/patients/:id/admissions" element={<S><RecordAdmissionPage /></S>} />
        <Route path="/patients/:id/admissions/:admissionId" element={<S><AdmissionDetailPage /></S>} />
      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<S><NotFoundPage /></S>} />
  </Routes>
);

export default AppRoutes;
