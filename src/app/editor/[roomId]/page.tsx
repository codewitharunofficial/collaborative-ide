"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SocketService from "@/utilities/SocketServices";
import CodeEditor from "@/components/CodeEditor";

export default function EditorPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const roomId = params.roomId as string;
    const isCreator = searchParams.get("create") === "true";

    const [code, setCode] = useState("// Welcome to room " + roomId);

    useEffect(() => {
        if (isCreator) {
            SocketService.emit("create-room", { roomId }, (res) => {
                if (!res.success) alert(res.error || "Failed to create room.");
            });
        } else {
            SocketService.emit("join-room", { roomId }, (res) => {
                if (!res.success) alert(res.error || "Failed to join room.");
            });
        }

        SocketService.on("room-created", (id) => {
            console.log(`🎉 Room created: ${id}`);
        });

        SocketService.on("room-joined", (id) => {
            console.log(`✅ User joined: ${id}`);
        });

        SocketService.on("code-update", (newCode) => {
            setCode(newCode);
        });

        return () => {
            SocketService.emit("leave-room", { roomId });
            SocketService.off("room-created");
            SocketService.off("room-joined");
            SocketService.off("code-update");
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
