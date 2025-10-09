import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { ProjectType } from "@/types/project.types";

type ProjectStore = {
    projects: ProjectType[];
    setProject: (projects: ProjectType[]) => void;
    addProject: (project: ProjectType) => void;
    removeProject: (id: string) => void;
};

const useProjectStore = createSelectors(
    create<ProjectStore>()((set, get) => ({
        projects: [],
        setProject(projects) {
            set({ projects });
        },
        addProject(project) {
            const exists = get().projects.some((p) => p.id === project.id);
            if (!exists) {
                set({ projects: [...get().projects, project] });
            }
        },
        removeProject(id) {
            set({ projects: get().projects.filter((a) => a.id !== id) });
        },
    }))
);

export default useProjectStore;
