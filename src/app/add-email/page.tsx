"use client";

import SocketServices from "@/utilities/SocketServices";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddEmailPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const { data: session } = useSession();
    const router = useRouter();

    const handleAddEmail = () => {
        if (!email.trim()) {
            setMessage("Please enter a valid email.");
            return;
        }
        // TODO: send email to backend or API
        setMessage(`✅ Email ${email} added successfully!`);
        const user = { ...session?.user, email: email };
        localStorage.setItem("user", JSON.stringify(user));
        SocketServices.emit('user-auth', { user, expiresAt: session?.expires });
    };

    useEffect(() => {
        SocketServices.on('successful-auth', () => {
            router.push("/");
        });
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
            <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Add Your Email</h1>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded bg-[#2a2a2a] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
                />

                <button
                    onClick={handleAddEmail}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded font-medium transition cursor-pointer"
                >
                    Add Email
                </button>

                {message && (
                    <p className="mt-4 text-sm text-gray-300">{message}</p>
                )}
            </div>
        </div>
    );
}
