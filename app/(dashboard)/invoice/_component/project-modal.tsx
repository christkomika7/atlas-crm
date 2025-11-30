import { create, remove } from "@/action/project.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import useProjectStore from "@/stores/project.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { PlusCircle, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { projectSchema, ProjectSchemaType } from "@/lib/zod/project.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCollaborators } from "@/action/user.action";
import { ProfileType } from "@/types/user.types";
import { ProjectType } from "@/types/project.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { MultipleSelect } from "@/components/ui/multi-select";
import { DatePicker } from "@/components/ui/date-picker";

type ProjectModalProps = {
  clientId: string;
};

export default function ProjectModal({ clientId }: ProjectModalProps) {
  const companyId = useDataStore.use.currentCompany();
  const projects = useProjectStore.use.projects();
  const addProject = useProjectStore.use.addProject();
  const removeProject = useProjectStore.use.removeProject();
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState("");

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
  } = useQueryAction<{ id: string }, RequestResponse<ProfileType[]>>(
    getCollaborators,
    () => { },
    "collaborators"
  );

  const { mutate, isPending } = useQueryAction<
    ProjectSchemaType,
    RequestResponse<ProjectType>
  >(create, () => { }, "projects");

  const { mutate: mutateRemove, isPending: isPendingRemove } = useQueryAction<
    { id: string },
    RequestResponse<ProjectType>
  >(remove, () => { }, "projects");

  useEffect(() => {
    if (companyId) {
      mutateCollaborators({ id: companyId });
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId && clientId) {
      const initForm = {
        company: companyId,
        client: clientId as string,
      };

      form.reset(initForm);
    }
  }, [form, companyId, clientId]);

  function retrieveProject(
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    id: string
  ) {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return toast.error("Aucun identifiant trouvé.");
    setCurrentId(id);
    mutateRemove(
      { id },
      {
        onSuccess(data) {
          if (data.data) {
            removeProject(data.data.id);
            form.reset();
          }
        },
      }
    );
  }

  async function submit(projectData: ProjectSchemaType) {
    if (!companyId) return toast.error("Aucune entreprise trouvée.");
    if (!clientId) return toast.error("Aucun client sélèctionné.");
    const { success, data } = projectSchema.safeParse(projectData);
    if (!success) return;
    mutate(
      { ...data },
      {
        onSuccess(data) {
          console.log("Hello")
          if (data.data) {
            addProject(data.data);
          }
          form.reset();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          variant="primary"
          className="!h-9 font-medium"
        >
          <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Ajouter un
          Projet
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>Ajouter un projet</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="gap-x-2 grid grid-cols-2">
          <ScrollArea className="h-[200px]">
            <ul>
              {projects.length === 0 ? (
                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                  Aucun projet trouvé.
                </li>
              ) : (
                projects.map((projet) => (
                  <li
                    key={projet.id}
                    className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                  >
                    {projet.name}{" "}
                    <div className="flex items-center gap-x-2">
                      <span
                        onClick={(e) => retrieveProject(e, projet.id)}
                        className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                      >
                        <XIcon className="w-[13px] h-[13px]" />
                      </span>{" "}
                      {currentId === projet.id && isPendingRemove && (
                        <Spinner size={10} />
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(submit)(e);
              }}
              className="space-y-4.5 m-2"
            >
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
                              Collaborateurs
                              <span className="text-red-500">*</span>
                            </span>
                          }
                          isLoading={isLoadingCollaborators}
                          options={
                            data?.data?.map((user) => ({
                              label: `${user.firstname} ${user.lastname}`,
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
                  className="justify-center"
                  disabled={isPending || isPendingRemove}
                >
                  {isPending ? <Spinner /> : "Enregistrer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
