import { TaskType } from "./task.type";

export type TaskStepType = {
    id: string;
    stepName: string;
    check: boolean;
    taskId: string;
    task: TaskType
}