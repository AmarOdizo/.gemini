import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VetRegister from './pages/VetRegister'
import OwnerDashboard from './pages/OwnerDashboard'
import FindVets from './pages/FindVets'
import VetProfile from './pages/VetProfile'
import MyPets from './pages/MyPets'
import Appointments from './pages/Appointments'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorProfile from './pages/DoctorProfile'
import VetAppointments from './pages/VetAppointments'
import Prescribe from './pages/Prescribe'
import VetAvailability from './pages/VetAvailability'
import VetEarnings from './pages/VetEarnings'
import Prescription from './pages/Prescription'
import VetTelehealthRoom from './pages/VetTelehealthRoom'
import LiveChat from './pages/LiveChat'
import BookingConfirmation from './pages/BookingConfirmation'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import DoctorVideoCall from './pages/doctor/VideoCall'
import OwnerVideoCall from './pages/owner/VideoCall'
import AdminLayout from './layouts/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminVeterinarians from './pages/admin/AdminVeterinarians'
import AdminOwners from './pages/admin/AdminOwners'
import AdminPrescriptions from './pages/admin/AdminPrescriptions'
import AdminReports from './pages/admin/AdminReports'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReviews from './pages/admin/AdminReviews'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/vet-login" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vet-register" element={<VetRegister />} />
      
      {/* Protected Routes wrapped in MainLayout to prevent sidebar flickering */}
      <Route element={<MainLayout />}>
        {/* Owner Portal (Protected) */}
        <Route path="/owner-dashboard" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/find-vets" element={<ProtectedRoute allowedRoles={['owner']}><FindVets /></ProtectedRoute>} />
        <Route path="/owner-dashboard/vet-profile" element={<ProtectedRoute allowedRoles={['owner']}><VetProfile /></ProtectedRoute>} />
        <Route path="/my-pets" element={<ProtectedRoute allowedRoles={['owner']}><MyPets /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={['owner']}><Appointments /></ProtectedRoute>} />
        <Route path="/prescription" element={<ProtectedRoute allowedRoles={['owner']}><Prescription /></ProtectedRoute>} />
        <Route path="/booking-confirmation" element={<ProtectedRoute allowedRoles={['owner']}><BookingConfirmation /></ProtectedRoute>} />
        
        {/* Vet Portal (Protected) */}
        <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor-profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
        <Route path="/vet-appointments" element={<ProtectedRoute allowedRoles={['doctor']}><VetAppointments /></ProtectedRoute>} />
        <Route path="/vet-availability" element={<ProtectedRoute allowedRoles={['doctor']}><VetAvailability /></ProtectedRoute>} />
        <Route path="/vet-earnings" element={<ProtectedRoute allowedRoles={['doctor']}><VetEarnings /></ProtectedRoute>} />
        <Route path="/prescribe" element={<ProtectedRoute allowedRoles={['doctor']}><Prescribe /></ProtectedRoute>} />
        <Route path="/live-chat" element={<ProtectedRoute allowedRoles={['doctor', 'owner']}><LiveChat /></ProtectedRoute>} />
      </Route>
      
      {/* Full-screen protected routes (No Sidebar) */}
      <Route path="/vet-telehealth-room" element={<ProtectedRoute allowedRoles={['doctor', 'owner']}><VetTelehealthRoom /></ProtectedRoute>} />
      <Route path="/doctor-dashboard/video-call/:appointmentId" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorVideoCall /></ProtectedRoute>} />
      <Route path="/owner-dashboard/video-call/:appointmentId" element={<ProtectedRoute allowedRoles={['owner']}><OwnerVideoCall /></ProtectedRoute>} />

      {/* Clinical Admin Portal */}
      <Route path="/admin">
        {/* Admin Login: opens on /admin (http://localhost:5173/admin & https://petcarecomodizo.vercel.app/admin) */}
        <Route index element={<AdminLogin />} />
        <Route path="login" element={<Navigate to="/admin" replace />} />

        {/* Protected Clinical Admin Control Center */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="consultations" element={<AdminAppointments />} />
          <Route path="veterinarians" element={<AdminVeterinarians />} />
          <Route path="owners" element={<AdminOwners />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
