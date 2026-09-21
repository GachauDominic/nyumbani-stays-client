import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { session, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <img src="../../public/NyumbaniStays_1.jpg" alt="logo" className="max-w-50 md:hidden"/>
           Nyumbani<span>Stays</span>
        </NavLink>

        <nav className="nav-links">
          {isAuthenticated && role === "guest" && (
            <>
              <NavLink to="/rooms">Browse rooms</NavLink>
              <NavLink to="/my-bookings">My booking</NavLink>
            </>
          )}

          {isAuthenticated && role === "hostAdmin" && (
            <>
              <NavLink to="/host">Dashboard</NavLink>
              <NavLink to="/host/rooms">Rooms</NavLink>
              <NavLink to="/host/bookings">Bookings</NavLink>
              <NavLink to="/host/approvals">Approvals</NavLink>
              <NavLink to="/host/payments">Payments</NavLink>
              <NavLink to="/host/reviews">Reviews</NavLink>
              <NavLink to="/host/guests">Guests</NavLink>
            </>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated && session ? (
            <>
              <span className="navbar-user">
                {session.firstName} <small>({role === "hostAdmin" ? "Host" : "Guest"})</small>
              </span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
