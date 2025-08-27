"use client";

import { useState } from "react";
import { FiFile, FiSearch, FiGitBranch, FiPlay, FiBox, FiTerminal } from "react-icons/fi";
import Editor from "@monaco-editor/react";
import SocketServices from "@/utilities/SocketServices";

export default function EditorPageClient({ roomId }: { roomId: string }) {
    const [activeFile, setActiveFile] = useState("index.js");
    const [files] = useState(["index.js", "style.css", "app.tsx"]);
    const [code, setCode] = useState("// Start coding...");
    const [showTerminal, setShowTerminal] = useState(true);
    const [terminalOutput, setTerminalOutput] = useState<string[]>([
        "Welcome to the Collaborative Code Editor Terminal",
    ]);

    return (
        <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-200">
            {/* Top Bar */}
            <div className="h-10 bg-[#2d2d2d] flex items-center px-4 text-sm">
                <span className="font-semibold">{activeFile}</span>
                <span className="ml-auto text-xs text-gray-400">
                    Room: {roomId}
                </span>
            </div>

            <div className="flex flex-1">
                {/* Left Activity Bar */}
                <div className="w-12 bg-[#252526] flex flex-col items-center py-2 space-y-4 text-gray-400">
                    <FiFile className="hover:text-white cursor-pointer" />
                    <FiSearch className="hover:text-white cursor-pointer" />
                    <FiGitBranch className="hover:text-white cursor-pointer" />
                    <FiPlay className="hover:text-white cursor-pointer" />
                    <FiBox className="hover:text-white cursor-pointer" />
                    <FiTerminal
                        className="hover:text-white cursor-pointer mt-auto mb-2"
                        onClick={() => setShowTerminal((prev) => !prev)}
                    />
                </div>

                {/* Sidebar (Explorer) */}
                <div className="w-48 bg-[#252526] border-r border-gray-700 p-2">
                    <div className="text-xs text-gray-400 mb-2">EXPLORER</div>
                    {files.map((file) => (
                        <div
                            key={file}
                            className={`p-1 rounded cursor-pointer ${file === activeFile ? "bg-[#37373d] text-white" : "hover:bg-[#2a2d2e]"
                                }`}
                            onClick={() => setActiveFile(file)}
                        >
                            {file}
                        </div>
                    ))}
                </div>

                {/* Editor + Terminal Split */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    {/* Monaco Editor */}
                    <div className={`flex-1 ${showTerminal ? "border-b border-gray-700" : ""}`}>
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={activeFile.endsWith(".js") ? "javascript" : "css"}
                            value={code}
                            onChange={(val) => setCode(val || "")}
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>

                    {/* Terminal Panel */}
                    {showTerminal && (
                        <div className="h-48 bg-black text-green-400 text-sm font-mono flex flex-col">
                            <div className="flex-1 overflow-y-auto p-2">
                                {terminalOutput.map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                            <input
                                type="text"
                                className="bg-black text-green-400 outline-none p-2 border-t border-gray-700"
                                placeholder="> Type a command"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                        const command = e.currentTarget.value;
                                        SocketServices.emit("terminal-command", { roomId, command });
                                        setTerminalOutput((prev) => [...prev, `> ${command}`]);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
