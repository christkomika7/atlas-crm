"use client";

import { cutText } from "@/lib/utils";
import { UploadIcon, XIcon, DownloadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UploadDocumentProps {
  defaultDoc?: string;
  previewUrl?: string;
  handleChange?: (file: File | null) => void;
  handleDelete: () => void;
  handleDownload: (url: string) => void;
  handleUpload: (file: File) => void;
  id?: string;
  isLoading: boolean;
}

export default function UploadDocument({
  defaultDoc,
  previewUrl,
  handleChange,
  handleDelete,
  handleDownload,
  handleUpload,
  id = "doc",
  isLoading
}: UploadDocumentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentDoc, setCurrentDoc] = useState(defaultDoc);

  useEffect(() => {
    setCurrentDoc(defaultDoc);
  }, [defaultDoc]);

  const remove = () => {
    handleDelete();
    handleChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      handleChange?.(file);
      handleUpload(file);
      toast.success("Fichier chargé avec succès.");
    } catch (error) {
      toast.error("Erreur lors du chargement du fichier.");
    } finally {
      toast.dismiss();
    }
  };

  const displayName = currentDoc || "Aucun document";
  const canDownload = previewUrl || currentDoc;
  const downloadUrl =
    previewUrl ||
    (currentDoc
      ? `/api/upload?path=${encodeURIComponent(currentDoc)}`
      : undefined);

  return (
    <div className="flex items-center gap-x-3 text-neutral-700">
      {!currentDoc && !isLoading && (
        <label htmlFor={id} className="flex items-center gap-1 cursor-pointer">
          <UploadIcon className="size-4" />
          <span className="text-sm">Choisir un document</span>
          <input
            ref={inputRef}
            type="file"
            id={id}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={onFileChange}
            disabled={isLoading}
          />
        </label>
      )}

      {isLoading && <p className="text-blue-600 text-sm">Chargement...</p>}

      {currentDoc && !isLoading && (
        <div className="flex items-center gap-x-2">
          <p className="text-sm">{cutText(displayName, 30)}</p>
          {canDownload && downloadUrl && (
            <button
              type="button"
              onClick={() => handleDownload(downloadUrl)}
              className="text-blue-600 cursor-pointer"
            >
              <DownloadIcon className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={remove}
            className="text-red-500 cursor-pointer"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
