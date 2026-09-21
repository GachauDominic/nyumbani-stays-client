import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createRoom, deleteRoom, getAllRooms, updateRoom } from "../../api/rooms";
import type { RoomPayload } from "../../api/rooms";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import { StatusBadge } from "../../components/StatusBadge";
import { useAsyncAction, useAsyncData } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import type { Room, RoomStatus } from "../../types";
import { formatMoney } from "../../utils/format";

const STATUS_FILTERS: { value: RoomStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vacant", label: "Vacant" },
  { value: "booked", label: "Booked" },
  { value: "occupied", label: "Occupied" },
];

const EMPTY_FORM: RoomPayload = {
  roomNumber: "",
  roomDescription: "",
  address: "",
  maxGuest: 2,
  pricePerNight: "",
  roomstatus: "vacant",
};

function RoomForm({
  initial,
  isEdit,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  initial: RoomPayload;
  isEdit: boolean;
  onSubmit: (payload: RoomPayload) => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<RoomPayload>(initial);

  return (
    <form
      className="form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <ErrorBanner message={error} />
      <label>
        Room number
        <input
          required
          disabled={isEdit}
          value={form.roomNumber}
          onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
          placeholder="e.g. 4A"
        />
      </label>
      <label>
        Description
        <textarea
          required
          rows={3}
          value={form.roomDescription}
          onChange={(e) => setForm({ ...form, roomDescription: e.target.value })}
        />
      </label>
      <label>
        Address
        <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </label>
      <div className="form-row">
        <label>
          Max guests
          <input
            type="number"
            required
            min={1}
            value={form.maxGuest}
            onChange={(e) => setForm({ ...form, maxGuest: Number(e.target.value) })}
          />
        </label>
        <label>
          Price / night
          <input
            required
            inputMode="decimal"
            value={form.pricePerNight}
            onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
            placeholder="1500.00"
          />
        </label>
      </div>
      <label>
        Status
        <select
          value={form.roomstatus}
          onChange={(e) => setForm({ ...form, roomstatus: e.target.value as RoomStatus })}
        >
          <option value="vacant">Vacant</option>
          <option value="booked">Booked</option>
          <option value="occupied">Occupied</option>
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving..." : isEdit ? "Save changes" : "Create room"}
        </button>
      </div>
    </form>
  );
}

export function HostRoomsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const { data: rooms, loading, error, reload } = useAsyncData(() => getAllRooms(token), [token]);

  const [filter, setFilter] = useState<RoomStatus | "all">("all");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const createAction = useAsyncAction(createRoom);
  const updateAction = useAsyncAction(updateRoom);
  const deleteAction = useAsyncAction(deleteRoom);

  const filteredRooms = useMemo(
    () => (rooms ?? []).filter((r) => filter === "all" || r.roomstatus === filter),
    [rooms, filter],
  );

  const openCreate = () => {
    setEditingRoom(null);
    setModalMode("create");
  };
  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setModalMode("edit");
  };
  const closeModal = () => setModalMode(null);

  const handleCreate = async (payload: RoomPayload) => {
    const result = await createAction.run(payload, token);
    if (!result) return;
    closeModal();
    reload();
  };

  const handleUpdate = async (payload: RoomPayload) => {
    if (!editingRoom) return;
    const result = await updateAction.run(editingRoom.roomNumber, payload, token);
    if (!result) return;
    closeModal();
    reload();
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Delete room ${room.roomNumber}? This cannot be undone.`)) return;
    const result = await deleteAction.run(room.roomNumber, token);
    if (result === undefined) return;
    reload();
  };

  const columns: Column<Room>[] = [
    { key: "roomNumber", header: "Room #", render: (r) => r.roomNumber },
    { key: "address", header: "Address", render: (r) => r.address },
    { key: "maxGuest", header: "Max guests", render: (r) => r.maxGuest },
    { key: "price", header: "Price / night", render: (r) => formatMoney(r.pricePerNight) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.roomstatus} /> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Rooms</h1>
          <p className="page-subtitle">Create and manage the rooms guests can book.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add room
        </button>
      </div>

      <div className="filter-tabs">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={filter === f.value ? "active" : ""}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading rooms..." />
      ) : filteredRooms.length === 0 ? (
        <EmptyState title="No rooms here" description="Try a different filter, or add your first room." />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredRooms}
          rowKey={(r) => r.roomNumber}
          actions={(room) => (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(room)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(room)}>
                Delete
              </button>
            </>
          )}
        />
      )}

      {modalMode === "create" && (
        <Modal title="Add a new room" onClose={closeModal}>
          <RoomForm
            initial={EMPTY_FORM}
            isEdit={false}
            onSubmit={handleCreate}
            onCancel={closeModal}
            pending={createAction.pending}
            error={createAction.error}
          />
        </Modal>
      )}

      {modalMode === "edit" && editingRoom && (
        <Modal title={`Edit room ${editingRoom.roomNumber}`} onClose={closeModal}>
          <RoomForm
            initial={editingRoom}
            isEdit
            onSubmit={handleUpdate}
            onCancel={closeModal}
            pending={updateAction.pending}
            error={updateAction.error}
          />
        </Modal>
      )}
    </div>
  );
}
