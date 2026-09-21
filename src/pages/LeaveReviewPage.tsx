import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBookingById } from "../api/bookings";
import { createReview } from "../api/reviews";
import { ErrorBanner } from "../components/ErrorBanner";
import { Spinner } from "../components/Spinner";
import { useAsyncAction, useAsyncData } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";

const RATINGS = [1, 2, 3, 4, 5];

export function LeaveReviewPage() {
  const { bookingId = "" } = useParams();
  const { session } = useAuth();
  const token = session?.token ?? "";
  const navigate = useNavigate();

  const { data: booking, loading, error } = useAsyncData(() => getBookingById(bookingId, token), [bookingId, token]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const reviewAction = useAsyncAction(createReview);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!booking || !session) return;

    const result = await reviewAction.run(
      {
        reviewBookingId: bookingId,
        reviewRoomNum: booking.bookingRoomNumber,
        reviewGuestId: session.id,
        reviewRating: rating,
        reviewComment: comment || undefined,
      },
      token,
    );
    if (!result) return;
    setSubmitted(true);
    setTimeout(() => navigate(`/rooms/${booking.bookingRoomNumber}`), 1200);
  };

  if (loading) return <Spinner label="Loading booking..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!booking) {
    return (
      <div className="page">
        <p>We couldn't find that booking.</p>
        <Link to="/my-bookings" className="btn btn-ghost">
          Back to my booking
        </Link>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>Rate your stay</h1>
        <p className="muted">Room {booking.bookingRoomNumber}</p>

        {submitted ? (
          <div className="success-banner">Thanks for your review!</div>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <ErrorBanner message={reviewAction.error} />
            <fieldset className="star-choices">
              <legend>Rating</legend>
              {RATINGS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-btn ${value <= rating ? "filled" : ""}`}
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </fieldset>
            <label>
              Comment (optional)
              <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={reviewAction.pending}>
              {reviewAction.pending ? "Submitting..." : "Submit review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
