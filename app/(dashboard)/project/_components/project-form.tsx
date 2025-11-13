import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { useDataStore } from "@/stores/data.store";
import { create as CreateProject } from "@/action/project.action";
import { DatePicker } from "@/components/ui/date-picker";
import { all } from "@/action/client.action";
import { ClientType } from "@/types/client.types";
import { useEffect, useState } from "react";
import { projectSchema, ProjectSchemaType } from "@/lib/zod/project.schema";
import { getCollaborators } from "@/action/user.action";
import { UserType } from "@/types/user.types";
import { ProjectType } from "@/types/project.types";
import { MultipleSelect } from "@/components/ui/multi-select";

type ProjectFormProps = {
  closeModal: () => void;
  refreshData: () => void;
};

export default function ProjectForm({
  closeModal,
  refreshData,
}: ProjectFormProps) {
  const companyId = useDataStore.use.currentCompany();

  const [collaborators, setCollaborators] = useState<UserType[]>([]);
  const [clients, setClients] = useState<ClientType[]>([]);

  const form = useForm<ProjectSchemaType>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      deadline: new Date(),
      projectInfo: "",
      uploadDocuments: [],
      collaborators: [],
    },
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
    mutate: mutateCollaborators,
    isPending: isLoadingCollaborators,
  } = useQueryAction<{ id: string }, RequestResponse<UserType[]>>(
    getCollaborators,
    () => { },
    "collaborators"
  );

  const { mutate: mutateCreateProject, isPending: isCreatingProject } = useQueryAction<
    ProjectSchemaType,
    RequestResponse<ProjectType>
  >(CreateProject, () => { }, "projects");


  useEffect(() => {
    if (companyId) {
      mutateClient({ id: companyId }, {
        onSuccess(data) {
          if (data.data) {
            setClients(data.data)
          }
        },
      });

      mutateCollaborators({ id: companyId }, {
        onSuccess(data) {
          if (data.data) {
            setCollaborators(data.data)
          }
        },
      });
    }

  }, [companyId]);



  useEffect(() => {
    if (companyId) {
      form.reset({
        company: companyId
      });
    }
  }, [companyId]);

  async function submit(projectData: ProjectSchemaType) {
    const { success, data } = projectSchema.safeParse(projectData);
    if (!success) return;
    if (companyId) {
      mutateCreateProject(
        { ...data },
        {
          onSuccess() {
            form.reset();
            refreshData();
            closeModal()

          },
        }
      );
    }
  }


  return (
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
            name="collaborators"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <MultipleSelect
                    label={
                      <span>
                        Collaborateurs<span className="text-red-500">*</span>
                      </span>
                    }
                    isLoading={isLoadingCollaborators}
                    options={
                      collaborators.map((user) => ({
                        label: user.name,
                        value: user.id,
                      })) ?? []
                    }
                    placeholder="Ajouter des collaborateurs"
                    onChange={(options) =>
                      field.onChange(
                        options.map((opt: { value: string }) => opt.value)
                      )
                    }
                  />
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
            disabled={isCreatingProject}
          >
            {isCreatingProject ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
