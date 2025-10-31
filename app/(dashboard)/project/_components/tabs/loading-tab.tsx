import { Dispatch, RefObject, SetStateAction } from "react";
import ProjectTable, { ProjectTableRef } from "../project-table";

type UpcomingTabProps = {
  projectTableRef: RefObject<ProjectTableRef | null>;
  selectedProjectIds: string[];
  setSelectedProjectIds: Dispatch<SetStateAction<string[]>>;
};

export default function LoadingTab({
  projectTableRef,
  selectedProjectIds,
  setSelectedProjectIds,
}: UpcomingTabProps) {
  return (
    <div className="pt-4">
      <ProjectTable
        filter="loading"
        ref={projectTableRef}
        selectedProjectIds={selectedProjectIds}
        setSelectedProjectIds={setSelectedProjectIds}
      />
    </div>
  );
}
