import { apiFetch, fetchListOrEmpty, fetchOneOrNull } from "./client";
import type { Room, RoomStatus } from "../types";

export interface RoomPayload {
  roomNumber: string;
  roomDescription: string;
  address: string;
  maxGuest: number;
  pricePerNight: string;
  roomstatus?: RoomStatus;
}

export function createRoom(payload: RoomPayload, token: string) {
  return apiFetch<{ message: string; data: Room[] }>("/auth/rooms/create", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getAllRooms(token: string) {
  return fetchListOrEmpty<Room>("/auth/rooms/getall", { token });
}

export function getRoomByNum(roomNum: string, token: string) {
  return fetchOneOrNull<Room>(`/auth/rooms/roombynum/${roomNum}`, { token });
}

export function getRoomsByGuestContact(guestContact: string, token: string) {
  return fetchListOrEmpty<Room>(`/auth/rooms/roombyguestcontact/${guestContact}`, { token });
}

export function getVacantRooms(token: string) {
  return fetchListOrEmpty<Room>("/auth/rooms/vacantrooms", { token });
}

export function getBookedRooms(token: string) {
  return fetchListOrEmpty<Room>("/auth/rooms/bookedrooms", { token });
}

export function getOccupiedRooms(token: string) {
  return fetchListOrEmpty<Room>("/auth/rooms/occupiedrooms", { token });
}

export function updateRoom(roomNum: string, payload: Partial<RoomPayload>, token: string) {
  return apiFetch<{ message: string; data: Room[] }>(`/auth/rooms/roomupdate/${roomNum}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteRoom(roomNum: string, token: string) {
  return apiFetch<{ message: string }>(`/auth/rooms/roomdelete/${roomNum}`, {
    method: "DELETE",
    token,
  });
}
