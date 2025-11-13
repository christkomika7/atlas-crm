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
import { DatePicker } from "@/components/ui/date-picker";
import { Dispatch, SetStateAction, useEffect } from "react";
import { taskSchema, TaskSchemaType } from "@/lib/zod/task.schema";
import { priority, status } from "@/lib/data";
import { MultipleSelect } from "@/components/ui/multi-select";
import { getCollaborators } from "@/action/user.action";
import { UserType } from "@/types/user.types";
import { create } from "@/action/task.action";
import { TaskType } from "@/types/task.type";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import useTaskStore from "@/stores/task.store";
import { KanbanTask } from "@/components/ui/shadcn-io/kanban";

type AddTaskFormProps = {
  closeModal: Dispatch<SetStateAction<boolean>>;
};

export default function AddTaskForm({ closeModal }: AddTaskFormProps) {
  const id = useDataStore.use.currentCompany();
  const param = useParams();
  const addTask = useTaskStore.use.addTask();

  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: "",
      description: "",
      comment: "",
      users: [],
      uploadDocuments: undefined,
    },
  });

  const {
    mutate: mutateCollaborators,
    isPending: isLoadingCollaborators,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<UserType[]>>(
    getCollaborators,
    () => { },
    "collaborators"
  );

  console.log({ param })

  useEffect(() => {
    if (param.id) {
      form.setValue("projectId", param.id as string)
    }
  }, [param.id, form]);

  useEffect(() => {
    if (id) {
      mutateCollaborators({ id });
    }
  }, [id]);

  const { mutate, isPending } = useQueryAction<
    TaskSchemaType,
    RequestResponse<TaskType>
  >(create, () => { }, "tasks");

  async function submit(taskData: TaskSchemaType) {
    const { success, data } = taskSchema.safeParse(taskData);
    if (!success) return;
    if (!param.id) return toast.error("Aucun projet trouvé.");
    mutate(
      { ...data, projectId: param.id as string },
      {
        onSuccess(data) {
          if (data.data) {
            const taskData = data.data;
            const parsed: KanbanTask = {
              id: taskData.id,
              name: taskData.taskName,
              column:
                taskData.status === "TODO"
                  ? "todo"
                  : taskData.status === "IN_PROGRESS"
                    ? "inProgress"
                    : "done",
              owner: [],
              description: taskData.desc,
              status: taskData.status,
              comment: taskData.comment,
              time: taskData.time,
              priority: taskData.priority,
              users: taskData.users,
              steps: taskData.steps,
            };
            addTask(parsed);
          }
          closeModal(false);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="space-y-4.5 max-w-full">
          <FormField
            control={form.control}
            name="taskName"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    design="float"
                    label="Nom de la tâche"
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
            name="description"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    required={false}
                    design="float"
                    label="Description"
                    value={field.value}
                    handleChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="gap-x-2 grid grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <DatePicker
                      label="Delai"
                      mode="single"
                      value={field.value}
                      onChange={(e) => field.onChange(e as Date)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={priority}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner une priorité"
                      searchMessage="Rechercher une priorité"
                      noResultsMessage="Aucune priorité trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    required={false}
                    design="float"
                    label="Commentaire"
                    value={field.value}
                    handleChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="gap-x-2 grid grid-cols-3 w-full">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={status}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner un statut"
                      searchMessage="Rechercher un statut"
                      noResultsMessage="Aucun statut trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="users"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <MultipleSelect
                      label={
                        <span>
                          Personnes assignées
                          <span className="text-red-500">*</span>
                        </span>
                      }
                      isLoading={isLoadingCollaborators}
                      options={
                        data?.data?.map((user) => ({
                          label: user.name,
                          value: user.id,
                        })) ?? []
                      }
                      placeholder="Ajouter des personnes assignées"
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
          </div>
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
