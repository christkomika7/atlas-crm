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
import { toast } from "sonner";
import Decimal from "decimal.js";
import { PHYSICAL_COMPANY } from "@/config/constant";

export default function CreateForm() {
  const companyId = useDataStore.use.currentCompany();
  const router = useRouter();

  const form = useForm<BillboardSchemaFormType>({
    resolver: zodResolver(billboardFormSchema),
  });

  const spaceType = form.watch("lessor.lessorSpaceType");
  const lessorTypeName = form.watch("lessor.lessorTypeName");

  const { mutate, isPending } = useQueryAction<
    BillboardSchemaFormType,
    RequestResponse<BillboardType>
  >(create, () => { }, "billboards");

  useEffect(() => {
    if (!spaceType) return;

    form.clearErrors([
      "lessor.delayContractStart",
      "lessor.delayContractEnd",
      "lessor.rentalStartDate",
      "lessor.rentalPeriod",
      "lessor.capital",
      "lessor.rccm",
      "lessor.taxIdentificationNumber",
      "lessor.legalForms",
      "lessor.representativeFirstName",
      "lessor.representativeLastName",
      "lessor.representativeJob",
      "lessor.representativePhone",
      "lessor.representativeEmail",
      "lessor.locationPrice",
      "lessor.nonLocationPrice",
      "lessor.lessorName",
      "lessor.lessorAddress",
      "lessor.lessorCity",
      "lessor.lessorEmail",
      "lessor.lessorPhone",
      "lessor.niu",
      "lessor.rib",
      "lessor.iban",
      "lessor.bicSwift",
      "lessor.bankName",
      "lessor.paymentMode",
      "lessor.paymentFrequency",
      "lessor.electricitySupply",
      "lessor.specificCondition",
      "lessor.identityCard",
      "lessor.lessorCustomer"
    ]);

    if (spaceType === "public") {
      form.setValue("lessor.delayContractStart", undefined);
      form.setValue("lessor.delayContractStart", undefined);
      form.setValue("lessor.rentalStartDate", undefined);
      form.setValue("lessor.rentalPeriod", undefined);
      form.setValue("lessor.capital", undefined);
      form.setValue("lessor.rccm", undefined);
      form.setValue("lessor.taxIdentificationNumber", undefined);
      form.setValue("lessor.legalForms", undefined);
      form.setValue("lessor.representativeFirstName", undefined);
      form.setValue("lessor.representativeLastName", undefined);
      form.setValue("lessor.representativeJob", undefined);
      form.setValue("lessor.representativePhone", undefined);
      form.setValue("lessor.representativeEmail", undefined);
      form.setValue("lessor.locationPrice", undefined);
      form.setValue("lessor.nonLocationPrice", undefined);
      form.setValue("lessor.lessorName", undefined);
      form.setValue("lessor.lessorAddress", undefined);
      form.setValue("lessor.lessorCity", undefined);
      form.setValue("lessor.lessorEmail", undefined);
      form.setValue("lessor.lessorPhone", undefined);
      form.setValue("lessor.niu", undefined);
      form.setValue("lessor.rib", undefined);
      form.setValue("lessor.iban", undefined);
      form.setValue("lessor.bicSwift", undefined);
      form.setValue("lessor.bankName", undefined);
      form.setValue("lessor.paymentMode", undefined);
      form.setValue("lessor.paymentFrequency", undefined);
      form.setValue("lessor.electricitySupply", undefined);
      form.setValue("lessor.specificCondition", undefined);
      form.setValue("lessor.identityCard", undefined);

      // Désenregistrer
      form.unregister("lessor.delayContractStart");
      form.unregister("lessor.delayContractEnd");
      form.unregister("lessor.rentalStartDate");
      form.unregister("lessor.rentalPeriod");
      form.unregister("lessor.capital");
      form.unregister("lessor.rccm");
      form.unregister("lessor.taxIdentificationNumber");
      form.unregister("lessor.legalForms");
      form.unregister("lessor.representativeFirstName");
      form.unregister("lessor.representativeLastName");
      form.unregister("lessor.representativeJob");
      form.unregister("lessor.representativePhone");
      form.unregister("lessor.representativeEmail");
      form.unregister("lessor.locationPrice");
      form.unregister("lessor.nonLocationPrice");
      form.unregister("lessor.lessorName");
      form.unregister("lessor.lessorAddress");
      form.unregister("lessor.lessorCity");
      form.unregister("lessor.lessorEmail");
      form.unregister("lessor.lessorPhone");
      form.unregister("lessor.niu");
      form.unregister("lessor.rib");
      form.unregister("lessor.iban");
      form.unregister("lessor.bicSwift");
      form.unregister("lessor.bankName");
      form.unregister("lessor.paymentMode");
      form.unregister("lessor.paymentFrequency");
      form.unregister("lessor.electricitySupply");
      form.unregister("lessor.specificCondition");
      form.unregister("lessor.identityCard");
    }

    if (spaceType === "private") {
      form.setValue("lessor.lessorCustomer", undefined);
      form.unregister("lessor.lessorCustomer");

      form.setValue("lessor.lessorTypeName", undefined);
      form.setValue("lessor.lessorType", '');
    }

    if (spaceType === "public") {
      form.setValue("lessor.lessorType", '');
      form.setValue("lessor.lessorTypeName", undefined);
    }
  }, [spaceType, form]);

  useEffect(() => {
    if (!lessorTypeName) return;

    form.clearErrors([
      "lessor.delayContractStart",
      "lessor.delayContractEnd",
      "lessor.rentalPeriod",
      "lessor.capital",
      "lessor.rccm",
      "lessor.taxIdentificationNumber",
      "lessor.legalForms",
      "lessor.niu",
      "lessor.representativeFirstName",
      "lessor.representativeLastName",
      "lessor.representativeJob",
      "lessor.representativePhone",
      "lessor.representativeEmail",
      "lessor.identityCard"
    ]);

    if (lessorTypeName === "Personne physique") {
      form.setValue("lessor.capital", undefined);
      form.setValue("lessor.rccm", undefined);
      form.setValue("lessor.taxIdentificationNumber", undefined);
      form.setValue("lessor.legalForms", undefined);
      form.setValue("lessor.niu", undefined);
      form.setValue("lessor.representativeFirstName", undefined);
      form.setValue("lessor.representativeLastName", undefined);
      form.setValue("lessor.representativeJob", undefined);
      form.setValue("lessor.representativePhone", undefined);
      form.setValue("lessor.representativeEmail", undefined);
      form.setValue("lessor.rentalStartDate", undefined);
      form.setValue("lessor.rentalPeriod", undefined);

      form.unregister("lessor.capital");
      form.unregister("lessor.rccm");
      form.unregister("lessor.taxIdentificationNumber");
      form.unregister("lessor.legalForms");
      form.unregister("lessor.niu");
      form.unregister("lessor.representativeFirstName");
      form.unregister("lessor.representativeLastName");
      form.unregister("lessor.representativeJob");
      form.unregister("lessor.representativePhone");
      form.unregister("lessor.representativeEmail");
      form.unregister("lessor.rentalStartDate");
      form.unregister("lessor.rentalPeriod");
    }

    if (lessorTypeName === "Personne moral") {
      form.setValue("lessor.identityCard", undefined);
      form.setValue("lessor.delayContractStart", undefined);
      form.setValue("lessor.delayContractEnd", undefined);


      form.unregister("lessor.identityCard");
      form.unregister("lessor.delayContractStart");
      form.unregister("lessor.delayContractEnd");
    }
  }, [lessorTypeName, form]);

  useEffect(() => {
    if (companyId) {
      form.reset({
        billboard: {
          companyId,
          hasTax: false,
        },
        lessor: {
          delayContractEnd: undefined,
          delayContractStart: undefined,
          rentalStartDate: undefined
        }
      });
    }
  }, [companyId, form]);

  function submit(formData: BillboardSchemaFormType) {
    const validateData = billboardFormSchema.safeParse(formData);
    if (!validateData.success) return toast.error("Certains champs présentent des erreurs.");

    const d = validateData.data;

    mutate(
      {
        billboard: {
          companyId: d.billboard.companyId,
          reference: d.billboard.reference,
          hasTax: d.billboard.hasTax,
          type: d.billboard.type,
          name: d.billboard.name,
          locality: d.billboard.locality,
          area: d.billboard.area,
          visualMarker: d.billboard.visualMarker,
          displayBoard: d.billboard.displayBoard,
          city: d.billboard.city,
          orientation: d.billboard.orientation,
          gmaps: d.billboard.gmaps,
          photos: d.billboard.photos,
          brochures: d.billboard.brochures,
          rentalPrice: new Decimal(d.billboard.rentalPrice),
          installationCost: new Decimal(d.billboard.installationCost || "0"),
          maintenance: new Decimal(d.billboard.maintenance || "0"),
          width: d.billboard.width,
          height: d.billboard.height,
          lighting: d.billboard.lighting,
          structureType: d.billboard.structureType,
          panelCondition: d.billboard.panelCondition,
          decorativeElement: d.billboard.decorativeElement,
          foundations: d.billboard.foundations,
          electricity: d.billboard.electricity,
          framework: d.billboard.framework,
          note: d.billboard.note,
        },
        lessor: {
          lessorType: d.lessor.lessorType,
          lessorSpaceType: d.lessor.lessorSpaceType,
          ...(d.lessor.lessorSpaceType === "private"
            ? {
              lessorTypeName: d.lessor.lessorTypeName,
              lessorName: d.lessor.lessorName,
              lessorAddress: d.lessor.lessorAddress,
              lessorCity: d.lessor.lessorCity,
              lessorPhone: d.lessor.lessorPhone,
              lessorEmail: d.lessor.lessorEmail,
              locationPrice: d.lessor.locationPrice,
              nonLocationPrice: d.lessor.nonLocationPrice,
              ...(d.lessor.lessorTypeName === PHYSICAL_COMPANY
                ? {
                  identityCard: d.lessor.identityCard,
                  delayContractStart: d.lessor.delayContractStart,
                  delayContractEnd: d.lessor.delayContractEnd,
                }
                : {
                  capital: d.lessor.capital,
                  rccm: d.lessor.rccm,
                  taxIdentificationNumber: d.lessor.taxIdentificationNumber,
                  niu: d.lessor.niu,
                  legalForms: d.lessor.legalForms,
                  representativeFirstName: d.lessor.representativeFirstName,
                  representativeLastName: d.lessor.representativeLastName,
                  representativeJob: d.lessor.representativeJob,
                  representativePhone: d.lessor.representativePhone,
                  representativeEmail: d.lessor.representativeEmail,
                  rentalStartDate: d.lessor.rentalStartDate,
                  rentalPeriod: d.lessor.rentalPeriod,
                }),
              bankName: d.lessor.bankName,
              rib: d.lessor.rib,
              iban: d.lessor.iban,
              bicSwift: d.lessor.bicSwift,
              paymentMode: d.lessor.paymentMode,
              paymentFrequency: d.lessor.paymentFrequency,
              electricitySupply: d.lessor.electricitySupply,
              specificCondition: d.lessor.specificCondition,
            }
            : {
              lessorCustomer: d.lessor.lessorCustomer,
            }),
        },
      },
      {
        onSuccess() {
          router.push("/billboard");
        },
      }
    );

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