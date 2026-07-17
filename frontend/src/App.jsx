import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesShowcase from './components/ServicesShowcase';
import TechMarquee from './components/TechMarquee';
import WorkingFlow from './components/WorkingFlow';
import Features from './components/Features';
import DemoProjects from './components/DemoProjects';
import GetStarted from './components/GetStarted';
import Footer from './components/Footer';
import OfferModal from './components/OfferModal';

// Auth imports
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import BookProject from './pages/dashboard/BookProject';
import TrackOrder from './pages/dashboard/TrackOrder';
import BillingPage from './pages/dashboard/BillingPage';
import RequestChangePage from './pages/dashboard/RequestChangePage';
import ContactSupportPage from './pages/dashboard/ContactSupportPage';
import ProfileSettingsPage from './pages/dashboard/ProfileSettingsPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import PreviewLabPage from './pages/PreviewLabPage';

function LandingPage() {
  return (
    <div className="landing-light-theme">
      <Navbar />
      <main>
        <Hero />
        <ServicesShowcase />
        <WorkingFlow />
        <TechMarquee />
        <Features />
        <DemoProjects />
        <GetStarted />
      </main>
      <Footer />
      {/* <OfferModal /> */}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/preview-lab" element={<PreviewLabPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="book" element={<BookProject />} />
        <Route path="track" element={<TrackOrder />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="changes" element={<RequestChangePage />} />
        <Route path="chat" element={<ContactSupportPage />} />
        <Route path="settings" element={<ProfileSettingsPage />} />
      </Route>
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
