"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

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
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          Collaborative Code Editor
        </h1>
        <p className="text-gray-400 max-w-xl mb-8">
          Create or join a room to start coding together in real-time.
          Share your room ID with friends and build something awesome ✨
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="border border-gray-600 bg-[#1e1e1e] p-3 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleJoin}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-medium transition cursor-pointer"
          >
            Join Room
          </button>
        </div>

        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-medium mt-6 transition cursor-pointer"
        >
          Create New Room
        </button>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
