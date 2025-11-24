"use client";

import { cn } from "@/lib/utils";
import { ImageIcon, XCircleIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";

const ImagePreview = ({
  url,
  onRemove,
}: {
  url: string;
  onRemove: () => void;
}) => (
  <div className="relative rounded-full aspect-square">
    <button
      className="top-1 right-4 absolute cursor-pointer"
      onClick={onRemove}
    >
      <XCircleIcon className="fill-primary w-5 h-5 text-primary-foreground" />
    </button>
    <Image
      src={url}
      height={500}
      width={500}
      alt=""
      className="border border-border rounded-full w-full h-full object-cover"
    />
  </div>
);

type ProfileInputProps = {
  label?: React.ReactNode;
  onChange: (file: File | null | undefined) => void;
  rounded?: boolean;
  initialImage?: string | null;
  resetKey?: string | number;
};

export default function ProfileInput({
  label,
  onChange,
  rounded = true,
  initialImage,
  resetKey,
}: ProfileInputProps) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Appliquer initialImage seulement si aucune image n'est sélectionnée
  useEffect(() => {
    if (!profilePicture && initialImage) {
      setProfilePicture(initialImage);
    }
  }, [initialImage]);

  // Réinitialiser si resetKey change (ex: reset formulaire)
  useEffect(() => {
    if (resetKey !== undefined) {
      if (profilePicture?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePicture);
      }
      setProfilePicture(null);
      onChange(null);
    }
  }, [resetKey]);

  // Nettoyage mémoire à la destruction
  useEffect(() => {
    return () => {
      if (profilePicture?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePicture);
      }
    };
  }, [profilePicture]);

  const handleRemove = () => {
    if (profilePicture?.startsWith("blob:")) {
      URL.revokeObjectURL(profilePicture);
    }
    setProfilePicture(null);
    onChange(null);
  };

  return (
    <div className="relative w-full max-w-40">
      {label && <>{label}</>}
      <div className="mt-1 w-full">
        {profilePicture ? (
          <ImagePreview url={profilePicture} onRemove={handleRemove} />
        ) : (
          <Dropzone
            onDrop={(acceptedFiles) => {
              const file = acceptedFiles[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setProfilePicture(imageUrl);
                onChange(file);
              }
            }}
            accept={{
              "image/png": [".png", ".jpg", ".jpeg", ".webp"],
            }}
            maxFiles={1}
          >
            {({
              getRootProps,
              getInputProps,
              isDragActive,
              isDragAccept,
              isDragReject,
            }) => (
              <div
                {...getRootProps()}
                className={cn(
                  "bg-gray flex cursor-pointer items-center justify-center aspect-square  focus:outline-none focus:border-primary",
                  {
                    "border-primary bg-secondary": isDragActive && isDragAccept,
                    "border-destructive bg-destructive/20":
                      isDragActive && isDragReject,
                    "rounded-full": rounded,
                    "rounded-md": !rounded,
                  }
                )}
              >
                <input {...getInputProps()} id="profile" />
                <ImageIcon
                  className="w-11 h-11 text-neutral-500"
                  strokeWidth={1}
                />
              </div>
            )}
          </Dropzone>
        )}
      </div>
    </div>
  );
}
