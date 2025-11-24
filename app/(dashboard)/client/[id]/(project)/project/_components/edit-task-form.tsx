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
import { useDataStore } from "@/stores/data.store";
import { DatePicker } from "@/components/ui/date-picker";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { priority, status } from "@/lib/data";
import { MultipleSelect, Option } from "@/components/ui/multi-select";
import { getCollaborators } from "@/action/user.action";
import { ProfileType } from "@/types/user.types";
import { unique, update } from "@/action/task.action";
import { TaskType } from "@/types/task.type";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import useTaskStore from "@/stores/task.store";
import { Badge } from "@/components/ui/badge";
import { editTaskSchema, EditTaskSchemaType } from "@/lib/zod/task.schema";
import { downloadFile } from "@/lib/utils";
import { DownloadIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanTask } from "@/components/ui/shadcn-io/kanban";

type EditTaskFormProps = {
  closeModal: Dispatch<SetStateAction<boolean>>;
  id: string;
};

export default function EditTaskForm({
  closeModal,
  id: taskId,
}: EditTaskFormProps) {
  const [lastUploadDocuments, setLastUploadDocuments] = useState<string[]>([]);
  const id = useDataStore.use.currentCompany();
  const param = useParams();
  const editTask = useTaskStore.use.editTask();

  const form = useForm<EditTaskSchemaType>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      taskName: "",
      description: "",
      comment: "",
      users: [],
      uploadDocuments: undefined,
    },
  });

  const {
    mutate: mutateTask,
    isPending: isLoadingTask,
    data: taskData,
  } = useQueryAction<{ id: string }, RequestResponse<TaskType>>(
    unique,
    () => { },
    "task"
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
    EditTaskSchemaType,
    RequestResponse<TaskType>
  >(update, () => { }, "tasks");

  useEffect(() => {
    if (taskId) {
      mutateTask({ id: taskId });
    }
  }, [taskId]);

  useEffect(() => {
    if (taskData?.data) {
      const task = taskData.data;
      setLastUploadDocuments(task.file.filter((file) => Boolean(file)));
      form.reset({
        id: task.id,
        taskName: task.taskName,
        description: task.desc,
        time: new Date(task.time),
        priority: task.priority,
        comment: task.comment,
        status: task.status,
        users: task.users.map((u) => u.id),
        uploadDocuments: undefined,
        lastUploadDocuments: task.file,
        projectId: task.project.id as string,
      });
    }
  }, [taskData, form]);

  useEffect(() => {
    if (id) {
      mutateCollaborators({ id });
    }
  }, [id]);

  function removeLastUploadDocuments(name: string) {
    setLastUploadDocuments((prev) => prev.filter((d) => d !== name));
  }

  async function submit(taskData: EditTaskSchemaType) {
    const { success, data } = editTaskSchema.safeParse(taskData);
    if (!success) return;
    if (!param.projectId) return toast.error("Aucun projet trouvé.");
    mutate(
      {
        ...data,
        projectId: param.projectId as string,
        lastUploadDocuments: lastUploadDocuments,
      },
      {
        onSuccess(data) {
          if (data.data) {
            const taskData = data.data;
            const mapped: KanbanTask = {
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
            editTask(mapped);
          }
          closeModal(false);
        },
      }
    );
  }

  return (
    <>
      {isLoadingTask && (
        <Badge variant="secondary" className="text-sm">
          Chargement des données <Spinner size={12} />
        </Badge>
      )}
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
                      disabled={isLoadingTask}
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
                      disabled={isLoadingTask}
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
                        disabled={isLoadingTask}
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
                        disabled={isLoadingTask}
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
                      disabled={isLoadingTask}
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
                        disabled={isLoadingTask}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="users"
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
                              Personnes assignées{" "}
                              <span className="text-red-500">*</span>
                            </span>
                          }
                          isLoading={isLoadingCollaborators}
                          options={allOptions}
                          value={selectedOptions}
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          placeholder="Ajouter des personnes assignées"
                          disabled={isLoadingTask}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                        disabled={isLoadingTask}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              disabled={isLoadingTask || isPending}
            >
              {isPending ? <Spinner /> : "Valider"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
