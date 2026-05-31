import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute, useSyncProfile } from "./lib/auth";
import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

import LabRoomsPage from "./pages/labrooms/LabRoomsPage";
import LabRoomDetailPage from "./pages/labrooms/LabRoomDetailPage";

import WorkstationsPage from "./pages/workstations/WorkstationsPage";
import WorkstationDetailPage from "./pages/workstations/WorkstationDetailPage";

import MyReservationsPage from "./pages/reservations/MyReservationsPage";
import ReservationQueuePage from "./pages/reservations/ReservationQueuePage";

import IncidentsPage from "./pages/incidents/IncidentsPage";
import IncidentDetailPage from "./pages/incidents/IncidentDetailPage";

import UsersPage from "./pages/admin/UsersPage";
import ReportsPage from "./pages/admin/ReportsPage";

const STAFF_ROLES = ["lab_staff", "system_admin"];
const ADMIN_ROLES = ["system_admin"];

export default function App() {
  useSyncProfile();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <GuestRoute>
            <VerifyEmailPage />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        <Route path="lab-rooms" element={<LabRoomsPage />} />
        <Route path="lab-rooms/:id" element={<LabRoomDetailPage />} />

        <Route path="workstations" element={<WorkstationsPage />} />
        <Route path="workstations/:id" element={<WorkstationDetailPage />} />

        <Route path="reservations/my" element={<MyReservationsPage />} />
        <Route
          path="reservations/queue"
          element={
            <ProtectedRoute roles={STAFF_ROLES}>
              <ReservationQueuePage />
            </ProtectedRoute>
          }
        />

        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="incidents/:id" element={<IncidentDetailPage />} />

        <Route
          path="users"
          element={
            <ProtectedRoute roles={ADMIN_ROLES}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute roles={ADMIN_ROLES}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
