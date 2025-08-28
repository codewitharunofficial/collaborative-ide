"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import SocketServices from "@/utilities/SocketServices";

// load Monaco dynamically
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorPageClient() {
    const params = useParams();
    const roomId = params?.roomId;

    const [code, setCode] = useState("// Start coding...");
    const [terminalOutput, setTerminalOutput] = useState([]);

    // join room & listen for updates
    useEffect(() => {
        if (!roomId) return;

        SocketServices.emit("join-room", { roomId }, (res) => {
            console.log("Joined room response:", res);
        });

        SocketServices.on("code-update", (newCode) => {
            setCode(newCode);
        });

        SocketServices.on("terminal-output", (output) => {
            setTerminalOutput((prev) => [...prev, output]);
        });

        return () => {
            SocketServices.emit("leave-room", { roomId });
        };
    }, [roomId]);

    const handleEditorChange = (value) => {
        setCode(value || "");
        SocketServices.emit("code-change", { roomId, code: value });
    };

    const handleCommand = (e) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
            const command = e.currentTarget.value;
            SocketServices.emit("terminal-command", { roomId, command });
            setTerminalOutput((prev) => [...prev, `> ${command}`]);
            e.currentTarget.value = "";
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#222] border-b border-gray-700">
                <span className="font-semibold">Collaborative Editor</span>
                <span className="text-sm text-gray-400">Room: {roomId}</span>
            </div>

            {/* Editor + Terminal */}
            <div className="flex flex-1 flex-col lg:flex-row">
                {/* Editor */}
                <div className="flex-1 border-r border-gray-700">
                    <MonacoEditor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={handleEditorChange}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: true },
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Terminal */}
                <div className="w-full lg:w-1/3 bg-black text-green-400 p-3 flex flex-col">
                    <div className="flex-1 overflow-y-auto font-mono text-sm mb-2">
                        {terminalOutput.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Type a command and press Enter..."
                        onKeyDown={handleCommand}
                        className="bg-[#111] text-white p-2 rounded outline-none font-mono text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
