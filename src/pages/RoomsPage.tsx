import { useMemo, useState } from "react";
import { getVacantRooms } from "../api/rooms";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { RoomCard } from "../components/RoomCard";
import { Spinner } from "../components/Spinner";
import { useAsyncData } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";

export function RoomsPage() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const [query, setQuery] = useState("");

  const { data: rooms, loading, error, reload } = useAsyncData(() => getVacantRooms(token), [token]);

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(q) ||
        room.address.toLowerCase().includes(q) ||
        room.roomDescription.toLowerCase().includes(q),
    );
  }, [rooms, query]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Available rooms</h1>
          <p className="page-subtitle">Vacant rooms you can book right now.</p>
        </div>
        <input
          type="search"
          className="search-input"
          placeholder="Search by area, room number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Loading rooms..." />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          title="No vacant rooms right now"
          description="Check back soon, or try clearing your search."
          action={
            <button type="button" className="btn btn-ghost" onClick={reload}>
              Refresh
            </button>
          }
        />
      ) : (
        <div className="room-grid">
          {filteredRooms.map((room) => (
            <RoomCard key={room.roomNumber} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
