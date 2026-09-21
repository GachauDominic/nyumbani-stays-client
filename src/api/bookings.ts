import { apiFetch, fetchListOrEmpty, fetchOneOrNull } from "./client";
import type { Booking, BookingStatus } from "../types";

export interface BookingPayload {
  bookingRoomNumber: string;
  bookingGuestId: string;
  checkinDate: string;
  checkoutDate: string;
  guestCount: number;
  totalAmount: string;
  bookingStatus: BookingStatus;
}

export function createBooking(payload: BookingPayload, token: string) {
  return apiFetch<{ message: string; data: Booking[] }>("/auth/booking/create", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getAllBookings(token: string) {
  return fetchListOrEmpty<Booking>("/auth/bookings", { token });
}

export function getBookingById(bookingId: string, token: string) {
  return fetchOneOrNull<Booking>(`/auth/bookings/bookingbyid/${bookingId}`, { token });
}

export function getBookingByGuestId(guestId: string, token: string) {
  return fetchOneOrNull<Booking>(`/auth/bookings/bookingbyguestid/${guestId}`, { token });
}

export function updateBooking(bookingId: string, payload: Partial<BookingPayload>, token: string) {
  return apiFetch<{ message: string; data: Booking[] }>(`/auth/bookings/updatebyid/${bookingId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteBooking(bookingId: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/bookings/deletebyid/${bookingId}`, {
    method: "DELETE",
    token,
  });
}
