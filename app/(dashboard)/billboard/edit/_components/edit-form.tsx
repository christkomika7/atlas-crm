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

export default function EditForm() {
  const [lastContracts, setLastContracts] = useState<string[]>([]);
  const [lastFiles, setLastFiles] = useState<string[]>([]);
  const [lastPhotos, setLastPhotos] = useState<string[]>([]);
  const [lastBrochures, setLastBrochures] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cityId, setCityId] = useState("");
  const setCurrentSpaceType = useBillboardStore.use.setCurrentSpaceType();


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
      setLastPhotos(billboard.imageFiles);
      setLastBrochures(billboard.brochureFiles);
      setLastContracts(billboard.signedLeaseContract);
      setLastFiles(billboard.files);
      setCityId(billboard.cityId);
      setCurrentSpaceType(billboard.lessorSpaceType as "private" | "public");
      form.reset({
        billboard: {
          id: billboard.id,
          companyId: billboard.companyId,
          reference: billboard.reference,
          type: billboard.typeId,
          name: billboard.name,
          dimension: billboard.dimension,
          city: billboard.cityId,
          area: billboard.areaId,
          placement: billboard.placement,
          orientation: billboard.orientation,
          information: billboard.information,
          address: billboard.address,
          gmaps: billboard.gmaps,
          zone: billboard.zone,
          rentalPrice: new Decimal(billboard.rentalPrice),
          installationCost: billboard.installationCost,
          maintenance: billboard.maintenance,
          imageFiles: undefined,
          lastImageFiles: billboard.imageFiles,
          brochureFiles: undefined,
          lastBrochureFiles: billboard.brochureFiles,
          structure: billboard.structure,
          decorativeElement: billboard.decorativeElement,
          foundations: billboard.foundations,
          technicalVisibility: billboard.technicalVisibility,
          note: billboard.note,
        },
        lessor: {
          lessorType: billboard.lessorType,
          lessorSpaceType: billboard.lessorSpaceType,
          ...(billboard.lessorSpaceType === 'private' ? {
            lessorName: billboard.lessorName,
            lessorEmail: billboard.lessorEmail,
            lessorJob: billboard.lessorJob,
            lessorPhone: billboard.lessorPhone,
            capital: billboard.capital,
            rccm: billboard.rccm,
            taxIdentificationNumber: billboard.taxIdentificationNumber,
            lessorAddress: billboard.lessorAddress,
            representativeName: billboard.representativeName,
            representativeContract: billboard.representativeContract,
            leasedSpace: billboard.leasedSpace,
            contractDuration: billboard.contractDuration
              ? {
                from: billboard.contractDuration[0]
                  ? new Date(billboard.contractDuration[0])
                  : undefined,
                to: billboard.contractDuration[1]
                  ? new Date(billboard.contractDuration[1])
                  : undefined,
              }
              : undefined,
            paymentMethod: billboard.paymentMethod,
            specificCondition: billboard.specificCondition,
            lastSignedLeaseContract: billboard.signedLeaseContract,
            lastFiles: billboard.files,
            signedLeaseContract: undefined,
            files: undefined,
          } : {
            lessorCustomer: billboard.lessorSupplierId
          })

        },
      });
    }
  }, [data, form]);

  useEffect(() => {
    form.watch(() => {
      console.log({ errors: form.formState.errors });
    })
  }, [form.watch]);

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
            type: validateData.data.billboard.type,
            name: validateData.data.billboard.name,
            dimension: validateData.data.billboard.dimension,
            placement: validateData.data.billboard.placement,
            city: validateData.data.billboard.city,
            area: validateData.data.billboard.area,
            orientation: validateData.data.billboard.orientation,
            information: validateData.data.billboard.information,
            address: validateData.data.billboard.address,
            gmaps: validateData.data.billboard.gmaps,
            zone: validateData.data.billboard.zone,
            rentalPrice: validateData.data.billboard.rentalPrice,
            locationDuration: validateData.data.billboard.locationDuration,
            installationCost: validateData.data.billboard.installationCost,
            maintenance: validateData.data.billboard.maintenance,
            imageFiles: validateData.data.billboard.imageFiles,
            lastImageFiles: lastPhotos,
            brochureFiles: validateData.data.billboard.brochureFiles,
            lastBrochureFiles: lastBrochures,
            structure: validateData.data.billboard.structure,
            decorativeElement: validateData.data.billboard.decorativeElement,
            foundations: validateData.data.billboard.foundations,
            technicalVisibility:
              validateData.data.billboard.technicalVisibility,
            note: validateData.data.billboard.note,
          },
          lessor: {
            lessorType: validateData.data.lessor.lessorType,
            lessorSpaceType: validateData.data.lessor.lessorSpaceType,
            ...(validateData.data.lessor.lessorSpaceType === "private" ? {

              lessorName: validateData.data.lessor.lessorName,
              lessorJob: validateData.data.lessor.lessorJob,
              lessorEmail: validateData.data.lessor.lessorEmail,
              lessorPhone: validateData.data.lessor.lessorPhone,

              capital: validateData.data.lessor.capital,
              rccm: validateData.data.lessor.rccm,
              taxIdentificationNumber:
                validateData.data.lessor.taxIdentificationNumber,
              lessorAddress: validateData.data.lessor.lessorAddress,
              representativeName: validateData.data.lessor.representativeName,
              representativeContract:
                validateData.data.lessor.representativeContract,
              leasedSpace: validateData.data.lessor.leasedSpace,
              contractDuration:
                validateData.data.lessor?.contractDuration ?? undefined,
              paymentMethod: validateData.data.lessor.paymentMethod,
              specificCondition: validateData.data.lessor.specificCondition,
              lastSignedLeaseContract: lastContracts,
              lastFiles: lastFiles,
              signedLeaseContract: validateData.data.lessor.signedLeaseContract,
              files: validateData.data.lessor.files,

            } : {
              lessorCustomer: validateData.data.lessor.lessorCustomer
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
                  />
                ),
              },
              {
                id: 2,
                title: "Infos bailleur",
                content: (
                  <LessorInfoTab
                    form={form}
                    setLastContracts={setLastContracts}
                    setLastFiles={setLastFiles}
                    lastContracts={lastContracts}
                    lastFiles={lastFiles}
                    ref={fileInputRef}
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
