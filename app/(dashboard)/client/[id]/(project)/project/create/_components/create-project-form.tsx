"use client";
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
import { useDataStore } from "@/stores/data.store";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect } from "react";
import { projectSchema, ProjectSchemaType } from "@/lib/zod/project.schema";
import { ProjectType } from "@/types/project.types";
import { create } from "@/action/project.action";
import { useParams, useRouter } from "next/navigation";
import { UserType } from "@/types/user.types";
import { getCollaborators } from "@/action/user.action";
import { MultipleSelect } from "@/components/ui/multi-select";

export default function ProjectForm() {
  const id = useDataStore.use.currentCompany();
  const router = useRouter();
  const param = useParams();

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
    mutate: mutateCollaborators,
    isPending: isLoadingCollaborators,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<UserType[]>>(
    getCollaborators,
    () => {},
    "collaborators"
  );

  const { mutate, isPending } = useQueryAction<
    ProjectSchemaType,
    RequestResponse<ProjectType>
  >(create, () => {}, "projects");

  useEffect(() => {
    if (id) {
      mutateCollaborators({ id });
    }
  }, [id]);

  useEffect(() => {
    if (id && param.id) {
      const initForm = {
        company: id,
        client: param.id as string,
      };

      form.reset(initForm);
    }
  }, [form, id]);

  async function submit(projectData: ProjectSchemaType) {
    const { success, data } = projectSchema.safeParse(projectData);
    if (!success) return;
    if (id) {
      mutate(
        { ...data },
        {
          onSuccess() {
            form.reset();
            router.push(`/client/${param.id}`);
          },
        }
      );
    }
  }

  return (
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
                      data?.data?.map((user) => ({
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
          >
            {isPending ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
