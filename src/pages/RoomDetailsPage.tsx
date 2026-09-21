import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createBooking } from "../api/bookings";
import { getRoomByNum } from "../api/rooms";
import { getReviewsByRoomNum } from "../api/reviews";
import { ErrorBanner } from "../components/ErrorBanner";
import { Spinner } from "../components/Spinner";
import { StatusBadge } from "../components/StatusBadge";
import { useAsyncAction, useAsyncData } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { formatDate, formatMoney, nightsBetween, titleCase } from "../utils/format";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RoomDetailsPage() {
  const { roomNumber = "" } = useParams();
  const { session, role } = useAuth();
  const token = session?.token ?? "";
  const navigate = useNavigate();

  const { data: room, loading: roomLoading, error: roomError } = useAsyncData(
    () => getRoomByNum(roomNumber, token),
    [roomNumber, token],
  );
  const { data: reviews, loading: reviewsLoading } = useAsyncData(
    () => getReviewsByRoomNum(roomNumber, token),
    [roomNumber, token],
  );

  const [checkinDate, setCheckinDate] = useState(todayIso());
  const [checkoutDate, setCheckoutDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const bookingAction = useAsyncAction(createBooking);

  const nights = useMemo(
    () => (checkinDate && checkoutDate ? nightsBetween(checkinDate, checkoutDate) : 0),
    [checkinDate, checkoutDate],
  );
  const total = useMemo(() => {
    if (!room || nights <= 0) return 0;
    return nights * Number.parseFloat(room.pricePerNight);
  }, [room, nights]);

  const handleBook = async (event: FormEvent) => {
    event.preventDefault();
    if (!room || !session || nights <= 0) return;

    const result = await bookingAction.run(
      {
        bookingRoomNumber: room.roomNumber,
        bookingGuestId: session.id,
        checkinDate,
        checkoutDate,
        guestCount,
        totalAmount: total.toFixed(2),
        bookingStatus: "assigned",
      },
      token,
    );
    if (!result?.data?.[0]) return;
    navigate(`/bookings/${result.data[0].bookingId}/pay`);
  };

  if (roomLoading) return <Spinner label="Loading room..." />;
  if (roomError) return <ErrorBanner message={roomError} />;
  if (!room) {
    return (
      <div className="page">
        <p>Room not found.</p>
        <Link to="/rooms" className="btn btn-ghost">
          Back to rooms
        </Link>
      </div>
    );
  }

  const canBook = role === "guest" && room.roomstatus === "vacant";

  return (
    <div className="page room-details">
      <Link to="/rooms" className="back-link">
        ← Back to rooms
      </Link>

      <div className="room-details-grid">
        <div className="room-details-main">
          <div className="room-details-header">
            <h1>Room {room.roomNumber}</h1>
            <StatusBadge status={room.roomstatus} />
          </div>
          <p className="room-details-address">{room.address}</p>
          <p className="room-details-desc">{room.roomDescription}</p>
          <ul className="room-details-facts">
            <li>
              <strong>{formatMoney(room.pricePerNight)}</strong> per night
            </li>
            <li>Sleeps up to {room.maxGuest} guests</li>
          </ul>

          <section className="reviews-section">
            <h2>Guest reviews</h2>
            {reviewsLoading ? (
              <Spinner label="Loading reviews..." />
            ) : !reviews || reviews.length === 0 ? (
              <p className="muted">No reviews yet for this room.</p>
            ) : (
              <ul className="review-list">
                {reviews.map((review) => (
                  <li key={review.reviewId} className="review-item">
                    <div className="review-rating">
                      {"★".repeat(review.reviewRating ?? 0)}
                      {"☆".repeat(5 - (review.reviewRating ?? 0))}
                    </div>
                    {review.reviewComment && <p>{review.reviewComment}</p>}
                    <span className="muted small">{formatDate(review.reviewCreatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="booking-panel">
          {canBook ? (
            <form onSubmit={handleBook} className="form">
              <h3>{formatMoney(room.pricePerNight)} / night</h3>
              <ErrorBanner message={bookingAction.error} />
              <label>
                Check-in
                <input
                  type="date"
                  required
                  min={todayIso()}
                  value={checkinDate}
                  onChange={(e) => setCheckinDate(e.target.value)}
                />
              </label>
              <label>
                Check-out
                <input
                  type="date"
                  required
                  min={checkinDate}
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                />
              </label>
              <label>
                Guests
                <input
                  type="number"
                  required
                  min={1}
                  max={room.maxGuest}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
              </label>

              {nights > 0 && (
                <div className="booking-summary">
                  <div>
                    <span>{nights} night(s)</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                  <div className="booking-total">
                    <span>Total</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={bookingAction.pending || nights <= 0}>
                {bookingAction.pending ? "Booking..." : "Book this room"}
              </button>
            </form>
          ) : room.roomstatus !== "vacant" ? (
            <div className="booking-panel-notice">
              This room is currently <strong>{titleCase(room.roomstatus)}</strong> and not available to book.
            </div>
          ) : role === "hostAdmin" ? (
            <div className="booking-panel-notice">Bookings are made from a guest account.</div>
          ) : (
            <div className="booking-panel-notice">
              <Link to="/login" state={{ from: `/rooms/${room.roomNumber}` }}>
                Log in
              </Link>{" "}
              as a guest to book this room.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
