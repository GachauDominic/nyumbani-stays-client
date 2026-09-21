import { useState } from "react";
import type { FormEvent } from "react";
import { deleteGuestByContact, getAllGuests, updateGuest } from "../../api/guests";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import { useAsyncAction, useAsyncData } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import type { Guest } from "../../types";

export function HostGuestsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const { data: guests, loading, error, reload } = useAsyncData(() => getAllGuests(token), [token]);

  const [editing, setEditing] = useState<Guest | null>(null);
  const [roomNumInput, setRoomNumInput] = useState("");
  const updateAction = useAsyncAction(updateGuest);
  const deleteAction = useAsyncAction(deleteGuestByContact);

  const openEdit = (guest: Guest) => {
    setEditing(guest);
    setRoomNumInput(guest.guestRoomNumber ?? "");
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const result = await updateAction.run(
      editing.guestContact,
      { guestRoomNumber: roomNumInput || null },
      token,
    );
    if (!result) return;
    setEditing(null);
    reload();
  };

  const handleDelete = async (guest: Guest) => {
    if (!confirm(`Delete guest ${guest.guestFirstName} ${guest.guestLastName}?`)) return;
    const result = await deleteAction.run(guest.guestContact, token);
    if (result === undefined) return;
    reload();
  };

  const columns: Column<Guest>[] = [
    { key: "name", header: "Name", render: (g) => `${g.guestFirstName} ${g.guestLastName}` },
    { key: "contact", header: "Contact", render: (g) => g.guestContact },
    { key: "email", header: "Email", render: (g) => g.guestEmail },
    { key: "room", header: "Assigned room", render: (g) => g.guestRoomNumber ?? "-" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Guests</h1>
          <p className="page-subtitle">Everyone with a guest account.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading guests..." />
      ) : !guests || guests.length === 0 ? (
        <EmptyState title="No guests yet" description="Guest accounts will appear here once people sign up." />
      ) : (
        <DataTable
          columns={columns}
          rows={guests}
          rowKey={(g) => g.guestId}
          actions={(guest) => (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(guest)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(guest)}>
                Delete
              </button>
            </>
          )}
        />
      )}

      {editing && (
        <Modal title={`Edit ${editing.guestFirstName} ${editing.guestLastName}`} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={handleUpdate}>
            <ErrorBanner message={updateAction.error} />
            <label>
              Assigned room number
              <input
                value={roomNumInput}
                onChange={(e) => setRoomNumInput(e.target.value)}
                placeholder="Leave blank to unassign"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updateAction.pending}>
                {updateAction.pending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
