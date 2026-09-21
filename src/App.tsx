import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RoomsPage } from "./pages/RoomsPage";
import { RoomDetailsPage } from "./pages/RoomDetailsPage";
import { BookingPaymentPage } from "./pages/BookingPaymentPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { LeaveReviewPage } from "./pages/LeaveReviewPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { HostDashboardPage } from "./pages/host/HostDashboardPage";
import { HostRoomsPage } from "./pages/host/HostRoomsPage";
import { HostBookingsPage } from "./pages/host/HostBookingsPage";
import { HostGuestsPage } from "./pages/host/HostGuestsPage";
import { HostPaymentsPage } from "./pages/host/HostPaymentsPage";
import { HostReviewsPage } from "./pages/host/HostReviewsPage";
import { HostApprovalsPage } from "./pages/host/HostApprovalsPage";
import Footer from "./components/Footer";

function SessionExpiredBanner() {
  const { sessionExpiredNotice, dismissExpiredNotice } = useAuth();
  if (!sessionExpiredNotice) return null;
  return (
    <div className="session-banner">
      Your session expired, so we signed you out. Please log in again.
      <button type="button" onClick={dismissExpiredNotice} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <SessionExpiredBanner />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <RoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms/:roomNumber"
            element={
              <ProtectedRoute>
                <RoomDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="guest">
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId/pay"
            element={
              <ProtectedRoute role="guest">
                <BookingPaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId/review"
            element={
              <ProtectedRoute role="guest">
                <LeaveReviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/host"
            element={
              <ProtectedRoute role="hostAdmin">
                <HostDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/rooms"
            element={
              <ProtectedRoute role="hostAdmin">
                <HostRoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/bookings"
            element={
              <ProtectedRoute role="hostAdmin">
                <HostBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/guests"
            element={
              <ProtectedRoute role="hostAdmin">
                <HostGuestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/payments"
            element={
              <ProtectedRoute role="hostAdmin">
                <HostPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/reviews"
            element={
              <ProtectedRoute role="hostAdmin">
                <HostReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/approvals"
            element={
              <ProtectedRoute role="hostAdmin">
                <HostApprovalsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
