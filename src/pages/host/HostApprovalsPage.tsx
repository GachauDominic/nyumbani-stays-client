import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  createApproval,
  deleteApprovalById,
  getAllApprovals,
  getApprovedApprovals,
  getPendingApprovals,
  getRejectedApprovals,
  updateApprovalById,
} from "../../api/approvals";
import type { ApprovalPayload } from "../../api/approvals";
import { getAllGuests } from "../../api/guests";
import { getAllRooms } from "../../api/rooms";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import { StatusBadge } from "../../components/StatusBadge";
import { useAsyncAction, useAsyncData } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import type { Approval, ApprovalStatus } from "../../types";

type Filter = "all" | ApprovalStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function fetcherFor(filter: Filter) {
  switch (filter) {
    case "pending":
      return getPendingApprovals;
    case "approved":
      return getApprovedApprovals;
    case "rejected":
      return getRejectedApprovals;
    default:
      return getAllApprovals;
  }
}

function CreateApprovalForm({
  hostId,
  roomOptions,
  guestOptions,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  hostId: string;
  roomOptions: string[];
  guestOptions: { id: string; label: string }[];
  onSubmit: (payload: ApprovalPayload) => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [roomNum, setRoomNum] = useState(roomOptions[0] ?? "");
  const [guestId, setGuestId] = useState(guestOptions[0]?.id ?? "");
  const [status, setStatus] = useState<ApprovalStatus>("pending");

  return (
    <form
      className="form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit({
          approvedRoomNum: roomNum,
          approvingHostId: hostId,
          approvedGuestId: guestId,
          roomAprovalStatus: status,
        });
      }}
    >
      <ErrorBanner message={error} />
      <label>
        Room
        <select value={roomNum} onChange={(e) => setRoomNum(e.target.value)} required>
          {roomOptions.length === 0 && <option value="">No rooms available</option>}
          {roomOptions.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </label>
      <label>
        Guest
        <select value={guestId} onChange={(e) => setGuestId(e.target.value)} required>
          {guestOptions.length === 0 && <option value="">No guests available</option>}
          {guestOptions.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value as ApprovalStatus)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending || !roomNum || !guestId}>
          {pending ? "Creating..." : "Create approval"}
        </button>
      </div>
    </form>
  );
}

export function HostApprovalsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const hostId = session?.id ?? "";

  const [filter, setFilter] = useState<Filter>("all");
  const { data: approvals, loading, error, reload } = useAsyncData(() => fetcherFor(filter)(token), [filter, token]);

  const { data: rooms } = useAsyncData(() => getAllRooms(token), [token]);
  const { data: guests } = useAsyncData(() => getAllGuests(token), [token]);

  const roomOptions = useMemo(() => (rooms ?? []).map((r) => r.roomNumber), [rooms]);
  const guestOptions = useMemo(
    () => (guests ?? []).map((g) => ({ id: g.guestId, label: `${g.guestFirstName} ${g.guestLastName} (${g.guestContact})` })),
    [guests],
  );

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Approval | null>(null);
  const [editStatus, setEditStatus] = useState<ApprovalStatus>("pending");

  const createAction = useAsyncAction(createApproval);
  const updateAction = useAsyncAction(updateApprovalById);
  const deleteAction = useAsyncAction(deleteApprovalById);

  const handleCreate = async (payload: ApprovalPayload) => {
    const result = await createAction.run(payload, token);
    if (!result) return;
    setShowCreate(false);
    reload();
  };

  const openEdit = (approval: Approval) => {
    setEditing(approval);
    setEditStatus(approval.roomAprovalStatus);
  };

  const handleUpdateStatus = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const result = await updateAction.run(editing.approvalId, { roomAprovalStatus: editStatus }, token);
    if (!result) return;
    setEditing(null);
    reload();
  };

  const handleDelete = async (approval: Approval) => {
    if (!confirm(`Delete this approval for room ${approval.approvedRoomNum}?`)) return;
    const result = await deleteAction.run(approval.approvalId, token);
    if (result === undefined) return;
    reload();
  };

  const columns: Column<Approval>[] = [
    { key: "room", header: "Room", render: (a) => a.approvedRoomNum },
    { key: "guest", header: "Guest", render: (a) => a.approvedGuestId.slice(0, 8) },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.roomAprovalStatus} /> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Room approvals</h1>
          <p className="page-subtitle">Approve or reject a guest's request to occupy a room.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New approval
        </button>
      </div>

      <div className="filter-tabs">
        {FILTERS.map((f) => (
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
        <Spinner label="Loading approvals..." />
      ) : !approvals || approvals.length === 0 ? (
        <EmptyState title="Nothing here" description="Approvals matching this filter will show up here." />
      ) : (
        <DataTable
          columns={columns}
          rows={approvals}
          rowKey={(a) => a.approvalId}
          actions={(approval) => (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(approval)}>
                Change status
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(approval)}>
                Delete
              </button>
            </>
          )}
        />
      )}

      {showCreate && (
        <Modal title="New room approval" onClose={() => setShowCreate(false)}>
          <CreateApprovalForm
            hostId={hostId}
            roomOptions={roomOptions}
            guestOptions={guestOptions}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            pending={createAction.pending}
            error={createAction.error}
          />
        </Modal>
      )}

      {editing && (
        <Modal title={`Update approval - room ${editing.approvedRoomNum}`} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={handleUpdateStatus}>
            <ErrorBanner message={updateAction.error} />
            <label>
              Status
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as ApprovalStatus)}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
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
