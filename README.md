# NyumbaniStays — frontend

A React + TypeScript + Vite frontend for the Accommodation (room-renting / BnB-style) backend.
Built with **Vite, TypeScript, React, and pnpm**, using function components and hooks only
(no Redux/MobX/state-management libraries — auth session lives in a small Context + `useState`,
data fetching goes through two small custom hooks).

## Stack

- **Vite** (React + TS template)
- **React 19** with hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`)
- **react-router-dom v7** for routing
- Plain `fetch` wrapped in a small typed API client (no axios/react-query — kept dependency-free)
- Hand-written CSS design system in `src/index.css` (no UI kit / Tailwind)

## Getting started

```bash
pnpm install
cp .env.example .env   # already done for you; edit if your API runs elsewhere
pnpm dev
```

The app runs at `http://localhost:5173`. **This matters**: the backend's CORS config
(`src/server.ts`) only allows requests from `http://localhost:5173`, so keep the frontend
on Vite's default port in development.

Make sure the backend is running (`pnpm dev` in the `Accommodation` project, default port
`3000`) and that `VITE_API_BASE_URL` in `.env` points at it.

## Project structure

```
src/
  api/            One file per backend resource (auth, guests, rooms, bookings,
                   payments, reviews, approvals) + a shared fetch client (client.ts)
  types/          TS interfaces mirroring the backend's Drizzle schema
  context/        AuthContext — persists the logged-in session to localStorage
  hooks/          useAuth, and generic useAsyncData / useAsyncAction hooks used
                   by every page for loading/error state
  components/     Reusable UI: Navbar, ProtectedRoute, RoomCard, DataTable,
                   Modal, StatusBadge, Spinner, EmptyState, ErrorBanner, StatCard
  pages/          Guest-facing pages (landing, login/register, browse rooms,
                   room details + booking, payment, my booking, leave a review)
  pages/host/     Host dashboard + CRUD pages for rooms/bookings/guests/
                   payments/reviews/approvals
  utils/          JWT decode/expiry helper, currency/date formatting
```

## How auth works

- Logging in as a **guest** or **host** stores `{ token, role, id, firstName, lastName, contact }`
  in `localStorage` and in `AuthContext`.
- Every API call attaches `Authorization: Bearer <token>`.
- `ProtectedRoute` redirects to `/login` if there's no session, and away from the wrong
  dashboard if the role doesn't match (`role="guest"` / `role="hostAdmin"`).
- A JWT-expiry timer in `AuthContext` proactively logs the user out and shows a banner
  the moment their token expires, rather than waiting for a 401. This matters a lot in
  practice — see the first backend note below.

## Known backend quirks this frontend works around

While mapping every route/controller/service, I found a few things in the backend that
are worth knowing about (and probably fixing) — the frontend is built to match the
backend's *actual* behavior, not just what the route names suggest:

1. **Guest tokens expire in ~60 seconds.** In `guest.controller.ts`,
   `loginGuestController` sets `exp: Math.floor(Date.now() / 1000) + 60`, i.e. one
   minute, whereas host tokens get `+ 60*60*24` (24 hours). This is almost certainly a
   typo (`60 * 60 * 24` was probably intended). Guests will get logged out almost
   immediately in practice. The frontend handles this as gracefully as it can (silent
   auto-logout + a visible "your session expired" banner instead of a confusing 401),
   but you'll want to fix the constant backend-side.
2. **Guest login doesn't check a password.** `loginGuestService` looks the guest up by
   `guestContact` only and never compares `guestPassword`. The frontend still collects a
   password for a normal-looking login form and sends it along, but it currently has no
   effect on the backend. Also note `loginGuestController` reads
   `process.env.Jwt_SECRET` (wrong case) instead of `JWT_SECRET` — guest login will throw
   a 500 ("JWT_SECRET is not defined...") unless that env var casing is fixed or an env
   var named exactly `Jwt_SECRET` is also set.
3. **`POST /payments/createpayment` has no `/auth` prefix**, unlike every other route
   in the app, even though it still requires a Bearer token. The frontend calls it
   exactly as registered.
4. **The two "delete approval" routes are wired to `.patch()`, not `.delete()`**
   (`src/approvals/approvals.route.ts`). A real `DELETE` request 404s. The frontend
   calls these with `PATCH` to match what's actually mounted.
5. **Creating a booking doesn't update the room's status.** There's no side effect
   linking `bookings` back to `rooms`, so a freshly booked room still shows as
   `vacant` until a host manually updates it. The Host → Bookings page has a
   "Mark room booked" button for this; you may want to make this an automatic
   step in the backend's `createBookingService` instead.
6. **A guest can only ever see one booking.** `getBookingByGuestIdService` does
   `const [booking] = await db.select(...)` — it destructures the first row even
   though a guest could have many bookings. "My booking" (singular) reflects this
   as-is; if you want guests to see full booking history you'll need a new endpoint
   that returns an array.
7. **Browsing rooms requires being logged in** (`getAllRooms`/`getVacantRooms` use
   `bothRoleAuth`), so there's no public/anonymous room browsing — by design, the
   landing page only offers sign in / sign up, and `/rooms` is behind auth.
8. Several list endpoints return **HTTP 404 with a message body instead of `200` with
   an empty array** when there's nothing to return (e.g. "No rooms found!"). The
   `fetchListOrEmpty` helper in `src/api/client.ts` normalizes this to `[]` so pages
   can render a normal empty state instead of an error.

None of the above stops the app from working end-to-end — items 1 and 2 are the ones
most worth fixing first, since they make the guest login/session experience rough.

## Payment flow note

The backend has no real payment processor integration, so `BookingPaymentPage` simulates
one: choosing "cash" creates a payment with `paymentStatus: "pending"` (for the host to
confirm at check-in via Host → Payments), while card/M-Pesa are marked `"confirmed"`
immediately. Swap this out once/if a real payment gateway is wired up.
