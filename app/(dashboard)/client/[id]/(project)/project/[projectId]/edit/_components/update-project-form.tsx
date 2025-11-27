"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { useDataStore } from "@/stores/data.store";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useRef, useState } from "react";
import {
  editProjectSchema,
  EditProjectSchemaType,
} from "@/lib/zod/project.schema";
import { ProjectType } from "@/types/project.types";
import { unique, update } from "@/action/project.action";
import { useParams } from "next/navigation";
import { ProfileType } from "@/types/user.types";
import { getCollaborators } from "@/action/user.action";
import { MultipleSelect, Option } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DownloadIcon, XIcon } from "lucide-react";
import { downloadFile } from "@/lib/utils";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function UpdateProjectForm() {
  const id = useDataStore.use.currentCompany();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const param = useParams();
  const [lastUploadDocuments, setLastUploadDocuments] = useState<string[]>([]);

  const modifyAccess = useAccess("PROJECTS", "MODIFY");

  const form = useForm<EditProjectSchemaType>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      projectName: "",
      projectInfo: "",
      uploadDocuments: [],
      collaborators: [],
    },
  });

  const {
    mutate: mutateProject,
    isPending: isLoadingProject,
    data: projectData,
  } = useQueryAction<{ id: string }, RequestResponse<ProjectType>>(
    unique,
    () => { },
    "project"
  );

  const {
    mutate: mutateCollaborators,
    isPending: isLoadingCollaborators,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<ProfileType[]>>(
    getCollaborators,
    () => { },
    "collaborators"
  );

  const { mutate, isPending } = useQueryAction<
    EditProjectSchemaType,
    RequestResponse<ProjectType[]>
  >(update, () => { }, "projects");

  useEffect(() => {
    if (id && modifyAccess) {
      mutateCollaborators({ id });
    }
  }, [id, modifyAccess]);

  useEffect(() => {
    if (param.projectId && modifyAccess) {
      mutateProject({ id: param.projectId as string });
    }
  }, [param.projectId, modifyAccess]);

  useEffect(() => {
    if (projectData?.data && modifyAccess) {
      const project = projectData.data;
      setLastUploadDocuments(project.files.filter((doc) => Boolean(doc)));
      const initForm: EditProjectSchemaType = {
        id: project.id,
        company: project.company.id,
        client: project.client.id,
        projectName: project.name,
        projectInfo: project.projectInformation,
        deadline: new Date(project.deadline),
        collaborators: project.collaborators.map(
          (collaborator) => collaborator.id
        ),
        lastUploadDocuments: project.files,
      };

      form.reset(initForm);
    }
  }, [form, projectData, modifyAccess]);

  function removeLastUploadDocuments(name: string) {
    setLastUploadDocuments((prev) => prev.filter((d) => d !== name));
  }

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.files = null;
      fileInputRef.current.value = "";
    }
  };

  async function submit(projectData: EditProjectSchemaType) {
    const { success, data } = editProjectSchema.safeParse(projectData);
    if (!success) return;
    if (id) {
      mutate(
        { ...data, lastUploadDocuments },
        {
          onSuccess() {
            form.reset();
            handleReset();
            if (param.projectId) {
              mutateProject({ id: param.projectId as string });
            }
          },
        }
      );
    }
  }

  return (
    <AccessContainer hasAccess={modifyAccess} resource="PROJECTS">
      <>
        {isLoadingProject && (
          <Badge variant="secondary" className="text-sm">
            Chargement des données <Spinner size={12} />
          </Badge>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
            <div className="space-y-4.5 max-w-full">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        type="text"
                        design="float"
                        label="Nom du projet"
                        value={field.value}
                        handleChange={field.onChange}
                        disabled={isLoadingProject}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <DatePicker
                        label="Date limite"
                        mode="single"
                        value={field.value}
                        disabled={isLoadingProject}
                        onChange={(e) => field.onChange(e as Date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectInfo"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        required={false}
                        label="Informations du projet"
                        value={field.value}
                        disabled={isLoadingProject}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uploadDocuments"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        type="file"
                        multiple={true}
                        design="float"
                        inputRef={fileInputRef}
                        label="Documents"
                        required={false}
                        value={field.value}
                        handleChange={field.onChange}
                        disabled={isLoadingProject}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="collaborators"
                render={({ field }) => {
                  const allOptions: Option[] =
                    data?.data?.map((user) => ({
                      label: `${user.firstname} ${user.lastname}`,
                      value: user.id,
                    })) ?? [];

                  const selectedOptions = allOptions.filter((opt) =>
                    field.value?.includes(opt.value)
                  );

                  return (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <MultipleSelect
                          label={
                            <span>
                              Collaborateurs{" "}
                              <span className="text-red-500">*</span>
                            </span>
                          }
                          isLoading={isLoadingCollaborators}
                          options={allOptions}
                          value={selectedOptions}
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          placeholder="Ajouter des collaborateurs"
                          disabled={isLoadingProject}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="lastUploadDocuments"
                render={() => (
                  <FormItem className="-space-y-0.5">
                    <FormLabel>Liste des fichiers enregistrés</FormLabel>
                    <FormControl>
                      <ScrollArea className="bg-gray p-4 border rounded-md h-[100px]">
                        <ul className="space-y-1 w-full text-sm">
                          {lastUploadDocuments.length > 0 ? (
                            lastUploadDocuments.map((document, index) => {
                              return (
                                <li
                                  key={index}
                                  className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
                                >
                                  {index + 1}. {document.split("/").pop()}{" "}
                                  <span className="flex items-center gap-x-2">
                                    <span
                                      onClick={() => downloadFile(document)}
                                      className="text-blue cursor-pointer"
                                    >
                                      <DownloadIcon className="w-4 h-4" />
                                    </span>{" "}
                                    <span
                                      onClick={() =>
                                        removeLastUploadDocuments(document)
                                      }
                                      className="text-red cursor-pointer"
                                    >
                                      <XIcon className="w-4 h-4" />
                                    </span>{" "}
                                  </span>
                                </li>
                              );
                            })
                          ) : (
                            <li className="text-sm">Aucun document trouvé.</li>
                          )}
                        </ul>
                      </ScrollArea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                variant="primary"
                className="justify-center max-w-xs"
                disabled={isLoadingProject}
              >
                {isPending ? <Spinner /> : "Valider"}
              </Button>
            </div>
          </form>
        </Form>
      </>
    </AccessContainer>
  );
}
