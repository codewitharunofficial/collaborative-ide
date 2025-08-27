"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SocketService from "@/utilities/SocketServices"; // adjust path
import CodeEditor from "@/components/CodeEditor";

export default function EditorPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const roomId = params.roomId as string;
    const isCreator = searchParams.get("create") === "true";

    const [code, setCode] = useState("// Welcome to room " + roomId);

    useEffect(() => {
        // emit correct event depending on creator/joiner
        if (isCreator) {
            SocketService.emit("create-room", roomId);
        } else {
            SocketService.emit("join-room", roomId);
        }

        // listen for updates
        SocketService.on("code-update", (newCode: string) => {
            setCode(newCode);
        });

        return () => {
            SocketService.emit("leave-room", roomId);
            // don’t disconnect the entire socket here
        };
    }, [roomId, isCreator]);

    const handleChange = (newCode: string) => {
        setCode(newCode);
        SocketService.emit("code-change", { roomId, code: newCode });
    };

    return (
        <div>
            <h2 className="p-2 bg-gray-900 text-white">
                Room: {roomId} {isCreator ? "(Creator)" : "(Joined)"}
            </h2>
            <CodeEditor value={code} onChange={handleChange} />
        </div>
    );
}
