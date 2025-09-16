import Header from "@/components/header/header";
import CreateForm from "./_components/create-form";

export default function CreateBillboard() {
  return (
    <div className="max-h-[calc(100vh-32px)] overflow-hidden">
      <Header back={1} title="Panneaux publicitaires" />
      <CreateForm />
    </div>
  );
}
