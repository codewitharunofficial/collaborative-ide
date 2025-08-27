"use client";

export default function Footer() {
    return (
        <footer className="bg-[#1e1e1e] text-gray-400 py-4 text-center text-sm border-t border-gray-700">
            <p>© {new Date().getFullYear()} Collab Code. Built with Next.js & Socket.IO 🚀</p>
        </footer>
    );
}
