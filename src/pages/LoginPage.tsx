import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginHost } from "../api/auth";
import { loginGuest } from "../api/guests";
import { ErrorBanner } from "../components/ErrorBanner";
import { useAsyncAction } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import type { AuthSession } from "../types";

type Tab = "guest" | "host";

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const [tab, setTab] = useState<Tab>("guest");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from;

  const [guestContact, setGuestContact] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const guestLoginAction = useAsyncAction(loginGuest);

  const [hostEmail, setHostEmail] = useState("");
  const [hostPassword, setHostPassword] = useState("");
  const hostLoginAction = useAsyncAction(loginHost);

  const handleGuestSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await guestLoginAction.run({ guestContact, guestPassword });
    if (!result) return;
    const session: AuthSession = {
      token: result.token,
      role: "guest",
      id: result.host.guestId,
      firstName: result.host.guestFirstName,
      lastName: result.host.guestLastName,
      contact: guestContact,
    };
    login(session);
    navigate(redirectTo ?? "/rooms");
  };

  const handleHostSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await hostLoginAction.run({ hostEmail, hostPasswordHash: hostPassword });
    if (!result) return;
    const session: AuthSession = {
      token: result.token,
      role: "hostAdmin",
      id: result.host.hostAdminId,
      firstName: result.host.firstName,
      lastName: result.host.lastName,
      contact: result.host.hostEmail,
    };
    login(session);
    navigate(redirectTo ?? "/host");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <div className="tab-switch">
          <button type="button" className={tab === "guest" ? "active" : ""} onClick={() => setTab("guest")}>
            I'm a guest
          </button>
          <button type="button" className={tab === "host" ? "active" : ""} onClick={() => setTab("host")}>
            I'm a host
          </button>
        </div>

        {tab === "guest" ? (
          <form onSubmit={handleGuestSubmit} className="form">
            <ErrorBanner message={guestLoginAction.error} />
            <label>
              Contact number
              <input
                type="text"
                required
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
                placeholder="07XXXXXXXX"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={guestLoginAction.pending}>
              {guestLoginAction.pending ? "Signing in..." : "Sign in as guest"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleHostSubmit} className="form">
            <ErrorBanner message={hostLoginAction.error} />
            <label>
              Email
              <input
                type="email"
                required
                value={hostEmail}
                onChange={(e) => setHostEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={hostPassword}
                onChange={(e) => setHostPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={hostLoginAction.pending}>
              {hostLoginAction.pending ? "Signing in..." : "Sign in as host"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
