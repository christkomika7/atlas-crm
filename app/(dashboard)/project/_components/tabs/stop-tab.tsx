import React, { Dispatch, RefObject, SetStateAction } from "react";
import ProjectTable, { ProjectTableRef } from "../project-table";

type PastTabProps = {
  projectTableRef: RefObject<ProjectTableRef | null>;
  selectedProjectIds: string[];
  setSelectedProjectIds: Dispatch<SetStateAction<string[]>>;
};

export default function StopTab({
  projectTableRef,
  selectedProjectIds,
  setSelectedProjectIds,
}: PastTabProps) {
  return (
    <div className="pt-4">
      <ProjectTable
        filter="stop"
        ref={projectTableRef}
        selectedProjectIds={selectedProjectIds}
        setSelectedProjectIds={setSelectedProjectIds}
      />
    </div>
  );
}
