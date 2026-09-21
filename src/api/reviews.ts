import { apiFetch, fetchListOrEmpty } from "./client";
import type { Review } from "../types";

export interface ReviewPayload {
  reviewBookingId: string;
  reviewRoomNum: string;
  reviewGuestId: string;
  reviewRating: number;
  reviewComment?: string;
}

export function createReview(payload: ReviewPayload, token: string) {
  return apiFetch<{ message: string; data: Review }>("/auth/reviews/create", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getAllReviews(token: string) {
  return fetchListOrEmpty<Review>("/auth/reviews/all", { token });
}

export function getReviewById(reviewId: string, token: string) {
  return apiFetch<{ data: Review }>(`/auth/reviews/byid/${reviewId}`, { token });
}

export function getReviewsByRoomNum(roomNum: string, token: string) {
  return fetchListOrEmpty<Review>(`/auth/reviews/byroomnum/${roomNum}`, { token });
}

export function updateReviewById(reviewId: string, payload: Partial<ReviewPayload>, token: string) {
  return apiFetch<{ message: string; data: Review }>(`/auth/reviews/update/byid/${reviewId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteReview(reviewId: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/reviews/delete/${reviewId}`, {
    method: "DELETE",
    token,
  });
}
