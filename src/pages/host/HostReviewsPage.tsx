import { useState } from "react";
import type { FormEvent } from "react";
import { deleteReview, getAllReviews, updateReviewById } from "../../api/reviews";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import { useAsyncAction, useAsyncData } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import type { Review } from "../../types";
import { formatDate } from "../../utils/format";

function ReviewEditForm({
  review,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  review: Review;
  onSubmit: (payload: { reviewRating: number; reviewComment?: string }) => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [rating, setRating] = useState(review.reviewRating ?? 5);
  const [comment, setComment] = useState(review.reviewComment ?? "");

  return (
    <form
      className="form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit({ reviewRating: rating, reviewComment: comment || undefined });
      }}
    >
      <ErrorBanner message={error} />
      <label>
        Rating
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} star{value > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>
      <label>
        Comment
        <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
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

export function HostReviewsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const { data: reviews, loading, error, reload } = useAsyncData(() => getAllReviews(token), [token]);

  const [editing, setEditing] = useState<Review | null>(null);
  const updateAction = useAsyncAction(updateReviewById);
  const deleteAction = useAsyncAction(deleteReview);

  const handleUpdate = async (payload: { reviewRating: number; reviewComment?: string }) => {
    if (!editing) return;
    const result = await updateAction.run(editing.reviewId, payload, token);
    if (!result) return;
    setEditing(null);
    reload();
  };

  const handleDelete = async (review: Review) => {
    if (!confirm("Delete this review?")) return;
    const result = await deleteAction.run(review.reviewId, token);
    if (result === undefined) return;
    reload();
  };

  const columns: Column<Review>[] = [
    { key: "room", header: "Room", render: (r) => r.reviewRoomNum },
    { key: "rating", header: "Rating", render: (r) => "★".repeat(r.reviewRating ?? 0) || "-" },
    { key: "comment", header: "Comment", render: (r) => r.reviewComment ?? <span className="muted">-</span> },
    { key: "date", header: "Posted", render: (r) => formatDate(r.reviewCreatedAt) },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p className="page-subtitle">What guests are saying about your rooms.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading reviews..." />
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Reviews left by guests after their stay will appear here." />
      ) : (
        <DataTable
          columns={columns}
          rows={reviews}
          rowKey={(r) => r.reviewId}
          actions={(review) => (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(review)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(review)}>
                Delete
              </button>
            </>
          )}
        />
      )}

      {editing && (
        <Modal title="Edit review" onClose={() => setEditing(null)}>
          <ReviewEditForm
            review={editing}
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
