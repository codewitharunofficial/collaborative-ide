"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  console.log( process.env.NEXT_APP_PUBLIC_URL)

  const handleJoin = () => {
    if (roomId.trim()) {
      router.push(`/editor/${roomId}`);
    }
  };

  const handleCreate = () => {
    const newRoomId = uuidv4();
    router.push(`/editor/${newRoomId}?create=true`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Collaborative Code Editor</h1>

      <div className="flex gap-2">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID"
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handleJoin}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Join Room
        </button>
      </div>

      <button
        onClick={handleCreate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create New Room
      </button>
    </div>
  );
}
