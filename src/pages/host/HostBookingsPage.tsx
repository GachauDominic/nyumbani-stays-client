import { useState } from "react";
import type { FormEvent } from "react";
import { deleteBooking, getAllBookings, updateBooking } from "../../api/bookings";
import type { BookingPayload } from "../../api/bookings";
import { updateRoom } from "../../api/rooms";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import { StatusBadge } from "../../components/StatusBadge";
import { useAsyncAction, useAsyncData } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import type { Booking, BookingStatus } from "../../types";
import { formatDate, formatMoney } from "../../utils/format";

function BookingEditForm({
  booking,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  booking: Booking;
  onSubmit: (payload: Partial<BookingPayload>) => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [checkinDate, setCheckinDate] = useState(booking.checkinDate.slice(0, 10));
  const [checkoutDate, setCheckoutDate] = useState(booking.checkoutDate.slice(0, 10));
  const [guestCount, setGuestCount] = useState(booking.guestCount);
  const [totalAmount, setTotalAmount] = useState(booking.totalAmount);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(booking.bookingStatus);

  return (
    <form
      className="form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit({ checkinDate, checkoutDate, guestCount, totalAmount, bookingStatus });
      }}
    >
      <ErrorBanner message={error} />
      <div className="form-row">
        <label>
          Check-in
          <input type="date" value={checkinDate} onChange={(e) => setCheckinDate(e.target.value)} />
        </label>
        <label>
          Check-out
          <input type="date" value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Guests
          <input
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          />
        </label>
        <label>
          Total amount
          <input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
        </label>
      </div>
      <label>
        Status
        <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}>
          <option value="assigned">Assigned</option>
          <option value="vacant">Vacant</option>
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export function HostBookingsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const { data: bookings, loading, error, reload } = useAsyncData(() => getAllBookings(token), [token]);

  const [editing, setEditing] = useState<Booking | null>(null);
  const updateAction = useAsyncAction(updateBooking);
  const deleteAction = useAsyncAction(deleteBooking);
  const syncRoomAction = useAsyncAction(updateRoom);

  const handleUpdate = async (payload: Partial<BookingPayload>) => {
    if (!editing) return;
    const result = await updateAction.run(editing.bookingId, payload, token);
    if (!result) return;
    setEditing(null);
    reload();
  };

  const handleDelete = async (booking: Booking) => {
    if (!confirm(`Delete this booking for room ${booking.bookingRoomNumber}?`)) return;
    const result = await deleteAction.run(booking.bookingId, token);
    if (result === undefined) return;
    reload();
  };

  const handleSyncRoom = async (booking: Booking) => {
    await syncRoomAction.run(booking.bookingRoomNumber, { roomstatus: "booked" }, token);
  };

  const columns: Column<Booking>[] = [
    { key: "room", header: "Room", render: (b) => b.bookingRoomNumber },
    { key: "checkin", header: "Check-in", render: (b) => formatDate(b.checkinDate) },
    { key: "checkout", header: "Check-out", render: (b) => formatDate(b.checkoutDate) },
    { key: "guests", header: "Guests", render: (b) => b.guestCount },
    { key: "total", header: "Total", render: (b) => formatMoney(b.totalAmount) },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.bookingStatus} /> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p className="page-subtitle">
            All guest bookings. Creating a booking doesn't automatically change the room's status, so use
            "Mark room booked" to keep them in sync.
          </p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading bookings..." />
      ) : !bookings || bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Bookings made by guests will show up here." />
      ) : (
        <DataTable
          columns={columns}
          rows={bookings}
          rowKey={(b) => b.bookingId}
          actions={(booking) => (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(booking)}>
                Edit
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleSyncRoom(booking)}>
                Mark room booked
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(booking)}>
                Delete
              </button>
            </>
          )}
        />
      )}

      {editing && (
        <Modal title={`Edit booking - room ${editing.bookingRoomNumber}`} onClose={() => setEditing(null)}>
          <BookingEditForm
            booking={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            pending={updateAction.pending}
            error={updateAction.error}
          />
        </Modal>
      )}
    </div>
  );
}
