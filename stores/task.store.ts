import { $Enums } from '@/lib/generated/prisma';
import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { TaskStepType } from '@/types/step.type';
import { KanbanTask } from '@/components/ui/shadcn-io/kanban';

export type TaskStore = {
    step: TaskStepType[];
    tasks: KanbanTask[];

    // Task methods
    setTask: (tasks: KanbanTask[]) => void;
    addTask: (task: KanbanTask) => void;
    updateTask: (task: KanbanTask, status: $Enums.ProjectStatus) => void;
    editTask: (task: KanbanTask) => void;
    removeTask: (id: string) => void;

    // Step methods
    setStep: (steps: TaskStepType[]) => void;
    addStep: (step: TaskStepType) => void;
    updateStep: (step: TaskStepType) => void;
    removeStep: (id: string) => void;
    getStep: (taskId: string) => TaskStepType[];
};

const useTaskStore = createSelectors(create<TaskStore>()(
    (set, get) => ({
        step: [],
        tasks: [],

        setTask(tasks) {
            set({ tasks });
        },

        addTask: (task) => {
            const tasks = get().tasks;
            const index = tasks.findIndex((t) => t.id === task.id);

            if (index !== -1) {
                tasks[index] = task;
                set({ tasks: [...tasks] });
            } else {
                set({ tasks: [...tasks, task] });
            }
        },
        editTask: (task) =>
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === task.id
                        ? { ...t, ...task }
                        : t
                ),
            })),
        updateTask: (task, status) =>
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === task.id ? { ...t, status } : t
                ),
            })),

        removeTask: (id) =>
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            })),

        addStep: (step) => {
            const steps = get().step;
            const index = steps.findIndex(s => s.id === step.id);

            if (index !== -1) {
                steps[index] = step;
                set({ step: [...steps] });
            } else {
                set({ step: [...steps, step] });
            }
        },

        setStep: (steps) => {
            const currentSteps = get().step;
            const mergedSteps = [...currentSteps];

            for (const step of steps) {
                const index = mergedSteps.findIndex(s => s.id === step.id);
                if (index !== -1) {
                    mergedSteps[index] = step;
                } else {
                    mergedSteps.push(step);
                }
            }

            set({ step: mergedSteps });
        },

        updateStep: (step) => {
            set({
                step: get().step.map(s => s.id === step.id ? step : s)
            });
        },

        removeStep: (id) => {
            set({
                step: get().step.filter(s => s.id !== id)
            });
        },

        getStep: (taskId) => {
            return get().step.filter(s => s.taskId === taskId);
        },
    })
));

export default useTaskStore;
