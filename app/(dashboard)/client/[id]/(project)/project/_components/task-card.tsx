"use client";

import { Badge } from "@/components/ui/badge";
import { cn, getFilePath } from "@/lib/utils";
import { TaskType } from "@/types/task.type";
import {
  CalendarIcon,
  CheckIcon,
  EditIcon,
  InfoIcon,
  XIcon,
} from "lucide-react";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { RequestResponse } from "@/types/api.types";
import { remove, updateStatus } from "@/action/task.action";
import { $Enums } from "@/lib/generated/prisma";

import AlertDialogMessage from "@/components/alert-dialog/alert-dialog-message";
import useQueryAction from "@/hook/useQueryAction";
import useTaskStore from "@/stores/task.store";
import TaskModal from "./task-modal";
import TaskStep from "./task-step";
import { KanbanTask } from "@/components/ui/shadcn-io/kanban";
import { useEffect, useState } from "react";
import { ta } from "zod/v4/locales";

export type TaskCardProps = {
  task: KanbanTask;
};

export default function TaskCard({ task }: TaskCardProps) {
  const retrieveTask = useTaskStore.use.removeTask();
  const setStep = useTaskStore.use.setStep();
  const [preview, setPreview] = useState("");

  const { mutate: mutateRemoveTask, isPending: isPendingRemoveTask } =
    useQueryAction<{ id: string }, RequestResponse<TaskType>>(
      remove,
      () => { },
      "tasks"
    );

  useEffect(() => {
    if (task && task.steps) {
      setStep(task.steps);
    }
  }, [task]);

  const handleButtonClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  function removeTask(id: string) {
    mutateRemoveTask(
      { id },
      {
        onSuccess(data) {
          if (data.data) {
            retrieveTask(data.data.id);
          }
        },
      }
    );
  }

  return (
    <div className="">
      <div className="flex justify-end items-center gap-x-1">
        <TaskModal title="Information" type="info" id={task.id}>
          <span
            onClick={handleButtonClick}
            onMouseDown={handleButtonClick}
            className="flex justify-center items-center bg-amber-400/10 rounded-full w-5.5 h-5.5 text-amber-400 cursor-pointer"
          >
            <InfoIcon className="w-3.5 h-3.5" />
          </span>
        </TaskModal>

        <TaskModal title="Modifier la tâche" type="update" id={task.id}>
          <span
            onClick={handleButtonClick}
            onMouseDown={handleButtonClick}
            className="flex justify-center items-center bg-blue/10 rounded-full w-5.5 h-5.5 text-blue cursor-pointer"
          >
            <EditIcon className="w-3.5 h-3.5" />
          </span>
        </TaskModal>
        <AlertDialogMessage
          type="delete"
          isLoading={isPendingRemoveTask}
          actionButton={
            <span
              onClick={handleButtonClick}
              onMouseDown={handleButtonClick}
              className="flex justify-center items-center bg-red/10 rounded-full w-5.5 h-5.5 text-red"
            >
              <XIcon className="w-3.5 h-3.5" />
            </span>
          }
          title="Confirmer la suppression"
          message={
            <>
              Êtes-vous sûr de vouloir supprimer cette tâche ? <br />
              <span className="text-muted-foreground text-sm">
                Cette action est définitive et ne peut pas être annulée.
              </span>
            </>
          }
          confirmAction={() => removeTask(task.id)}
        />
      </div>
      <div className="space-y-2 mb-3 ">
        <div className="flex gap-x-1 justify-between items-end">
          <h2 className="mb-1 font-medium text-xs">{task.name}</h2>
          <small className="text-neutral-600 text-[11px]">
            {new Date(task.time).toLocaleDateString()}
          </small>
        </div>
        <TaskStep id={task.id} />
      </div>
      <div className="flex justify-end items-center gap-x-1">
        {task.status === "DONE" && <CheckIcon className="w-4 h-4 text-blue" />}
        <span
          className={cn(
            "rounded-full w-4 h-4",
            task.priority === "URGENT" && "bg-red",
            task.priority === "NORMAL" && "bg-yellow-400",
            task.priority === "RELAX" && "bg-blue-700"
          )}
        ></span>
        <AvatarCircles
          numPeople={Array.isArray(task.users) ? task.users.length : 0}
          avatarUrls={task.users.map((user) => ({
            imageUrl: getFilePath(user.image as string),
            profileUrl: getFilePath(user.image as string),
          }))}
        />
      </div>
    </div>
  );
}
