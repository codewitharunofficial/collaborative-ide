"use client";

import SocketServices from "@/utilities/SocketServices";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SavedUser {
    email: string;
    name: string;
    image: string;
}

export default function Navbar() {
    const { data: session } = useSession();
    const [savedUser, setSavedUser] = useState<SavedUser | null>(null);
    const router = useRouter();

    console.log(session);
    useEffect(() => {
        const data = localStorage.getItem("user");
        if (data) {
            setSavedUser(JSON.parse(data));
        }
    }, []);

    useEffect(() => {
        if (savedUser?.email) {
            SocketServices.emit('user-auth', { user: session?.user, expiresAt: session?.expires });
        } else if (session?.user?.email && session?.user?.email !== null) {
            localStorage.setItem("user", JSON.stringify(session?.user));
            SocketServices.emit('user-auth', { user: savedUser, expiresAt: session?.expires });
        } else if (session?.user?.email === null || !session?.user?.email) {
            router.push("add-email");
        } else {
            console.log("Do Nothing");
        }
    }, [savedUser, session]);

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-[#1e1e1e] shadow-md">
            <h1 className="text-xl font-bold">⚡ CodeIDE</h1>

            {session ? (
                <div className="flex items-center gap-3">
                    <img
                        src={session.user?.image || ""}
                        alt="avatar"
                        className="w-8 h-8 rounded-full"
                    />
                    <span>{session.user?.name}</span>
                    <button
                        onClick={() => {
                            signOut();
                            localStorage.removeItem("user");
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => signIn("github")}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer"
                >
                    Login with GitHub
                </button>
            )}
        </nav>
    );
}
