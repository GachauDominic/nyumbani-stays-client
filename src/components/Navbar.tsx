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
      <div className="navbar-inner flex ">
        <NavLink to="/" className="brand flex flex-row justify-center items-center gap-2">
          <img src="../../public/NyumbaniStays_1.jpg" alt="logo" className="hidden md:block max-w-50"/>
           <span className="md:hidden">Nyumbani<span>Stays</span></span>
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

              <label class="btn btn-circle swap swap-rotate">
                {/* this hidden checkbox controls the state  */}
                <input type="checkbox" />

                 {/* hamburger icon  */}
                <svg
                  class="swap-off fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 512 512">
                  <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                </svg>

                {/* close icon */}
                <svg
                  class="swap-on fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 512 512">
                  <polygon
                    points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                </svg>
              </label>
              
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
