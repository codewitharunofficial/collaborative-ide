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
    const [language, setLanguage] = useState("typescript");

    // File explorer state
    const [files, setFiles] = useState([]); // dynamic from server
    const [activeFile, setActiveFile] = useState(null);

    // join room & listen for updates
    useEffect(() => {
        if (!roomId) return;

        SocketServices.emit("join-room", { roomId });

        SocketServices.on("code-update", (newCode) => setCode(newCode));
        SocketServices.on("language-update", (newLang) => setLanguage(newLang));

        SocketServices.on("terminal-output", ({ command, output }) => {
            setTerminalOutput((prev) => [...prev, { command, output }]);
        });

        // listen for repo files
        SocketServices.on("repo-cloned", ({ success, files }) => {
            if (success) setFiles(files);
        });

        // listen for opened file
        SocketServices.on("file-opened", ({ filePath, content }) => {
            setActiveFile(filePath);
            setCode(content);
        });

        return () => {
            SocketServices.emit("leave-room", { roomId });
            SocketServices.socket.off("code-update");
            SocketServices.socket.off("language-update");
            SocketServices.socket.off("terminal-output");
            SocketServices.socket.off("repo-cloned");
            SocketServices.socket.off("file-opened");
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

    // Run JS code directly
    const handleRunCode = () => {
        if (language !== "javascript") {
            setTerminalOutput((prev) => [
                ...prev,
                { command: "Run", output: "⚠️ Only JavaScript execution is supported right now." },
            ]);
            return;
        }
        SocketServices.emit("run-js", { roomId, code });
        setTerminalOutput((prev) => [
            ...prev,
            { command: "node script.js", output: "Running your code..." },
        ]);
    };

    // Clone repo
    const handleCloneRepo = () => {
        const url = prompt("Enter GitHub repo URL:");
        if (url) {
            SocketServices.emit("clone-repo", { roomId, repoUrl: url });
            setTerminalOutput((prev) => [
                ...prev,
                { command: "git clone", output: `Cloning ${url}...` },
            ]);
        }
    };

    // Open file
    const handleOpenFile = (filePath) => {
        SocketServices.emit("open-file", { roomId, filePath });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-1 bg-[#222] border-b border-gray-700">
                <span className="font-semibold text-md">CodeIDE</span>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCloneRepo}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-sm rounded cursor-pointer"
                    >
                        Clone Repo
                    </button>
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-[#111] text-white text-sm px-2 py-1 rounded cursor-pointer"
                    >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                    <button
                        onClick={handleRunCode}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm rounded cursor-pointer"
                    >
                        Run Code
                    </button>
                    <span className="text-sm text-gray-400">Room: {roomId}</span>
                </div>
            </div>

            {/* Main layout */}
            <div className="flex flex-1">
                {/* Sidebar (File Explorer) */}
                <div className="w-56 bg-[#252526] border-r border-gray-700 flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-600">
                        <span className="font-medium text-sm">Explorer</span>
                        <div className="flex gap-2 text-gray-300">
                            <button onClick={handleCloneRepo} className="hover:text-white">🔗</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto text-sm">
                        {files.length === 0 ? (
                            <div className="px-3 py-2 text-gray-500">No files yet</div>
                        ) : (
                            files.map((f, i) => (
                                <div
                                    key={i}
                                    onClick={() => f.type === "file" && handleOpenFile(f.path)}
                                    className={`px-3 py-1 cursor-pointer hover:bg-[#333] ${activeFile === f.path ? "bg-[#444]" : ""}`}
                                >
                                    {f.type === "file" ? "📄 " : "📁 "}
                                    {f.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Editor + Terminal */}
                <div className="flex flex-1 flex-col lg:flex-row">
                    <CodeEditor value={code} onChange={handleEditorChange} language={language} />

                    {/* Terminal */}
                    <div className="w-full lg:w-1/3 bg-black text-green-400 flex flex-col">
                        <div className="flex-1 overflow-y-auto font-mono text-sm p-3 space-y-1">
                            {terminalOutput.map((msg, i) => (
                                <div key={i}>
                                    {msg.command && <div className="text-green-300">➜ {msg.command}</div>}
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
        </div>
    );
}
