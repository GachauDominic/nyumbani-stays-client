import { Link } from "react-router-dom";
import type { Room } from "../types";
import { formatMoney } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

export function RoomCard({ room }: { room: Room }) {
  return (
    <Link to={`/rooms/${encodeURIComponent(room.roomNumber)}`} className="room-card">
      <div className="room-card-media" aria-hidden="true">
        <span className="room-card-number">{room.roomNumber}</span>
      </div>
      <div className="room-card-body">
        <div className="room-card-top">
          <h3>Room {room.roomNumber}</h3>
          <StatusBadge status={room.roomstatus} />
        </div>
        <p className="room-card-address">{room.address}</p>
        <p className="room-card-desc">{room.roomDescription}</p>
        <div className="room-card-footer">
          <span className="room-card-price">{formatMoney(room.pricePerNight)} / night</span>
          <span className="room-card-guests">Sleeps {room.maxGuest}</span>
        </div>
      </div>
    </Link>
  );
}
