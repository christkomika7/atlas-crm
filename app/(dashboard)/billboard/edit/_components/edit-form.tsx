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
import { PHYSICAL_COMPANY } from "@/config/constant";

export default function EditForm() {
  const [lastPhotos, setLastPhotos] = useState<string[]>([]);
  const [lastBrochures, setLastBrochures] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cityId, setCityId] = useState("");
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
    data,
  } = useQueryAction<{ id: string }, RequestResponse<BillboardType>>(
    unique,
    () => { },
    "billboard"
  );

  useEffect(() => {
    if (param.id) {
      mutateBillboard({ id: param.id as string });
    }
  }, [param]);

  useEffect(() => {
    if (data?.data) {
      const billboard = data.data;
      setLastPhotos(billboard.photos);
      setLastBrochures(billboard.brochures);
      setCityId(billboard.cityId);
      setCurrentSpaceType(billboard.lessorSpaceType as "private" | "public");
      setWidth(billboard.width);
      setHeight(billboard.height);
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
          lessorType: billboard.lessorTypeId,
          lessorSpaceType: billboard.lessorSpaceType,
          ...(billboard.lessorSpaceType === 'private' ? {
            lessorName: billboard.lessorName,
            lessorAddress: billboard.lessorAddress,
            lessorCity: billboard.lessorCity,
            lessorPhone: billboard.lessorPhone,
            lessorEmail: billboard.lessorEmail,
            locationPrice: billboard.locationPrice,
            nonLocationPrice: billboard.nonLocationPrice,

            ...(billboard.lessorType.name === PHYSICAL_COMPANY ? {
              identityCard: billboard.identityCard,
              delayContract: billboard.delayContractStart && billboard.delayContractEnd ? {
                from: new Date(billboard.delayContractStart),
                to: new Date(billboard.delayContractEnd)
              } : undefined

            } : {
              capital: new Decimal(billboard.capital || 0),
              rccm: billboard.rccm,
              taxIdentificationNumber: billboard.taxIdentificationNumber,
              niu: billboard.niu,
              legalForms: billboard.legalForms,
              representativeFirstName: billboard.representativeFirstName,
              representativeLastName: billboard.representativeLastName,
              representativeJob: billboard.representativeJob,
              representativePhone: billboard.representativePhone,
              representativeEmail: billboard.representativeEmail,
              rentalStartDate: billboard.rentalStartDate ? new Date(billboard.rentalStartDate) : undefined,
              rentalPeriod: billboard.rentalPeriod,
            }),

            bankName: billboard.bankName,
            rib: billboard.rib,
            iban: billboard.iban,
            bicSwift: billboard.bicSwift,

            paymentMode: billboard.paymentMode ? JSON.parse(billboard.paymentMode) : [],
            paymentFrequency: billboard.paymentFrequency,
            electricitySupply: billboard.electricitySupply,
            specificCondition: billboard.specificCondition,
          } : {
            lessorCustomer: billboard.lessorSupplierId,
          })

        },
      });
    }
  }, [data, form]);

  useEffect(() => {
    form.watch(() => console.log({ errors: form.formState.errors }))
  }, [form.watch])

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.files = null;
      fileInputRef.current.value = "";
    }
  };



  function submit(formData: EditBillboardSchemaFormType) {
    const validateData = editBillboardFormSchema.safeParse(formData);
    if (validateData.success) {

      mutate(
        {
          billboard: {
            id: validateData.data.billboard.id,
            companyId: validateData.data.billboard.companyId,
            reference: validateData.data.billboard.reference,
            hasTax: validateData.data.billboard.hasTax,
            type: validateData.data.billboard.type,
            name: validateData.data.billboard.name,
            locality: validateData.data.billboard.locality,
            area: validateData.data.billboard.area,
            visualMarker: validateData.data.billboard.visualMarker,
            displayBoard: validateData.data.billboard.displayBoard,

            city: validateData.data.billboard.city,
            orientation: validateData.data.billboard.orientation,
            gmaps: validateData.data.billboard.gmaps,

            photos: validateData.data.billboard.photos,
            brochures: validateData.data.billboard.brochures,
            lastPhotos: lastPhotos,
            lastBrochures: lastBrochures,

            rentalPrice: new Decimal(validateData.data.billboard.rentalPrice),
            installationCost: new Decimal(validateData.data.billboard.installationCost || "0"),
            maintenance: new Decimal(validateData.data.billboard.maintenance || "0"),

            width: validateData.data.billboard.width,
            height: validateData.data.billboard.height,
            lighting: validateData.data.billboard.lighting,
            structureType: validateData.data.billboard.structureType,
            panelCondition: validateData.data.billboard.panelCondition,
            decorativeElement: validateData.data.billboard.decorativeElement,
            foundations: validateData.data.billboard.foundations,
            electricity: validateData.data.billboard.electricity,
            framework: validateData.data.billboard.framework,
            note: validateData.data.billboard.note,
          },
          lessor: {
            lessorType: validateData.data.lessor.lessorType,
            lessorSpaceType: validateData.data.lessor.lessorSpaceType,

            ...(validateData.data.lessor.lessorSpaceType === "private" ? {
              lessorName: validateData.data.lessor.lessorName,
              lessorAddress: validateData.data.lessor.lessorAddress,
              lessorCity: validateData.data.lessor.lessorCity,
              lessorPhone: validateData.data.lessor.lessorPhone,
              lessorEmail: validateData.data.lessor.lessorEmail,
              locationPrice: validateData.data.lessor.locationPrice,
              nonLocationPrice: validateData.data.lessor.nonLocationPrice,

              ...(validateData.data.lessor.lessorCity === PHYSICAL_COMPANY ? {
                identityCard: validateData.data.lessor.identityCard,
                delayContract: validateData.data.lessor.delayContract
              } : {
                capital: new Decimal(validateData.data.lessor.capital || 0),
                rccm: validateData.data.lessor.rccm,
                taxIdentificationNumber: validateData.data.lessor.taxIdentificationNumber,
                niu: validateData.data.lessor.niu,
                legalForms: validateData.data.lessor.legalForms,
                representativeFirstName: validateData.data.lessor.representativeFirstName,
                representativeLastName: validateData.data.lessor.representativeLastName,
                representativeJob: validateData.data.lessor.representativeJob,
                representativePhone: validateData.data.lessor.representativePhone,
                representativeEmail: validateData.data.lessor.representativeEmail,

                rentalStartDate: validateData.data.lessor.rentalStartDate ? new Date(validateData.data.lessor.rentalStartDate) : undefined,
                rentalPeriod: validateData.data.lessor.rentalPeriod,
              }
              ),

              bankName: validateData.data.lessor.bankName,
              rib: validateData.data.lessor.rib,
              iban: validateData.data.lessor.iban,
              bicSwift: validateData.data.lessor.bicSwift,

              paymentMode: validateData.data.lessor.paymentMode || [],
              paymentFrequency: validateData.data.lessor.paymentFrequency,
              electricitySupply: validateData.data.lessor.electricitySupply,
              specificCondition: validateData.data.lessor.specificCondition,

            } : {
              lessorCustomer: validateData.data.lessor.lessorCustomer,
            })
          },
        },
        {
          onSuccess() {
            handleReset();
            form.reset();
            mutateBillboard({ id: param.id as string });
          },
        }
      );
    }
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
                content: (
                  <LessorInfoTab
                    form={form}
                  />
                ),
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
