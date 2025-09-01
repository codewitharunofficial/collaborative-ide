"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SocketServices from "@/utilities/SocketServices";
import CodeEditor from "@/components/CodeEditor";

export default function EditorPageClient() {
    const params = useParams();
    const roomId = params?.roomId;

    const [code, setCode] = useState("// Start coding...");
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [language, setLanguage] = useState("javascript");

    // join room & listen for updates
    useEffect(() => {
        if (!roomId) return;

        SocketServices.emit("join-room", { roomId }, (res) => {
            console.log("Joined room response:", res);
        });

        // Code updates
        SocketServices.on("code-update", (newCode) => {
            setCode(newCode);
        });

        // Language updates
        SocketServices.on("language-update", (newLanguage) => {
            setLanguage(newLanguage);
        });

        // Terminal outputs
        SocketServices.on("terminal-output", ({ command, output }) => {
            setTerminalOutput((prev) => [...prev, { command, output }]);
        });

        return () => {
            SocketServices.emit("leave-room", { roomId });
            SocketServices.socket.off("code-update");
            SocketServices.socket.off("language-update");
            SocketServices.socket.off("terminal-output");
        };
    }, [roomId]);

    // Handle editor code change
    const handleEditorChange = (value) => {
        setCode(value || "");
        SocketServices.emit("code-change", { roomId, code: value });
    };

    // Handle language change
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        SocketServices.emit("language-change", { roomId, language: newLang });
    };

    // Handle terminal commands
    const handleCommand = (e) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
            const command = e.currentTarget.value;
            SocketServices.emit("terminal-command", { roomId, command });
            e.currentTarget.value = "";
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">

            <div className="flex items-center justify-between px-6 py-1 bg-[#222] border-b border-gray-700">
                <span className="font-semibold text-md">CodeIDE</span>
                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-[#111] text-white text-sm px-2 py-1 rounded"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                    <span className="text-sm text-gray-400">Room: {roomId}</span>
                </div>
            </div>


            <div className="flex flex-1 flex-col lg:flex-row">
                {/* Code Editor */}
                <CodeEditor
                    value={code}
                    onChange={handleEditorChange}
                    language={language}
                />

                {/* Terminal */}
                <div className="w-full lg:w-1/3 bg-black text-green-400 flex flex-col">
                    <div className="flex-1 overflow-y-auto font-mono text-sm p-3 space-y-1">
                        {terminalOutput.map((msg, i) => (
                            <div key={i}>
                                {msg.command && (
                                    <div className="text-green-300">➜ {msg.command}</div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.output}</div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-700 p-2">
                        <input
                            type="text"
                            placeholder="Type a command and press Enter..."
                            onKeyDown={handleCommand}
                            className="w-full bg-[#111] text-white p-2 rounded outline-none font-mono text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
