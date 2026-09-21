import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerHost } from "../api/auth";
import { registerGuest } from "../api/guests";
import { ErrorBanner } from "../components/ErrorBanner";
import { useAsyncAction } from "../hooks/useAsync";

type Tab = "guest" | "host";

export function RegisterPage() {
  const [tab, setTab] = useState<Tab>("guest");
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [guestForm, setGuestForm] = useState({
    guestFirstName: "",
    guestLastName: "",
    guestContact: "",
    guestEmail: "",
    guestPassword: "",
  });
  const guestRegisterAction = useAsyncAction(registerGuest);

  const [hostForm, setHostForm] = useState({
    firstName: "",
    lastName: "",
    hostEmail: "",
    hostContact: "",
    hostPasswordHash: "",
  });
  const hostRegisterAction = useAsyncAction(registerHost);

  const handleGuestSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await guestRegisterAction.run(guestForm);
    if (!result) return;
    setSuccessMessage("Account created! You can now sign in.");
    setTimeout(() => navigate("/login"), 900);
  };

  const handleHostSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await hostRegisterAction.run(hostForm);
    if (!result) return;
    setSuccessMessage("Host account created! You can now sign in.");
    setTimeout(() => navigate("/login"), 900);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <div className="tab-switch">
          <button
            type="button"
            className={tab === "guest" ? "active" : ""}
            onClick={() => {
              setTab("guest");
              setSuccessMessage(null);
            }}
          >
            I'm a guest
          </button>
          <button
            type="button"
            className={tab === "host" ? "active" : ""}
            onClick={() => {
              setTab("host");
              setSuccessMessage(null);
            }}
          >
            I'm a host
          </button>
        </div>

        {successMessage && <div className="success-banner">{successMessage}</div>}

        {tab === "guest" ? (
          <form onSubmit={handleGuestSubmit} className="form">
            <ErrorBanner message={guestRegisterAction.error} />
            <div className="form-row">
              <label>
                First name
                <input
                  required
                  value={guestForm.guestFirstName}
                  onChange={(e) => setGuestForm({ ...guestForm, guestFirstName: e.target.value })}
                />
              </label>
              <label>
                Last name
                <input
                  required
                  value={guestForm.guestLastName}
                  onChange={(e) => setGuestForm({ ...guestForm, guestLastName: e.target.value })}
                />
              </label>
            </div>
            <label>
              Contact number
              <input
                required
                placeholder="07XXXXXXXX"
                value={guestForm.guestContact}
                onChange={(e) => setGuestForm({ ...guestForm, guestContact: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={guestForm.guestEmail}
                onChange={(e) => setGuestForm({ ...guestForm, guestEmail: e.target.value })}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={guestForm.guestPassword}
                onChange={(e) => setGuestForm({ ...guestForm, guestPassword: e.target.value })}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={guestRegisterAction.pending}>
              {guestRegisterAction.pending ? "Creating account..." : "Create guest account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleHostSubmit} className="form">
            <ErrorBanner message={hostRegisterAction.error} />
            <div className="form-row">
              <label>
                First name
                <input
                  required
                  value={hostForm.firstName}
                  onChange={(e) => setHostForm({ ...hostForm, firstName: e.target.value })}
                />
              </label>
              <label>
                Last name
                <input
                  required
                  value={hostForm.lastName}
                  onChange={(e) => setHostForm({ ...hostForm, lastName: e.target.value })}
                />
              </label>
            </div>
            <label>
              Contact number
              <input
                required
                placeholder="07XXXXXXXX"
                value={hostForm.hostContact}
                onChange={(e) => setHostForm({ ...hostForm, hostContact: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={hostForm.hostEmail}
                onChange={(e) => setHostForm({ ...hostForm, hostEmail: e.target.value })}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={hostForm.hostPasswordHash}
                onChange={(e) => setHostForm({ ...hostForm, hostPasswordHash: e.target.value })}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={hostRegisterAction.pending}>
              {hostRegisterAction.pending ? "Creating account..." : "Create host account"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
