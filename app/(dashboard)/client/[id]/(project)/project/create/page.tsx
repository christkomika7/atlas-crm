import Header from "@/components/header/header";
import React from "react";
import CreateProjectForm from "./_components/create-project-form";

export default function CreateProject() {
  return (
    <div className="flex flex-col space-y-9 h-full max-h-[calc(100vh-4rem)]">
      <div className="flex-shrink-0">
        <Header back={1} title="Nouveau projet" />
      </div>
      <div className="space-y-4 max-w-2xl">
        <h2 className="font-semibold text-xl">Projet</h2>
        <CreateProjectForm />
      </div>
    </div>
  );
}
