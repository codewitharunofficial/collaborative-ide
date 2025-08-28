"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    console.log(session);

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
                        onClick={() => signOut()}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => signIn("github")}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                >
                    Login with GitHub
                </button>
            )}
        </nav>
    );
}
