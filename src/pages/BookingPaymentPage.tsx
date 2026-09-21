import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { createPayment } from "../api/payments";
import { getBookingById } from "../api/bookings";
import { ErrorBanner } from "../components/ErrorBanner";
import { Spinner } from "../components/Spinner";
import { StatusBadge } from "../components/StatusBadge";
import { useAsyncAction, useAsyncData } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import type { Payment, PaymentMethod } from "../types";
import { formatDate, formatMoney, nightsBetween } from "../utils/format";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash on arrival" },
  { value: "creditCard", label: "Credit / debit card" },
  { value: "MPesa_paybill", label: "M-Pesa Paybill" },
];

export function BookingPaymentPage() {
  const { bookingId = "" } = useParams();
  const { session } = useAuth();
  const token = session?.token ?? "";

  const { data: booking, loading, error } = useAsyncData(() => getBookingById(bookingId, token), [bookingId, token]);

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const paymentAction = useAsyncAction(createPayment);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  const handlePay = async (event: FormEvent) => {
    event.preventDefault();
    // No real payment processor is wired up on the backend, so cash is left
    // "pending" for the host to confirm at check-in, while card/M-Pesa are
    // treated as settled immediately to simulate an online payment.
    const status = method === "cash" ? "pending" : "confirmed";

    const result = await paymentAction.run(
      { paymentBookingId: bookingId, paymentMethod: method, paymentStatus: status },
      token,
    );
    if (!result?.data?.[0]) return;
    setCompletedPayment(result.data[0]);
  };

  if (loading) return <Spinner label="Loading booking..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!booking) {
    return (
      <div className="page">
        <p>We couldn't find that booking.</p>
        <Link to="/rooms" className="btn btn-ghost">
          Back to rooms
        </Link>
      </div>
    );
  }

  const nights = nightsBetween(booking.checkinDate, booking.checkoutDate);

  if (completedPayment) {
    return (
      <div className="page auth-page">
        <div className="auth-card confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h1>Booking confirmed</h1>
          <p className="muted">Room {booking.bookingRoomNumber} is yours for {nights} night(s).</p>
          <div className="confirmation-details">
            <div>
              <span>Payment method</span>
              <strong>{METHODS.find((m) => m.value === completedPayment.paymentMethod)?.label}</strong>
            </div>
            <div>
              <span>Payment status</span>
              <StatusBadge status={completedPayment.paymentStatus} />
            </div>
            <div>
              <span>Total paid</span>
              <strong>{formatMoney(booking.totalAmount)}</strong>
            </div>
          </div>
          <Link to="/my-bookings" className="btn btn-primary">
            View my booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>Complete your booking</h1>

        <div className="booking-recap">
          <div>
            <span>Room</span>
            <strong>{booking.bookingRoomNumber}</strong>
          </div>
          <div>
            <span>Dates</span>
            <strong>
              {formatDate(booking.checkinDate)} → {formatDate(booking.checkoutDate)} ({nights} night(s))
            </strong>
          </div>
          <div>
            <span>Guests</span>
            <strong>{booking.guestCount}</strong>
          </div>
          <div className="booking-recap-total">
            <span>Total</span>
            <strong>{formatMoney(booking.totalAmount)}</strong>
          </div>
        </div>

        <form onSubmit={handlePay} className="form">
          <ErrorBanner message={paymentAction.error} />
          <fieldset className="method-choices">
            <legend>Payment method</legend>
            {METHODS.map((m) => (
              <label key={m.value} className="radio-choice">
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={method === m.value}
                  onChange={() => setMethod(m.value)}
                />
                {m.label}
              </label>
            ))}
          </fieldset>
          <p className="muted small">This is a simulated payment step - no real charge will be made.</p>
          <button type="submit" className="btn btn-primary" disabled={paymentAction.pending}>
            {paymentAction.pending ? "Processing..." : `Pay ${formatMoney(booking.totalAmount)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
