import { apiFetch, fetchListOrEmpty, fetchOneOrNull } from "./client";
import type { Payment, PaymentMethod, PaymentStatus } from "../types";

export interface PaymentPayload {
  paymentBookingId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

// NOTE: unlike every other resource, the backend registers this route
// WITHOUT the `/auth` prefix (see src/payments/payments.route.ts). It still
// requires a Bearer token even though the path looks public.
export function createPayment(payload: PaymentPayload, token: string) {
  return apiFetch<{ message: string; data: Payment[] }>("/payments/createpayment", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getAllPayments(token: string) {
  return fetchListOrEmpty<Payment>("/auth/payments", { token });
}

export function getPaymentById(paymentId: string, token: string) {
  return fetchOneOrNull<Payment>(`/auth/payments/getpaymentbyid/${paymentId}`, { token });
}

export function getPaymentByBookingId(bookingId: string, token: string) {
  return fetchOneOrNull<Payment>(`/auth/payments/getpaymentbybookingid/${bookingId}`, { token });
}

export function updatePayment(paymentId: string, payload: Partial<PaymentPayload>, token: string) {
  return apiFetch<{ message: string; data: Payment }>(`/auth/payments/update/${paymentId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deletePayment(paymentId: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/payments/delete/${paymentId}`, {
    method: "DELETE",
    token,
  });
}
