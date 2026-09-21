import { Link } from "react-router-dom";
import { getAllRooms } from "../../api/rooms";
import { getAllBookings } from "../../api/bookings";
import { getPendingApprovals } from "../../api/approvals";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Spinner } from "../../components/Spinner";
import { StatCard } from "../../components/StatCard";
import { useAsyncData } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";

export function HostDashboardPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";

  const rooms = useAsyncData(() => getAllRooms(token), [token]);
  const bookings = useAsyncData(() => getAllBookings(token), [token]);
  const pendingApprovals = useAsyncData(() => getPendingApprovals(token), [token]);

  const loading = rooms.loading || bookings.loading || pendingApprovals.loading;
  const error = rooms.error || bookings.error || pendingApprovals.error;

  const vacantCount = rooms.data?.filter((r) => r.roomstatus === "vacant").length ?? 0;
  const bookedCount = rooms.data?.filter((r) => r.roomstatus === "booked").length ?? 0;
  const occupiedCount = rooms.data?.filter((r) => r.roomstatus === "occupied").length ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {session?.firstName}</h1>
          <p className="page-subtitle">Here's how things are looking today.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading dashboard..." />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total rooms" value={rooms.data?.length ?? 0} />
            <StatCard label="Vacant" value={vacantCount} />
            <StatCard label="Booked" value={bookedCount} />
            <StatCard label="Occupied" value={occupiedCount} />
            <StatCard label="Total bookings" value={bookings.data?.length ?? 0} />
            <StatCard label="Pending approvals" value={pendingApprovals.data?.length ?? 0} />
          </div>

          <div className="quick-links">
            <Link to="/host/rooms" className="quick-link-card">
              <h3>Manage rooms</h3>
              <p>Add, edit or remove rooms and update their status.</p>
            </Link>
            <Link to="/host/bookings" className="quick-link-card">
              <h3>Bookings</h3>
              <p>Review guest bookings and keep room status in sync.</p>
            </Link>
            <Link to="/host/approvals" className="quick-link-card">
              <h3>Approvals</h3>
              <p>{pendingApprovals.data?.length ?? 0} pending approval(s) waiting on you.</p>
            </Link>
            <Link to="/host/payments" className="quick-link-card">
              <h3>Payments</h3>
              <p>Track and confirm guest payments.</p>
            </Link>
            <Link to="/host/reviews" className="quick-link-card">
              <h3>Reviews</h3>
              <p>See what guests are saying about your rooms.</p>
            </Link>
            <Link to="/host/guests" className="quick-link-card">
              <h3>Guests</h3>
              <p>Browse registered guest accounts.</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
