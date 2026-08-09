"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CsvImportForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/import/csv", { method: "POST", body: formData });
    setUploading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Import failed.");
      return;
    }
    setResult({ imported: data.imported, errors: data.errors ?? [] });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
        <Upload size={15} /> {uploading ? "Importing…" : "Import net worth history (CSV)"}
      </Button>
      {error && <p className="text-xs text-red">{error}</p>}
      {result && (
        <div className="text-xs text-navy/60">
          <p className={result.imported > 0 ? "text-[#4F8F63]" : ""}>
            Imported {result.imported} snapshot{result.imported === 1 ? "" : "s"}.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-4">
              {result.errors.slice(0, 5).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {result.errors.length > 5 && <li>…and {result.errors.length - 5} more</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
