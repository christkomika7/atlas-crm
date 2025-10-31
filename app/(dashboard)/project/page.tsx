"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { removeMany } from "@/action/project.action";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { ProjectTableRef } from "./_components/project-table";
import LoadingTab from "./_components/tabs/loading-tab";
import StopTab from "./_components/tabs/stop-tab";
import ProjectForm from "./_components/project-form";
import ModalContainer from "@/components/modal/modal-container";
import { PlusCircle } from "lucide-react";

export default function ProjectPage() {
  const [open, setOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const projectTableRef = useRef<ProjectTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<null>
  >(removeMany, () => { }, "projects");

  const handleProject = () => {
    projectTableRef.current?.refreshData();
  };

  function removeProjects() {
    if (selectedProjectIds.length > 0) {
      mutate(
        { ids: selectedProjectIds },
        {
          onSuccess() {
            setSelectedProjectIds([]);
            handleProject();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Projet">
        <div className="flex gap-x-2">
          <Button
            variant="primary"
            className="bg-red w-fit font-medium"
            onClick={removeProjects}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                {selectedProjectIds.length > 0 &&
                  `(${selectedProjectIds.length})`}{" "}
                Suppression
              </>
            )}
          </Button>
          <ModalContainer
            size="sm"
            action={
              <Button
                onClick={() => setOpen(!open)}
                variant="primary"
                className="w-fit font-medium"
              >
                <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Ajouter un projet
              </Button>
            }
            title="Nouveau projet"
            open={open}
            setOpen={(value) =>
              setOpen(value as boolean)
            }
            onClose={() => setOpen(false)}
          >
            <ProjectForm closeModal={() => setOpen(false)} refreshData={handleProject} />
          </ModalContainer>
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "En cour",
            content: (
              <LoadingTab
                projectTableRef={projectTableRef}
                selectedProjectIds={selectedProjectIds}
                setSelectedProjectIds={setSelectedProjectIds}
              />
            ),
          },
          {
            id: 2,
            title: "Terminé",
            content: (
              <StopTab
                projectTableRef={projectTableRef}
                selectedProjectIds={selectedProjectIds}
                setSelectedProjectIds={setSelectedProjectIds}
              />
            ),
          },
        ]}
        tabId="projects-tab"
      />
    </div>
  );
}
