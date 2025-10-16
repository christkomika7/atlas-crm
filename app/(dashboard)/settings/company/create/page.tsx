"use client";
import Header from "@/components/header/header";
import CreateCompanyForm from "../_component/create-company-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreateCompany() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-9.5">
        <Header back="/settings" title="Nouvelle entreprise" />
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="w-full h-full">
          <div className="pr-2">
            <CreateCompanyForm />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
