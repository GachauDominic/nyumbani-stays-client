import { useState } from "react";
import type { FormEvent } from "react";
import { deletePayment, getAllPayments, updatePayment } from "../../api/payments";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import { StatusBadge } from "../../components/StatusBadge";
import { useAsyncAction, useAsyncData } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import type { Payment, PaymentMethod, PaymentStatus } from "../../types";
import { formatDateTime, titleCase } from "../../utils/format";

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "creditCard", "MPesa_paybill"];
const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "pending", "confirmed", "refunded"];

function PaymentEditForm({
  payment,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  payment: Payment;
  onSubmit: (payload: { paymentMethod: PaymentMethod; paymentStatus: PaymentStatus }) => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [method, setMethod] = useState<PaymentMethod>(payment.paymentMethod);
  const [status, setStatus] = useState<PaymentStatus>(payment.paymentStatus);

  return (
    <form
      className="form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit({ paymentMethod: method, paymentStatus: status });
      }}
    >
      <ErrorBanner message={error} />
      <label>
        Method
        <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {titleCase(m)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)}>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
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

export function HostPaymentsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const { data: payments, loading, error, reload } = useAsyncData(() => getAllPayments(token), [token]);

  const [editing, setEditing] = useState<Payment | null>(null);
  const updateAction = useAsyncAction(updatePayment);
  const deleteAction = useAsyncAction(deletePayment);

  const handleUpdate = async (payload: { paymentMethod: PaymentMethod; paymentStatus: PaymentStatus }) => {
    if (!editing) return;
    const result = await updateAction.run(editing.paymentId, payload, token);
    if (!result) return;
    setEditing(null);
    reload();
  };

  const handleDelete = async (payment: Payment) => {
    if (!confirm("Delete this payment record?")) return;
    const result = await deleteAction.run(payment.paymentId, token);
    if (result === undefined) return;
    reload();
  };

  const columns: Column<Payment>[] = [
    { key: "booking", header: "Booking", render: (p) => p.paymentBookingId.slice(0, 8) },
    { key: "method", header: "Method", render: (p) => titleCase(p.paymentMethod) },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.paymentStatus} /> },
    { key: "date", header: "Date", render: (p) => formatDateTime(p.paymentDate) },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p className="page-subtitle">
            Payments guests have submitted for their bookings. Confirm cash payments once collected.
          </p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading payments..." />
      ) : !payments || payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Guest payments will show up here once they check out." />
      ) : (
        <DataTable
          columns={columns}
          rows={payments}
          rowKey={(p) => p.paymentId}
          actions={(payment) => (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(payment)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(payment)}>
                Delete
              </button>
            </>
          )}
        />
      )}

      {editing && (
        <Modal title="Edit payment" onClose={() => setEditing(null)}>
          <PaymentEditForm
            payment={editing}
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
