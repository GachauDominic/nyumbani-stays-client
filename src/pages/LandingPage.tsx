import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function LandingPage() {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-text">
          <h1>Find a room, book your stay.</h1>
          <p>
            NyumbaniStays connects guests with rooms managed by trusted hosts browse vacant rooms,
            book your dates, and pay in a few clicks.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to={role === "hostAdmin" ? "/host" : "/rooms"} className="btn btn-primary btn-lg">
                {role === "hostAdmin" ? "Go to dashboard" : "Browse rooms"}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get started
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-card hero-card-1">🛏️ Cozy rooms</div>
          <div className="hero-card hero-card-2">📅 Easy booking</div>
          <div className="hero-card hero-card-3">⭐ Real reviews</div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>For guests</h3>
          <p>Browse vacant rooms, book your dates, pay online or on arrival, and leave a review after your stay.</p>
        </div>
        <div className="feature">
          <h3>For hosts</h3>
          <p>List rooms, manage bookings and approvals, track payments, and keep an eye on guest reviews — all in one dashboard.</p>
        </div>
        <div className="feature">
          <h3>Simple &amp; transparent</h3>
          <p>Clear pricing per night, straightforward booking status, and no surprises at checkout.</p>
        </div>
      </section>
    </div>
  );
}
