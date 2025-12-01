"use client";

import { Tabs } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  billboardFormSchema,
  BillboardSchemaFormType,
} from "@/lib/zod/billboard.schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";
import { create } from "@/action/billboard.action";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";

import BillboardInfoTab from "./tabs/billboard-info-tab";
import LessorInfoTab from "./tabs/lessor-info-tab";
import useQueryAction from "@/hook/useQueryAction";

export default function CreateForm() {
  const companyId = useDataStore.use.currentCompany();
  const router = useRouter();

  const form = useForm<BillboardSchemaFormType>({
    resolver: zodResolver(billboardFormSchema),
  });

  const { mutate, isPending } = useQueryAction<
    BillboardSchemaFormType,
    RequestResponse<BillboardType>
  >(create, () => { }, "billboards");

  useEffect(() => {
    if (companyId) {
      form.reset({
        billboard: {
          companyId,
          hasTax: false
        }
      });
    }
  }, [companyId, form]);

  function submit(formData: BillboardSchemaFormType) {
    const validateData = billboardFormSchema.safeParse(formData);

    if (validateData.success) {
      mutate(validateData.data, {
        onSuccess() {
          router.push("/billboard");
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex-1 px-6 py-4 h-[calc(100vh-180px)] overflow-auto">
          <Tabs
            tabs={[
              {
                id: 1,
                title: "Infos panneau d'affichage",
                content: <BillboardInfoTab form={form} />,
              },
              {
                id: 2,
                title: "Infos bailleur",
                content: <LessorInfoTab form={form} />,
              },
            ]}
            tabId="billboard-tab"
          />
        </div>
        <div className="flex justify-center pt-2 max-w-xl">
          <Button variant="primary" className="max-w-xs" disabled={isPending}>
            {isPending ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
