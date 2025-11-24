import { $Enums } from '@/lib/generated/prisma';
import { ProjectType } from './project.types';
import { TaskStepType } from './step.type';
import { ProfileType } from './user.types';

export type TaskType = {
    id: string;
    taskName: string;
    desc: string;
    comment: string;
    path: string;
    time: Date;
    priority: $Enums.Priority;
    status: $Enums.ProjectStatus;
    file: string[];
    project: ProjectType;
    users: ProfileType[];
    steps: TaskStepType[]
}