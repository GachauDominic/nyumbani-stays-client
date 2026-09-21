import { Link } from "react-router-dom";
import { getBookingByGuestId } from "../api/bookings";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { Spinner } from "../components/Spinner";
import { StatusBadge } from "../components/StatusBadge";
import { useAsyncData } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { formatDate, formatMoney, nightsBetween } from "../utils/format";

export function MyBookingsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const guestId = session?.id ?? "";

  const { data: booking, loading, error, reload } = useAsyncData(
    () => getBookingByGuestId(guestId, token),
    [guestId, token],
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My booking</h1>
          <p className="page-subtitle">Details of your stay with us.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading your booking..." />
      ) : !booking ? (
        <EmptyState
          title="No booking yet"
          description="Once you book a room, it'll show up here."
          action={
            <Link to="/rooms" className="btn btn-primary">
              Browse rooms
            </Link>
          }
        />
      ) : (
        <div className="booking-detail-card">
          <div className="booking-detail-header">
            <h2>Room {booking.bookingRoomNumber}</h2>
            <StatusBadge status={booking.bookingStatus} />
          </div>
          <dl className="detail-list">
            <div>
              <dt>Check-in</dt>
              <dd>{formatDate(booking.checkinDate)}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd>{formatDate(booking.checkoutDate)}</dd>
            </div>
            <div>
              <dt>Nights</dt>
              <dd>{nightsBetween(booking.checkinDate, booking.checkoutDate)}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{booking.guestCount}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatMoney(booking.totalAmount)}</dd>
            </div>
            <div>
              <dt>Booked on</dt>
              <dd>{formatDate(booking.bookingDate)}</dd>
            </div>
          </dl>
          <div className="booking-detail-actions">
            <Link to={`/rooms/${booking.bookingRoomNumber}`} className="btn btn-ghost">
              View room
            </Link>
            <Link to={`/bookings/${booking.bookingId}/review`} className="btn btn-primary">
              Leave a review
            </Link>
            <button type="button" className="btn btn-ghost" onClick={reload}>
              Refresh
            </button>
          </div>
          <p className="muted small">
            Payment status isn't visible from a guest account on this API - your host can confirm it.
          </p>
        </div>
      )}
    </div>
  );
}
