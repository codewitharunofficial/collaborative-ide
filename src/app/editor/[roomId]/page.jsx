"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SocketServices from "@/utilities/SocketServices";
import CodeEditor from "@/components/CodeEditor";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import File from "@/components/File";
import Folder from "@/components/Folder";

export default function EditorPageClient() {
    const params = useParams();
    const roomId = params?.roomId;

    const [code, setCode] = useState("// Start coding...");
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [language, setLanguage] = useState("typescript");

    // File explorer state
    const [projects, setProjects] = useState([]); // all projects from DB
    const [files, setFiles] = useState([]); // files of current project
    const [activeFile, setActiveFile] = useState(null);
    const [activeFolder, setActiveFolder] = useState(null);
    const [activeProject, setActiveProject] = useState(null);

    // current user email from localStorage (saved during auth)
    const userEmail =
        typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.email : null;

    useEffect(() => {
        if (!roomId) return;

        SocketServices.emit("join-room", { roomId });

        // code & lang sync
        SocketServices.on("code-update", (newCode) => setCode(newCode));
        SocketServices.on("language-update", (newLang) => setLanguage(newLang));

        // terminal outputs
        SocketServices.on("terminal-output", ({ command, output }) => {
            setTerminalOutput((prev) => [...prev, { command, output }]);
        });

        // project loaded (after clone or from DB)
        SocketServices.on("project-loaded", ({ project, files }) => {
            setActiveProject(project);
            setFiles(files);
            setTerminalOutput((prev) => [
                ...prev,
                { command: "project-loaded", output: `✅ Loaded ${project.name}` },
            ]);
        });

        // full project list
        SocketServices.on("projects-list", (projects) => {
            setProjects(projects);
            if (projects.length > 0 && !activeProject) {
                // auto-load the first project
                const first = projects[0];
                setActiveProject(first);
                setFiles(first.files || []);
            }
        });

        // opened file
        SocketServices.on("file-opened", ({ filePath, content }) => {
            setActiveFile(filePath);
            setCode(content);
        });

        // fetch projects from DB for this user
        if (userEmail) {
            SocketServices.emit("get-projects", { email: userEmail });
        }

        return () => {
            SocketServices.emit("leave-room", { roomId });
            SocketServices.socket.off("code-update");
            SocketServices.socket.off("language-update");
            SocketServices.socket.off("terminal-output");
            SocketServices.socket.off("project-loaded");
            SocketServices.socket.off("projects-list");
            SocketServices.socket.off("file-opened");
        };
    }, [roomId, userEmail, activeProject]);

    // handle code change
    const handleEditorChange = (value) => {
        setCode(value || "");
        SocketServices.emit("code-change", { roomId, code: value });
    };

    // language change
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        SocketServices.emit("language-change", { roomId, language: newLang });
    };

    // terminal commands
    const handleCommand = (e) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
            const command = e.currentTarget.value;
            SocketServices.emit("terminal-command", { roomId, command });
            e.currentTarget.value = "";
        }
    };

    function setCurrentFileLanguage(filename) {
        switch (true) {
            case filename.endsWith(".js"):
                return "javascript";
            case filename.endsWith(".ts") || filename.endsWith(".tsx"):
                return "typescript";
            case filename.endsWith(".css"):
                return "css";
            case filename.endsWith(".html"):
                return "html";
            case filename.endsWith(".json"):
                return "json";
            case filename.endsWith(".md"):
                return "markdown";
            case filename.endsWith(".py"):
                return "python";
            case filename.endsWith(".tsx"):
                return "typescript";
            case filename.endsWith(".jsx"):
                return "javascript";
            default:
                return "plaintext";
        }
    }

    // run js code
    const handleRunCode = () => {
        if (language !== "javascript") {
            setTerminalOutput((prev) => [
                ...prev,
                {
                    command: "Run",
                    output: "⚠️ Only JavaScript execution is supported right now.",
                },
            ]);
            return;
        }
        SocketServices.emit("run-js", { roomId, code });
        setTerminalOutput((prev) => [
            ...prev,
            { command: "node script.js", output: "Running your code..." },
        ]);
    };

    // clone repo
    const handleCloneRepo = () => {
        const url = prompt("Enter GitHub repo URL:");
        if (url && userEmail) {
            SocketServices.emit("clone-repo", { roomId, repoUrl: url, email: userEmail });
            setTerminalOutput((prev) => [
                ...prev,
                { command: "git clone", output: `Cloning ${url}...` },
            ]);
        } else {
            alert("❌ You must be logged in before cloning a repo.");
        }
    };

    // open file
    const handleOpenFile = (f) => {
        if (f.type === "file") {
            setActiveFile(f);
            setCode(f.content || "");
            setLanguage(setCurrentFileLanguage(f.name || ""));
            return;
        } else {
            console.log(f);
            setActiveFolder(f);
            setActiveFile(null);
            return;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-1 bg-[#222] border-b border-gray-700">
                <span className="font-semibold text-md">{activeFile?.path || activeFolder?.path || "Untitled"}</span>
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
                        placeholder="Select Language"
                    >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="json">JSON</option>
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
                {/* Sidebar (Projects + File Explorer) */}
                <div className="w-56 bg-[#252526] border-r border-gray-700 flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-600">
                        <span className="font-medium text-sm">Explorer</span>
                        <div className="flex gap-2 text-gray-300">
                            <button onClick={handleCloneRepo} className="hover:text-white">
                                🔗
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto text-sm">
                        {projects.length === 0 ? (
                            <div className="px-3 py-2 text-gray-500">No projects yet</div>
                        ) : (
                            projects.map((proj) => (
                                <div key={proj._id}>
                                    <div
                                        className={`px-3 py-2 font-semibold cursor-pointer ${activeProject?._id === proj._id ? "bg-[#333]" : "hover:bg-[#2d2d2d]"
                                            }`}
                                        onClick={() => {
                                            setActiveProject(proj);
                                            setFiles(proj.files || []);
                                        }}
                                    >
                                        📂 {proj.name}
                                    </div>
                                    {activeProject?._id === proj._id && (
                                        <div className="ml-4">
                                            {files.length === 0 ? (
                                                <div className="px-3 py-1 text-gray-500">No files yet</div>
                                            ) : (
                                                files.map((f, i) => (
                                                    f.type === "file" ? (
                                                        <File key={f.path} f={f} i={i} activeFile={activeFile} handleOpenFile={handleOpenFile} />
                                                    ) : (
                                                        <Folder key={f.path} f={f} i={i} activeFile={activeFile} activeFolder={activeFolder} handleOpenFile={handleOpenFile} />
                                                    )
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Editor + Terminal */}
                <div className="flex flex-1 flex-col lg:flex-row">
                    <CodeEditor value={code} onChange={handleEditorChange} language={setCurrentFileLanguage(activeFile?.name || "")} />

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
        </div>
    );
}
