"use client";

import { Tabs } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  editBillboardFormSchema,
  EditBillboardSchemaFormType,
} from "@/lib/zod/billboard.schema";
import { Button } from "@/components/ui/button";

import BillboardInfoTab from "./tabs/billboard-info-tab";
import LessorInfoTab from "./tabs/lessor-info-tab";
import { Form } from "@/components/ui/form";
import { useEffect, useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";
import { unique, update } from "@/action/billboard.action";
import { useParams } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import useBillboardStore from "@/stores/billboard.store";
import Decimal from "decimal.js";
import { MORAL_COMPANY, PHYSICAL_COMPANY } from "@/config/constant";
import { toast } from "sonner";

export default function EditForm() {
  const [lastPhotos, setLastPhotos] = useState<string[]>([]);
  const [lastBrochures, setLastBrochures] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cityId, setCityId] = useState("");
  const isInitialized = useRef(false);
  const [lessorTypeName, setLessorTypeName] = useState("");

  const setCurrentSpaceType = useBillboardStore.use.setCurrentSpaceType();

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const param = useParams();

  const form = useForm<EditBillboardSchemaFormType>({
    resolver: zodResolver(editBillboardFormSchema),
  });

  const { mutate, isPending } = useQueryAction<
    EditBillboardSchemaFormType,
    RequestResponse<BillboardType>
  >(update, () => { }, "billboards");

  const {
    mutate: mutateBillboard,
    isPending: isPendingBillboard,
  } = useQueryAction<{ id: string }, RequestResponse<BillboardType>>(
    unique,
    () => { },
    "billboard"
  );


  useEffect(() => {
    if (param.id) {
      mutateBillboard({ id: param.id as string }, {
        onSuccess(data) {
          if (data.data) {
            initForn(data.data)
          }
        },
      });
    }
  }, [param]);




  const handleReset = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  useEffect(() => {
    form.watch(() => console.log({ errors: form.formState.errors }));
  }, [form.watch]);


  const spaceType = form.watch("lessor.lessorSpaceType");
  useEffect(() => {
    if (!spaceType) return;

    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

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
      "lessor.lessorCustomer",
    ]);

    if (spaceType === "public") {
      const privateFields = [
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
      ];
      privateFields.forEach((field) => {
        form.setValue(field as any, undefined);
        form.unregister(field as any);
      });
      form.setValue("lessor.lessorType", "");
      form.setValue("lessor.lessorTypeName", undefined);
    }

    if (spaceType === "private") {

      form.setValue("lessor.lessorCustomer", undefined);
      form.unregister("lessor.lessorCustomer");
      form.setValue("lessor.lessorType", "");
      form.setValue("lessor.lessorTypeName", undefined);
    }
  }, [spaceType, form]);


  const currentLessorTypeName = form.watch("lessor.lessorTypeName");
  useEffect(() => {
    if (!currentLessorTypeName) return;

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
      "lessor.identityCard",
    ]);

    if (currentLessorTypeName === PHYSICAL_COMPANY) {
      const moralFields = [
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
        "lessor.rentalStartDate",
        "lessor.rentalPeriod",
      ];
      moralFields.forEach((field) => {
        form.setValue(field as any, undefined);
        form.unregister(field as any);
      });
    }

    if (currentLessorTypeName === MORAL_COMPANY) {
      const physicalFields = [
        "lessor.identityCard",
        "lessor.delayContractStart",
        "lessor.delayContractEnd",
      ];
      physicalFields.forEach((field) => {
        form.setValue(field as any, undefined);
        form.unregister(field as any);
      });
    }
  }, [currentLessorTypeName, form]);


  function initForn(billboard: BillboardType) {
    setLastPhotos(billboard.photos);
    setLastBrochures(billboard.brochures);
    setCityId(billboard.cityId);
    setCurrentSpaceType(billboard.lessorSpaceType as "private" | "public");

    setWidth(billboard.width);
    setHeight(billboard.height);
    setLessorTypeName(billboard.lessorType.name);
    form.reset({
      billboard: {
        id: billboard.id,
        companyId: billboard.companyId,
        reference: billboard.reference,
        hasTax: billboard.hasTax,
        type: billboard.typeId,
        name: billboard.name,
        locality: billboard.locality,
        area: billboard.areaId,
        visualMarker: billboard.visualMarker,
        displayBoard: billboard.displayBoardId,
        city: billboard.cityId,
        orientation: billboard.orientation,
        gmaps: billboard.gmaps,

        photos: undefined,
        brochures: undefined,
        lastPhotos: billboard.photos,
        lastBrochures: billboard.brochures,

        rentalPrice: new Decimal(billboard.rentalPrice),
        installationCost: new Decimal(billboard.installationCost),
        maintenance: new Decimal(billboard.maintenance),

        width: billboard.width,
        height: billboard.height,
        lighting: billboard.lighting,
        structureType: billboard.structureTypeId,
        panelCondition: billboard.panelCondition,
        decorativeElement: billboard.decorativeElement,
        foundations: billboard.foundations,
        electricity: billboard.electricity,
        framework: billboard.framework,
        note: billboard.note,
      },
      lessor: {
        lessorSpaceType: billboard.lessorSpaceType,
        lessorType: billboard.lessorType.id,
        lessorTypeName: billboard.lessorType?.name,

        ...(billboard.lessorSpaceType === "private"
          ? {
            lessorName: billboard.lessorName || undefined,
            lessorAddress: billboard.lessorAddress || undefined,
            lessorCity: billboard.lessorCity || undefined,
            lessorPhone: billboard.lessorPhone || undefined,
            lessorEmail: billboard.lessorEmail || undefined,
            locationPrice: billboard.locationPrice || undefined,
            nonLocationPrice: billboard.nonLocationPrice || undefined,

            ...(billboard.lessorType?.name === "Personne physique"
              ? {
                identityCard: billboard.identityCard,
                delayContractStart: billboard.delayContractStart
                  ? new Date(billboard.delayContractStart).toISOString()
                  : undefined,
                delayContractEnd: billboard.delayContractEnd
                  ? new Date(billboard.delayContractEnd).toISOString()
                  : undefined,
              }
              : {
                capital: new Decimal(billboard.capital || 0).toString(),
                rccm: billboard.rccm || undefined,
                taxIdentificationNumber: billboard.taxIdentificationNumber || undefined,
                niu: billboard.niu || undefined,
                legalForms: billboard.legalForms || undefined,
                representativeFirstName: billboard.representativeFirstName || undefined,
                representativeLastName: billboard.representativeLastName || undefined,
                representativeJob: billboard.representativeJob || undefined,
                representativePhone: billboard.representativePhone || undefined,
                representativeEmail: billboard.representativeEmail || undefined,
              }),

            bankName: billboard.bankName || undefined,
            rib: billboard.rib || undefined,
            iban: billboard.iban || undefined,
            bicSwift: billboard.bicSwift || undefined,
            paymentMode: billboard.paymentMode ? JSON.parse(billboard.paymentMode) : undefined,
            paymentFrequency: billboard.paymentFrequency || undefined,
            electricitySupply: billboard.electricitySupply || undefined,
            specificCondition: billboard.specificCondition || undefined,
          }
          : {
            lessorCustomer: billboard.lessorSupplierId || undefined,
          }),
      },
    });

    form.setValue('lessor.rentalPeriod', billboard.rentalPeriod);
    form.setValue('lessor.rentalStartDate', billboard.rentalStartDate
      ? new Date(billboard.rentalStartDate).toISOString()
      : undefined,)
  }

  function submit(formData: EditBillboardSchemaFormType) {
    const validateData = editBillboardFormSchema.safeParse(formData);
    if (!validateData.success) return toast.error("Certains champs présentent des erreurs.");

    const d = validateData.data;

    mutate(
      {
        billboard: {
          id: d.billboard.id,
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
          lastPhotos,
          lastBrochures,
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
          handleReset();
          form.reset();
          mutateBillboard({ id: param.id as string }, {
            onSuccess(data) {
              if (data.data) {
                isInitialized.current = false;
                initForn(data.data)
              }
            },
          });
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex-1 px-6 py-4 h-[calc(100vh-136px)] overflow-auto">
          {isPendingBillboard && (
            <Badge variant="secondary" className="text-sm">
              Chargement des données <Spinner size={12} />
            </Badge>
          )}
          <Tabs
            tabs={[
              {
                id: 1,
                title: "Infos panneau d'affichage",
                content: (
                  <BillboardInfoTab
                    form={form}
                    setLastPhotos={setLastPhotos}
                    lastBrochures={lastBrochures}
                    lastPhotos={lastPhotos}
                    setLastBrochures={setLastBrochures}
                    ref={fileInputRef}
                    cityId={cityId}
                    width={width}
                    setWidth={setWidth}
                    height={height}
                    setHeight={setHeight}
                  />
                ),
              },
              {
                id: 2,
                title: "Infos bailleur",
                content: <LessorInfoTab lessorTypeName={lessorTypeName} setLessorTypeName={setLessorTypeName} form={form} />,
              },
            ]}
            tabId="billboard-tab"
          />
        </div>
        <div className="flex justify-center max-w-xl">
          <Button variant="primary" className="max-w-xs">
            {isPending ? <Spinner /> : "Valider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
