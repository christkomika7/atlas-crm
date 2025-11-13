"use client";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanTask,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { TaskType } from "@/types/task.type";
import { all as allTasks, updateStatus } from "@/action/task.action";
import Spinner from "@/components/ui/spinner";
import useTaskStore from "@/stores/task.store";
import TaskCard from "./task-card";
import { Button } from "@/components/ui/button";
import TaskModal from "./task-modal";
import { PlusIcon } from "lucide-react";
import { $Enums } from "@/lib/generated/prisma";

const columns = [
  { id: "todo", name: "A faire", color: "#6B7280" },
  { id: "inProgress", name: "En cours", color: "#F59E0B" },
  { id: "done", name: "Terminé", color: "#10B981" },
];

type TaskContainerProps = {
  projectId: string;
};

export default function TaskContainer({ projectId }: TaskContainerProps) {
  const tasks = useTaskStore.use.tasks();
  const setTask = useTaskStore.use.setTask();

  const { mutate, isPending, data } = useQueryAction<
    { projectId: string },
    RequestResponse<TaskType[]>
  >(allTasks, () => { }, "tasks");

  const { mutate: mutateEditStatusTask, isPending: isUpdatingStatus } =
    useQueryAction<
      { id: string; status: $Enums.ProjectStatus },
      RequestResponse<TaskType>
    >(updateStatus, () => { }, "task");

  useEffect(() => {
    if (projectId) {
      mutate(
        { projectId },
        {
          onSuccess(data) {
            if (data.data) {
              const taskData = data.data;
              const mapped: KanbanTask[] = taskData.map((task) => ({
                id: task.id,
                name: task.taskName,
                column:
                  task.status === "TODO"
                    ? "todo"
                    : task.status === "IN_PROGRESS"
                      ? "inProgress"
                      : "done",
                owner: [],
                description: task.desc,
                status: task.status,
                comment: task.comment,
                time: task.time,
                priority: task.priority,
                users: task.users,
                steps: task.steps,
              }));
              setTask(mapped);
            }
          },
        }
      );
    }
  }, [projectId]);


  function mapColumnToStatus(column: string): $Enums.ProjectStatus {
    switch (column) {
      case "todo":
        return "TODO";
      case "inProgress":
        return "IN_PROGRESS";
      case "done":
        return "DONE";
      default:
        return "TODO";
    }
  }

  return (
    <div className="h-full px-6">
      <div className="mb-2">
        <TaskModal title="Nouvelle tâche" type="create">
          <Button variant="primary" className="!h-9 w-fit">
            <PlusIcon />
            Ajouter une nouvelle tâche
          </Button>
        </TaskModal>
      </div>
      <ScrollArea className="h-full pr-4">
        <div className="pb-4">
          <KanbanProvider<KanbanTask>
            columns={columns}
            data={tasks}
            onDragEnd={(event) => {
              const { active, over } = event;

              if (!over) return;
              const task = tasks.find((t) => t.id === active.id);
              if (!task) return;

              const newColumn =
                columns.find((col) => col.id === over.id)?.id ?? task.column;

              const newStatus = mapColumnToStatus(newColumn);

              mutateEditStatusTask({ id: task.id, status: newStatus });
            }}
            onDataChange={setTask}
          >
            {(column) => {
              const tasksInColumn = tasks.filter((f) => f.column === column.id);
              return (
                <KanbanBoard
                  id={column.id}
                  key={column.id}
                  className="shadow-none bg-gray"
                >
                  <KanbanHeader>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full flex gap-x-2 items-center"
                        style={{ background: column.name }}
                      />
                      <span>
                        {column.name} ({tasksInColumn.length}){" "}
                      </span>
                      {isUpdatingStatus && <Spinner size={10} />}
                    </div>
                  </KanbanHeader>
                  {isPending ? (
                    <Spinner />
                  ) : (
                    <KanbanCards id={column.id}>
                      {(task: KanbanTask) => (
                        <KanbanCard
                          column={column.id}
                          id={task.id}
                          key={task.id}
                          name={task.name}
                        >
                          <TaskCard task={task} />
                        </KanbanCard>
                      )}
                    </KanbanCards>
                  )}
                </KanbanBoard>
              );
            }}
          </KanbanProvider>
        </div>
      </ScrollArea>
    </div>
  );
}
