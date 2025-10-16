"use client";

import LogoutButton from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit3Icon, EditIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import EmployeeList from "../_components/employee-list";
import ProfileInput from "@/components/ui/profile-input";
import { Label } from "@/components/ui/label";
import UploadDocument from "../_components/upload-document";
import { useEmployeeStore } from "@/stores/employee.store";
import { useParams } from "next/navigation";
import { getFileByType, removeFile, setFile } from "@/lib/file-storage";
import Spinner from "@/components/ui/spinner";
import { UserSchemaType } from "@/lib/zod/user.schema";

export default function NewEmployeeInfo() {
  const param = useParams();
  const [data, setData] = useState<UserSchemaType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [preview, setPreview] = useState<string | undefined>(undefined);

  const [passport, setPassport] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | undefined>();

  const [document, setDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | undefined>();

  const { getEmployeeById } = useEmployeeStore();
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);

  const previewUrlRef = useRef<string | undefined>(undefined);
  const passportPreviewUrlRef = useRef<string | undefined>(undefined);
  const documentPreviewUrlRef = useRef<string | undefined>(undefined);

  const cleanupPreviewUrl = (urlRef: React.RefObject<string | undefined>) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = undefined;
    }
  };

  const createPreviewUrl = (
    file: File,
    urlRef: React.RefObject<string | undefined>
  ) => {
    cleanupPreviewUrl(urlRef);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    return url;
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!param.id) return;

      const employee = getEmployeeById(Number(param.id));
      if (!employee) return;

      setData(employee);

      try {
        const profileFile = await getFileByType(employee.email, "profile");
        if (profileFile) {
          setPreview(createPreviewUrl(profileFile, previewUrlRef));
        }

        const passportFile = await getFileByType(employee.email, "passport");
        if (passportFile) {
          setPassport(passportFile);
          setPassportPreview(
            createPreviewUrl(passportFile, passportPreviewUrlRef)
          );
        }

        const docFile = await getFileByType(employee.email, "doc");
        if (docFile) {
          setDocument(docFile);
          setDocumentPreview(createPreviewUrl(docFile, documentPreviewUrlRef));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();

    return () => {
      cleanupPreviewUrl(previewUrlRef);
      cleanupPreviewUrl(passportPreviewUrlRef);
      cleanupPreviewUrl(documentPreviewUrlRef);
    };
  }, [param.id, getEmployeeById]);

  const handleProfileChange = async (newProfile: File | null) => {
    if (!data?.email) return;

    if (newProfile) {
      await setFile(data.email, { type: "profile", file: newProfile });
      setPreview(createPreviewUrl(newProfile, previewUrlRef));
    } else {
      await removeFile(data.email, "profile");
      cleanupPreviewUrl(previewUrlRef);
      setPreview(undefined);
    }
  };

  const handlePassportUpload = async (file: File) => {
    if (!data?.email) return;
    await setFile(data.email, { type: "passport", file });
    setPassport(file);
    setPassportPreview(createPreviewUrl(file, passportPreviewUrlRef));
  };

  const handlePassportDelete = async () => {
    if (!data?.email) return;
    await removeFile(data.email, "passport");
    cleanupPreviewUrl(passportPreviewUrlRef);
    setPassport(null);
    setPassportPreview(undefined);
  };

  const handleDocumentUpload = async (file: File) => {
    if (!data?.email) return;
    await setFile(data.email, { type: "doc", file });
    setDocument(file);
    setDocumentPreview(createPreviewUrl(file, documentPreviewUrlRef));
  };

  const handleDocumentDelete = async () => {
    if (!data?.email) return;
    await removeFile(data.email, "doc");
    cleanupPreviewUrl(documentPreviewUrlRef);
    setDocument(null);
    setDocumentPreview(undefined);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="h-full">
      <ScrollArea className="pr-4 h-full">
        <div className="p-3.5 border border-neutral-100 rounded-xl">
          <div className="flex items-center">
            <div className="flex flex-1 justify-end gap-x-2">
              <Link href={`/settings/employee/${param.id}/edit`}>
                <Button variant="primary" className="rounded-lg w-fit !h-10">
                  <EditIcon className="size-4" />
                  Modifier
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>

          <div className="max-w-xl">
            <EmployeeList value="Commission : 200$">
              <div className="w-28 h-28">
                <ProfileInput
                  initialImage={preview}
                  onChange={handleProfileChange}
                  label={
                    <Label
                      htmlFor="profile"
                      className="right-2 bottom-2 z-20 absolute flex justify-center items-center cursor-pointer"
                    >
                      <span className="flex justify-center items-center bg-white shadow-slate-400/30 shadow-sm rounded-full size-5.5">
                        <Edit3Icon className="size-3" />
                      </span>
                    </Label>
                  }
                />
              </div>
            </EmployeeList>
            <EmployeeList value={data?.firstname}>Prénom</EmployeeList>
            <EmployeeList value={data?.lastname}>Nom</EmployeeList>
            <EmployeeList value="-">Identifiant</EmployeeList>
            <EmployeeList value={data?.email}>Adresse mail</EmployeeList>
            <EmployeeList value={data?.job}>Emploi</EmployeeList>
            <EmployeeList value={data?.salary}>Salaire</EmployeeList>
            <EmployeeList
              value={
                <UploadDocument
                  id="document"
                  defaultDoc={document?.name || undefined}
                  previewUrl={documentPreview}
                  handleDelete={handleDocumentDelete}
                  handleDownload={(url) => window.open(url, "_blank")}
                  handleUpload={handleDocumentUpload}
                />
              }
            >
              Règlement intérieur
            </EmployeeList>
            <EmployeeList
              value={
                <UploadDocument
                  id="passport"
                  defaultDoc={passport?.name || undefined}
                  previewUrl={passportPreview}
                  handleDelete={() => handlePassportDelete()}
                  handleDownload={(url) => window.open(url, "_blank")}
                  handleUpload={(file) => handlePassportUpload(file)}
                />
              }
              className="border-none"
            >
              Passport
            </EmployeeList>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
