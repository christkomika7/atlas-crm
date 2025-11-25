"use client";

import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileType } from "@/types/user.types";
import { useParams } from "next/navigation";
import { RequestResponse } from "@/types/api.types";
import {
  editProfileDocument,
  getUser,
} from "@/action/user.action";
import { useEffect, useState } from "react";

import EmployeeList from "../../../settings/employee/_components/employee-list";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import LogoutButton from "@/components/logout-button";
import { formatNumber, generateAmaId, initialName, resolveImageSrc, urlToFile } from "@/lib/utils";
import UploadDocument from "../../../settings/employee/_components/upload-document";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth-client";

export default function EmployeeInfo() {
  const param = useParams();
  const [profile, setProfile] = useState<ProfileType>();
  const [document, setDocument] = useState("");
  const [passport, setPassport] = useState("");
  const [image, setImage] = useState("");
  const [documentPreview, setDocumentPreview] = useState("");
  const [passportPreview, setPassportPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isLoadingPassport, setIsLoadingPassport] = useState(false);

  const { data } = getSession();
  const isAdmin = data?.user.role === "ADMIN" ? true : false;



  const { mutate: mutateGetUser, isPending } = useQueryAction<
    { id: string },
    RequestResponse<ProfileType>
  >(getUser, () => { }, "user");


  const { mutate: mutateEditDocumentUser } = useQueryAction<
    { profileId: string; document?: File; type: "doc" | "passport", state: "update" | "delete" },
    RequestResponse<ProfileType>
  >(editProfileDocument, () => { }, "document");



  useEffect(() => {
    if (param.id) {
      mutateGetUser({ id: param.id as string }, {
        onSuccess(data) {
          if (data.data) {
            const profile = data.data;
            setProfile(profile);
            setImage(profile.image || "");
            setPassport(profile.passport || "");
            setDocument(profile.internalRegulations || "");
          }
        }
      })
    }

  }, [param])

  useEffect(() => {
    getDocument();
  }, [document])

  useEffect(() => {
    getPassport();
  }, [passport])

  useEffect(() => {
    getImage()
  }, [image])


  async function getDocument() {
    if (document) {
      const file = await urlToFile(document);
      const resolveImage = resolveImageSrc(file);
      if (resolveImage) {
        setDocumentPreview(resolveImage)
      }
    }
  }

  async function getPassport() {
    if (passport) {
      const file = await urlToFile(passport);
      const resolveImage = resolveImageSrc(file);
      if (resolveImage) {
        setPassportPreview(resolveImage)
      }
    }
  }

  async function getImage() {
    if (image) {
      const file = await urlToFile(image);
      const resolveImage = resolveImageSrc(file);
      if (resolveImage) {
        setImagePreview(resolveImage)
      }
    }
  }


  function editDocument(type: "doc" | "passport", state: "update" | "delete", document?: File) {
    if (type === "doc") setIsLoadingDoc(true);
    if (type === "passport") setIsLoadingPassport(true);
    if (param.id) {
      mutateEditDocumentUser({ profileId: param.id as string, document, type, state }, {
        onSuccess(data) {
          const profile = data.data;
          if (profile) {
            if (type === "doc") {
              setDocument(profile.internalRegulations || "");
            } else {
              setPassport(profile.passport || "");
            }
          }
        },
        onSettled() {
          if (type === "doc") setIsLoadingDoc(false);
          if (type === "passport") setIsLoadingPassport(false);
        }
      })
    }
  }

  return (
    <>
      {isPending && <Spinner />}
      <div className="h-full">
        <ScrollArea className="pr-4 h-full">
          <div className="p-3.5 border border-neutral-100 rounded-xl">
            <div className="flex items-center">
              <div className="flex flex-1 justify-end gap-x-2">
                {isAdmin &&
                  <Link href={`/overview/profile/${profile?.id}/edit`}>
                    <Button variant="primary" className="rounded-lg w-fit !h-10">
                      <EditIcon className="size-4" />
                      Modifier
                    </Button>
                  </Link>
                }
                <LogoutButton />
              </div>
            </div>
            {!isPending && !profile ? <p className="p-4 bg-neutral-50 mx-6 rounded-sm text-sm text-neutral-600">Aucune donnée trouvée</p>
              :
              <div className="max-w-xl">

                <EmployeeList value="Commission : 200$">
                  <Avatar className="size-28">
                    <AvatarImage className="bg-gray object-cover" src={imagePreview} />
                    <AvatarFallback>{initialName(`${profile?.firstname} ${profile?.lastname}`)}</AvatarFallback>
                  </Avatar>
                </EmployeeList>
                <EmployeeList value={profile?.firstname || "-"}>Prénom</EmployeeList>
                <EmployeeList value={profile?.lastname || "-"}>Nom</EmployeeList>
                <EmployeeList value={generateAmaId(profile?.key || 0)}>Identifiant</EmployeeList>
                <EmployeeList value={profile?.user.email || "-"}>Adresse mail</EmployeeList>
                <EmployeeList value={profile?.job || "-"}>Emploi</EmployeeList>
                <EmployeeList value={`${profile?.salary ? formatNumber(profile.salary) : "-"} ${profile?.company?.currency || ""}`}>Salaire</EmployeeList>

                <EmployeeList
                  value={
                    <UploadDocument
                      id="document"
                      defaultDoc={document.split("/")[2] || undefined}
                      previewUrl={documentPreview}
                      handleDelete={() => editDocument('doc', 'delete')}
                      handleDownload={(url) => window.open(url, "_blank")}
                      handleUpload={(file) => editDocument("doc", "update", file)}
                      isLoading={isLoadingDoc}
                    />
                  }
                >
                  Règlement intérieur
                </EmployeeList>
                <EmployeeList
                  value={
                    <UploadDocument
                      id="passport"
                      defaultDoc={passport.split("/")[2] || undefined}
                      previewUrl={passportPreview}
                      handleDelete={() => editDocument('passport', 'delete')}
                      handleDownload={(url) => window.open(url, "_blank")}
                      handleUpload={(file) => editDocument("passport", "update", file)}
                      isLoading={isLoadingPassport}

                    />
                  }
                  className="border-none"
                >
                  Passport
                </EmployeeList>
              </div>

            }
          </div>
        </ScrollArea >
      </div >

    </>
  );
}
