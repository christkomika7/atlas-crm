import Header from "@/components/header/header";
import EditForm from "../_components/edit-form";

export default function EditBillboard() {
  return (
    <div className="max-h-[calc(100vh-32px)] overflow-hidden">
      <Header back={1} title="Panneaux publicitaires" />
      <EditForm />
    </div>
  );
}
