// Types mirror the backend's Drizzle schema (src/Drizzle/schema.ts)

export type UserRole = "hostAdmin" | "guest";
export type RoomStatus = "vacant" | "booked" | "occupied";
export type BookingStatus = "vacant" | "assigned";
export type PaymentMethod = "cash" | "creditCard" | "MPesa_paybill";
export type PaymentStatus = "unpaid" | "pending" | "confirmed" | "refunded";
export type ApprovalStatus = "approved" | "pending" | "rejected";

export interface Host {
  hostAdminId: string;
  firstName: string;
  lastName: string;
  hostEmail: string;
  hostContact: string;
  role: UserRole;
}

export interface Room {
  roomNumber: string;
  roomDescription: string;
  address: string;
  maxGuest: number;
  pricePerNight: string;
  roomstatus: RoomStatus;
}

export interface Guest {
  guestId: string;
  guestRoomNumber?: string | null;
  guestFirstName: string;
  guestLastName: string;
  guestContact: string;
  role: UserRole;
  guestEmail: string;
  isVerified?: boolean;
}

export interface Booking {
  bookingId: string;
  bookingRoomNumber: string;
  bookingGuestId: string | null;
  checkinDate: string;
  checkoutDate: string;
  guestCount: number;
  totalAmount: string;
  bookingStatus: BookingStatus;
  bookingDate: string;
}

export interface Payment {
  paymentId: string;
  paymentBookingId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate: string;
}

export interface Review {
  reviewId: string;
  reviewBookingId: string;
  reviewRoomNum: string;
  reviewGuestId: string;
  reviewRating: number | null;
  reviewComment: string | null;
  reviewCreatedAt: string | null;
}

export interface Approval {
  approvalId: string;
  approvedRoomNum: string;
  approvingHostId: string;
  approvedGuestId: string;
  roomAprovalStatus: ApprovalStatus;
}

// The shape stored in localStorage / auth context after a successful login
export interface AuthSession {
  token: string;
  role: UserRole;
  id: string;
  firstName: string;
  lastName: string;
  contact: string;
}
