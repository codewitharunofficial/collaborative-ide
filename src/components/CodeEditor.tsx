"use client";
import dynamic from "next/dynamic";
import { langs } from "@/utilities/languages"; // make sure IDs match Monaco supported langs
import { useState } from "react";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Track selected language
  const [selectedLang, setSelectedLang] = useState(langs[0].id);

  // Maintain separate buffers per language
  const [buffers, setBuffers] = useState<Record<string, string>>({
    [langs[0].id]: value,
  });

  // Handle switching language
  const handleLangChange = (langId: string) => {
    // Save current buffer
    setBuffers((prev) => ({ ...prev, [selectedLang]: value }));
    setSelectedLang(langId);

    // Load new buffer into parent (so collaborative sync works)
    onChange(buffers[langId] ?? "");
  };

  return (
    <div className="block h-screen w-full relative">
      <Monaco
        height="100vh"
        language={selectedLang}
        theme="vs-dark"
        value={value}
        onChange={(v) => {
          onChange(v ?? "");
          setBuffers((prev) => ({ ...prev, [selectedLang]: v ?? "" }));
        }}
        options={{
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
