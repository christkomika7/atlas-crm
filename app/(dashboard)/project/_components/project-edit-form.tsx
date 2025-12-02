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
import { Combobox } from "@/components/ui/combobox";
import { unique, update } from "@/action/project.action";
import { DatePicker } from "@/components/ui/date-picker";
import { all } from "@/action/client.action";
import { ClientType } from "@/types/client.types";
import { useEffect, useRef, useState } from "react";
import { downloadFile } from "@/lib/utils";
import { DownloadIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ProfileType } from "@/types/user.types";
import { useDataStore } from "@/stores/data.store";
import { editProjectSchema, EditProjectSchemaType } from "@/lib/zod/project.schema";
import { ProjectType } from "@/types/project.types";
import { getCollaborators } from "@/action/user.action";
import { MultipleSelect, Option } from "@/components/ui/multi-select";

type ProjectEditFormProps = {
  closeModal: () => void;
  refreshData: () => void;
  id: string;
};

export default function ProjectEditForm({
  closeModal,
  refreshData,
  id,
}: ProjectEditFormProps) {
  const companyId = useDataStore.use.currentCompany();

  const [lastUploadDocuments, setLastUploadDocuments] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<ProfileType[]>([]);
  const [clients, setClients] = useState<ClientType[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditProjectSchemaType>({
    resolver: zodResolver(editProjectSchema)
  });

  const {
    mutate: mutateClient,
    isPending: isLoadingClient,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType[]>>(
    all,
    () => { },
    "clients"
  );


  const {
    mutate: mutateGetProject,
    isPending: isGettingProject,
  } = useQueryAction<{ id: string }, RequestResponse<ProjectType>>(
    unique,
    () => { },
    "project"
  );

  const {
    mutate: mutateCollaborators,
    isPending: isLoadingCollaborators,
  } = useQueryAction<{ id: string, includeMe?: boolean }, RequestResponse<ProfileType[]>>(
    getCollaborators,
    () => { },
    "collaborators"
  );

  const { mutate: mutateUpdateProject, isPending: isUpdatingProject } = useQueryAction<
    EditProjectSchemaType,
    RequestResponse<ProjectType[]>
  >(update, () => { }, "projects");

  useEffect(() => {
    if (companyId) {
      mutateClient({ id: companyId }, {
        onSuccess(data) {
          if (data.data) {
            setClients(data.data)
          }
        },
      });

      mutateCollaborators({ id: companyId, includeMe: true }, {
        onSuccess(data) {
          if (data.data) {
            setCollaborators(data.data)
          }
        },
      });
    }

  }, [companyId]);

  useEffect(() => {
    if (id) {
      mutateGetProject({ id }, {
        onSuccess(data) {
          if (data.data) {
            const project = data.data;
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

        },
      });
    }
  }, [id]);

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
      mutateUpdateProject(
        { ...data, lastUploadDocuments },
        {
          onSuccess() {
            form.reset();
            handleReset();
            refreshData()
            closeModal()
          },
        }
      );
    }
  }

  return (
    <>
      {isGettingProject && (
        <Badge variant="secondary" className="text-sm">
          Chargement des données <Spinner size={12} />
        </Badge>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
          <div className="space-y-4.5 max-w-full">
            <div className="grid grid-cols-2 gap-x-4.5">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        isLoading={isLoadingClient}
                        datas={
                          clients.map((client) => ({
                            id: client.id,
                            label: `${client.firstname} ${client.lastname}`,
                            value: client.id,
                          })) ?? []
                        }
                        value={field.value}
                        setValue={e => {
                          field.onChange(e)
                        }}
                        placeholder="Sélectionner un client"
                        searchMessage="Rechercher un client"
                        noResultsMessage="Aucun client trouvé."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <DatePicker
                      label="Date limite"
                      value={field.value}
                      mode="single"
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
            <FormField
              control={form.control}
              name="collaborators"
              render={({ field }) => {
                const allOptions: Option[] =
                  collaborators.map((user) => ({
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              variant="primary"
              className="justify-center max-w-xs"
              disabled={isUpdatingProject}
            >
              {isUpdatingProject ? <Spinner /> : "Valider"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
