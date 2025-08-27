"use client";
import dynamic from "next/dynamic";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({
  value,
  onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <Monaco
      height="100vh"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{ automaticLayout: true }}
    />
  );
}
