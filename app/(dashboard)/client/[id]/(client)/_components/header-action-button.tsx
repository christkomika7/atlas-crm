"use client";
import useTabStore from "@/stores/tab.store";
import { Button } from "@/components/ui/button";
import ActionsButton from "./actions/actions-button";
import ProjectModalCreate from "./actions/project-modal-create";

export default function HeaderActionButton() {
  const currentClientTab = useTabStore((state) => state.tabs["client-tab"]);

  const renderContent = () => {
    switch (currentClientTab) {
      case 0:
        return (
          <div className="flex gap-x-2">
            <Button variant="delete" className="w-fit font-medium">
              Suppression
            </Button>
            <ActionsButton />
          </div>
        );
      case 1:
        return <></>;
      case 2:
        return (
          <div className="flex gap-x-2">
            <ProjectModalCreate />
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="h-12">{renderContent()}</div>;
}
