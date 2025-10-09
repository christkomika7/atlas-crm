"use client";

import { useRef, useState } from "react";
import { cn, cutText, downloadFile } from "@/lib/utils"; // tronque le nom du fichier
import { DownloadIcon, UploadIcon, XIcon } from "lucide-react"; // ou tes propres icônes
import { UserType } from "@/types/user.types";
import { editOther, editPassport } from "@/action/user.action";

type Props = {
  initialUser: UserType;
};

export default function EmployeeDocuments({ initialUser }: Props) {
  const [user, setUser] = useState<UserType>(initialUser);
  const [loadingType, setLoadingType] = useState<"passport" | "other" | null>(
    null
  );

  const passportInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async (
    file: File | undefined,
    type: "passport" | "other"
  ) => {
    setLoadingType(type);
    try {
      const res =
        type === "passport"
          ? await editPassport({ id: user.id, image: file })
          : await editOther({ id: user.id, image: file });
      setUser(res.data as UserType);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour de ${type}`, err);
    } finally {
      setLoadingType(null);
    }
  };

  const renderDocSection = ({
    id,
    type,
    label,
    defaultDoc,
    isLoading,
    inputRef,
    className,
  }: {
    id: string;
    type: "passport" | "other";
    label: string;
    defaultDoc?: string;
    isLoading: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    className?: string;
  }) => {
    const displayName = defaultDoc?.split("/").pop() || "";

    return (
      <div className={cn("flex justify-between items-center gap-1", className)}>
        <span className="font-medium text-sm">{label}</span>
        <div className="flex items-center gap-x-3 text-neutral-700">
          {!defaultDoc && !isLoading && (
            <label
              htmlFor={id}
              className="flex items-center gap-1 cursor-pointer"
            >
              <UploadIcon className="size-4" />
              <span className="text-sm">Choisir un document</span>
              <input
                ref={inputRef}
                type="file"
                id={id}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleUpdate(e.target.files?.[0], type)}
                disabled={isLoading}
              />
            </label>
          )}

          {isLoading && <p className="text-blue-600 text-sm">Chargement...</p>}

          {defaultDoc && !isLoading && (
            <div className="flex items-center gap-x-2">
              <p className="text-sm">
                {cutText(displayName.split("----")[0], 30)}
              </p>
              <button
                type="button"
                onClick={() => downloadFile(defaultDoc)}
                className="text-blue-600 cursor-pointer"
              >
                <DownloadIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleUpdate(undefined, type)}
                className="text-red-500 cursor-pointer"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderDocSection({
        id: "passport-upload",
        type: "passport",
        label: "Passeport",
        defaultDoc: user.profile?.passport as string,
        isLoading: loadingType === "passport",
        inputRef: passportInputRef,
        className: "py-3 border-b border-neutral-100",
      })}

      {renderDocSection({
        id: "reglement-upload",
        type: "other",
        label: "Règlement intérieur",
        defaultDoc: user.profile?.internalRegulations as string,
        isLoading: loadingType === "other",
        inputRef: otherInputRef,
        className: "pb-3",
      })}
    </div>
  );
}
