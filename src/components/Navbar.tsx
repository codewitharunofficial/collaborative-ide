"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-[#1e1e1e] text-white px-6 py-3 flex items-center justify-between shadow-md">
            <h1 className="text-lg font-bold">⚡ Collab Code</h1>
            <div className="space-x-4">
                <Link href="/" className="hover:text-gray-300">Home</Link>
                <Link href="/about" className="hover:text-gray-300">About</Link>
                <Link href="https://github.com/codewitharunofficial/collaborative-ide" target="_blank" className="hover:text-gray-300">GitHub</Link>
            </div>
        </nav>
    );
}
