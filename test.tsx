// "use client";
// import { unique, update } from "@/action/invoice.action";
// import useQueryAction from "@/hook/useQueryAction";
// import {
//   invoiceUpdateSchema,
//   InvoiceUpdateSchemaType,
// } from "@/lib/zod/invoice.schema";
// import { RequestResponse } from "@/types/api.types";
// import { InvoiceType } from "@/types/invoice.types";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useDataStore } from "@/stores/data.store";
// import useClientIdStore from "@/stores/client-id.store";
// import { ClientType } from "@/types/client.types";
// import { ProjectType } from "@/types/project.types";
// import useItemStore from "@/stores/item.store";
// import useProjectStore from "@/stores/project.store";
// import { all as getClients, unique as getClient } from "@/action/client.action";
// import { allByClient } from "@/action/project.action";
// import { ModelDocumentType } from "@/types/document.types";
// import { unique as uniqueDocument } from "@/action/document.action";
// import { calculatePrice, downloadFile, formatNumber } from "@/lib/utils";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import Spinner from "@/components/ui/spinner";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// import TextInput from "@/components/ui/text-input";
// import { Badge } from "@/components/ui/badge";
// import ProjectModal from "../../../_component/project-modal";
// import { Combobox } from "@/components/ui/combobox";
// import ItemModal from "../../../create/_component/item-modal";
// import { paymentTerms } from "@/lib/data";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { DownloadIcon, XIcon } from "lucide-react";

// export default function InvoiceTab() {
//   const param = useParams();

//   const currency = useDataStore.use.currency();

//   const clientId = useClientIdStore.use.clientId();
//   const setClientId = useClientIdStore.use.setClientId();
//   const [clientDiscount, setClientDiscount] = useState<{
//     discount: number;
//     discountType: "purcent" | "money";
//   }>({ discount: 0, discountType: "purcent" });
//   const [client, setClient] = useState<ClientType>();

//   const items = useItemStore.use.items();
//   const updateItem = useItemStore.use.updateItem();
//   const updateDiscount = useItemStore.use.updateDiscount();
//   const removeItem = useItemStore.use.removeItem();
//   const clearItem = useItemStore.use.clearItem();
//   const editItemField = useItemStore.use.editItemField();

//   const locationBillboardDate = useItemStore.use.locationBillboardDate();

//   const setProject = useProjectStore.use.setProject();
//   const projects = useProjectStore.use.projects();

//   const [invoiceNumber, setInvoiceNumber] = useState(1);
//   const [hasEditedDiscount, setHasEditedDiscount] = useState(false);

//   const [lastUploadFiles, setLastUploadFiles] = useState<string[]>([]);
//   const [lastUploadPhotos, setLastUploadPhotos] = useState<string[]>([]);

//   const form = useForm<InvoiceUpdateSchemaType>({
//     resolver: zodResolver(invoiceUpdateSchema),
//     defaultValues: {},
//   });

//   const { mutate, isPending, data } = useQueryAction<
//     { id: string },
//     RequestResponse<InvoiceType>
//   >(unique, () => {}, "invoice");

//   const { mutate: updateInvoice, isPending: isPendingInvoice } = useQueryAction<
//     InvoiceUpdateSchemaType,
//     RequestResponse<InvoiceType>
//   >(update, () => {}, "invoice");

//   const {
//     mutate: mutateClients,
//     isPending: isLoadingClients,
//     data: clientsData,
//   } = useQueryAction<{ id: string }, RequestResponse<ClientType[]>>(
//     getClients,
//     unique as getClient,
//     () => {},
//     "clients"
//   );

//   const { mutate: mutateClient } = useQueryAction<
//     { id: string },
//     RequestResponse<ClientType>
//   >(getClient, () => {}, "client");

//   const {
//     mutate: mutateDocument,
//     isPending: isPendingDocument,
//     data: documentData,
//   } = useQueryAction<{ id: string }, RequestResponse<ModelDocumentType<File>>>(
//     uniqueDocument,
//     () => {},
//     "document"
//   );

//   const {
//     mutate: mutateProject,
//     isPending: isLoadingProject,
//     data: projectData,
//   } = useQueryAction<{ clientId: string }, RequestResponse<ProjectType[]>>(
//     allByClient,
//     () => {},
//     "projects"
//   );

//   useEffect(() => {
//     if (param.id) {
//       mutate({ id: param.id as string });
//     }
//   }, [param.id]);

//   useEffect(() => {
//     if (data) {
//       const invoice = data.data as InvoiceType;
//       setLastUploadFiles(invoice.files.filter((file) => Boolean(file)) ?? []);
//       setLastUploadPhotos(
//         invoice.photos.filter((photo) => Boolean(photo)) ?? []
//       );
//       form.reset({
//         id: invoice.id,
//         invoiceNumber: invoice.invoiceNumber,
//         companyId: invoice.companyId,
//         clientId: invoice.clientId,
//         projectId: invoice.projectId,
//         note: invoice.note ?? "",
//         discount: invoice.discount ?? "0",
//         payee: invoice.payee ?? "0",
//         item: {
//           billboards:
//             invoice?.items
//               ?.filter((item) => Boolean(item.billboardId))
//               ?.map((billboard) => ({
//                 id: billboard.id,
//                 name: billboard.name,
//                 quantity: billboard.quantity,
//                 price: billboard.price,
//                 discountType:
//                   billboard.discountType === "purcent" ||
//                   billboard.discountType === "money"
//                     ? billboard.discountType
//                     : undefined,
//                 description: billboard.description ?? undefined,
//                 discount: String(billboard.discount),
//                 billboardId: billboard.id,
//                 currency: billboard.currency,
//               })) ?? [],
//           productServices:
//             invoice?.items
//               ?.filter((item) => Boolean(item.productServiceId))
//               ?.map((productService) => ({
//                 id: productService.id,
//                 name: productService.name,
//                 quantity: productService.quantity,
//                 price: productService.price,
//                 discountType:
//                   productService.discountType === "purcent" ||
//                   productService.discountType === "money"
//                     ? productService.discountType
//                     : undefined,
//                 description: productService.description ?? undefined,
//                 discount: String(productService.discount),
//                 productServiceId: productService.id,
//                 currency: productService.currency,
//               })) ?? [],
//         },
//         totalHT: invoice.totalHT,
//         totalTTC: invoice.totalTTC,
//         discountType:
//           invoice.discountType === "purcent" || invoice.discountType === "money"
//             ? invoice.discountType
//             : undefined,

//         lastUploadFiles: invoice.files.filter((file) => Boolean(file)) ?? [],
//         lastUploadPhotos:
//           invoice.photos.filter((photo) => Boolean(photo)) ?? [],
//       });

//       const formattedItems = invoice.items.map((item) => ({
//         id: item.id,
//         name: item.name,
//         description: item.description ?? "",
//         quantity: item.quantity,
//         price: item.price,
//         discount: String(item.discount ?? "0"),
//         discountType: item.discountType as "purcent" | "money",
//         currency: item.currency,
//         itemType: item.itemType as "billboard" | "product" | "service",
//       }));
//       setItems(formattedItems);

//       setClientId(invoice.clientId);
//       mutateClients({ id: invoice.companyId });
//       mutateDocument({ id: invoice.companyId });
//       setTotalHT(parseFloat(invoice.totalHT));
//       setInvoiceNumber(invoice.invoiceNumber);
//       setClientDiscount((prev) =>
//         prev.discount === 0
//           ? {
//               discount: parseFloat(invoice.discount ?? "0"),
//               discountType:
//                 invoice.discountType === "purcent" ||
//                 invoice.discountType === "money"
//                   ? invoice.discountType
//                   : "purcent",
//             }
//           : prev
//       );
//     }
//   }, [data]);

//   useEffect(() => {
//     if (data && !hasEditedDiscount) {
//       const invoice = data.data as InvoiceType;

//       setClientDiscount({
//         discount: parseFloat(invoice.discount ?? "0"),
//         discountType:
//           invoice.discountType === "purcent" || invoice.discountType === "money"
//             ? invoice.discountType
//             : "purcent",
//       });
//     }
//   }, [data, hasEditedDiscount]);

//   useEffect(() => {
//     if (clientId) {
//       mutateProject({ clientId });
//     }
//   }, [clientId]);

//   useEffect(() => {
//     if (clientsData?.data && clientId) {
//       setClient(clientsData.data.find((c) => c.id === clientId));
//     }
//   }, [clientId, clientsData]);

//   useEffect(() => {
//     if (projectData?.data) {
//       setProject(projectData.data);
//     }
//   }, [projectData]);

//   useEffect(() => {
//     if (items.length > 0) {
//       form.setError("item", { message: "" });
//     }
//     form.setValue("item", {
//       billboards: items
//         .filter((item) => item.itemType === "billboard")
//         .map((item) => ({
//           id: item.id,
//           name: item.name,
//           quantity: item.quantity,
//           price: item.price,
//           discountType: item.discountType,
//           description: item.description,
//           discount: String(item.discount),
//           billboardId: item.id,
//           currency: item.currency,
//         })),
//       productServices: items
//         .filter((item) => item.itemType !== "billboard")
//         .map((item) => ({
//           id: item.id,
//           name: item.name,
//           quantity: item.quantity,
//           price: item.price,
//           discountType: item.discountType,
//           description: item.description,
//           discount: String(item.discount),
//           productServiceId: item.id,
//           currency: item.currency,
//         })),
//     });

//     const HTPrice = items.reduce((sum, item) => {
//       const priceAfterDiscount = calculatePrice(
//         parseFloat(item.price),
//         parseFloat(String(item.discount).replace("%", "")),
//         item.discountType
//       );

//       return sum + (priceAfterDiscount || 0);
//     }, 0);
//     form.setValue("totalHT", String(HTPrice));

//     setTotalHT(HTPrice);
//   }, [items, form]);

//   useEffect(() => {
//     form.setValue(
//       "totalTTC",
//       String(
//         calculatePrice(
//           totalHT,
//           parseFloat(String(clientDiscount.discount).replace("%", "")),
//           clientDiscount.discountType
//         )
//       )
//     );
//     form.setValue("discount", String(clientDiscount.discount));
//     form.setValue("discountType", clientDiscount.discountType);
//   }, [clientDiscount, totalHT]);

//   useEffect(() => {
//     if (client && !hasEditedDiscount) {
//       setClientDiscount({
//         discount: client.discount.includes("%")
//           ? Number(client.discount.split("%")[0])
//           : Number(client.discount),
//         discountType: client.discount.includes("%") ? "purcent" : "money",
//       });
//     }
//   }, [client, hasEditedDiscount]);

//   function removeLastUpload(name: string, type: "file" | "photo") {
//     switch (type) {
//       case "file":
//         setLastUploadFiles((prev) => prev.filter((d) => d !== name));
//         break;
//       case "photo":
//         setLastUploadPhotos((prev) => prev.filter((d) => d !== name));
//         break;
//     }
//   }

//   async function submit(invoiceData: InvoiceUpdateSchemaType) {
//     const { success, data } = invoiceUpdateSchema.safeParse(invoiceData);
//     if (!success) return;
//     updateInvoice(
//       { ...data, lastUploadFiles, lastUploadPhotos },
//       {
//         // mutate({id})
//       }
//     );
//   }

//   if (isPending) return <Spinner />;

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(submit)}
//         className="gap-x-4 space-y-4.5 grid grid-cols-[1.5fr_1fr] m-2"
//       >
//         <div className="space-y-4.5 max-w-lg">
//           <div className="space-y-2">
//             <h2 className="font-semibold">Client</h2>
//             <FormField
//               control={form.control}
//               name="clientId"
//               render={({ field }) => (
//                 <FormItem className="-space-y-2">
//                   <FormControl>
//                     <Combobox
//                       isLoading={isLoadingClients}
//                       datas={
//                         clientsData?.data?.map((client) => ({
//                           id: client.id,
//                           label: `${client.firstname} ${client.lastname}`,
//                           value: client.id,
//                         })) ?? []
//                       }
//                       value={field.value}
//                       setValue={(e) => {
//                         setClientId(e as string);
//                         field.onChange(e);
//                       }}
//                       placeholder="Sélectionner un client"
//                       searchMessage="Rechercher un client"
//                       noResultsMessage="Aucun client trouvé."
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <div className="space-y-2">
//             <h2 className="font-semibold">
//               Article{items.length > 1 && "s"} ({items.length})
//             </h2>
//             <FormField
//               control={form.control}
//               name="item"
//               render={() => (
//                 <FormItem className="-space-y-2">
//                   <FormControl>
//                     <div className="space-y-2">
//                       {items.map((item) => (
//                         <div
//                           className="group relative flex flex-col hover:bg-blue/5 p-1.5 border-blue border-l-4"
//                           key={item.id}
//                         >
//                           <span
//                             className="top-0 right-1 absolute opacity-0 group-hover:opacity-100 font-bold text-red-500 text-sm transition-opacity cursor-pointer"
//                             onClick={() => removeItem(item.id)}
//                           >
//                             ×
//                           </span>

//                           <h2 className="font-semibold text-sm">{item.name}</h2>
//                           {item.description && (
//                             <p className="mb-2 text-sm">{item.description}</p>
//                           )}
//                           <div className="flex justify-between items-center gap-x-2">
//                             <p className="flex items-center gap-x-1 font-medium text-sm">
//                               <span>{item.quantity}</span>x
//                               <span>
//                                 {formatNumber(item.price)} {item.currency}
//                               </span>
//                             </p>
//                             <div className="flex items-center gap-x-2 max-w-[150px]">
//                               <TextInput
//                                 type="number"
//                                 value={
//                                   item.discount != null
//                                     ? String(item.discount).includes("%")
//                                       ? String(item.discount).split("%")[0]
//                                       : String(item.discount)
//                                     : "0"
//                                 }
//                                 className="!rounded-lg h-8"
//                                 handleChange={(e) =>
//                                   updateItem({ ...item, discount: e as string })
//                                 }
//                               />

//                               <ToggleGroup
//                                 type="single"
//                                 value={item.discountType}
//                                 onValueChange={(e) => {
//                                   updateItem({
//                                     ...item,
//                                     discountType: e as "purcent" | "money",
//                                   });
//                                 }}
//                               >
//                                 <ToggleGroupItem value="purcent">
//                                   %
//                                 </ToggleGroupItem>
//                                 <ToggleGroupItem value="money">
//                                   $
//                                 </ToggleGroupItem>
//                               </ToggleGroup>
//                             </div>
//                           </div>
//                           <p className="font-medium text-sm">
//                             Total:{" "}
//                             {formatNumber(
//                               calculatePrice(
//                                 parseFloat(item.price),
//                                 parseFloat(
//                                   String(item.discount).replace("%", "")
//                                 ),
//                                 item.discountType
//                               )
//                             )}{" "}
//                             {item.currency}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="clientId"
//               render={() => (
//                 <FormItem className="-space-y-2">
//                   <FormControl>
//                     <ItemModal />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <div className="space-y-2">
//             <h2 className="font-semibold">Pièce jointe</h2>
//             <div className="gap-x-2 grid grid-cols-2">
//               <FormField
//                 control={form.control}
//                 name="photos"
//                 render={({ field }) => (
//                   <FormItem className="-space-y-2">
//                     <FormControl>
//                       <TextInput
//                         type="file"
//                         multiple={true}
//                         design="float"
//                         label="Photo(s)"
//                         required={false}
//                         value={field.value}
//                         handleChange={field.onChange}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="files"
//                 render={({ field }) => (
//                   <FormItem className="-space-y-2">
//                     <FormControl>
//                       <TextInput
//                         type="file"
//                         multiple={true}
//                         design="float"
//                         label="Document(s)"
//                         required={false}
//                         value={field.value}
//                         handleChange={(e) => {
//                           console.log({ e });
//                           field.onChange(e);
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//             <div className="gap-x-2 grid grid-cols-2">
//               <FormField
//                 control={form.control}
//                 name="lastUploadPhotos"
//                 render={() => (
//                   <FormItem className="-space-y-0.5">
//                     <FormLabel>Liste des photos enregistrées</FormLabel>
//                     <FormControl>
//                       <ScrollArea className="bg-gray p-4 border rounded-md h-[100px]">
//                         <ul className="w-full text-sm">
//                           {lastUploadPhotos.length > 0 ? (
//                             lastUploadPhotos.map((photo, index) => {
//                               return (
//                                 <li
//                                   key={index}
//                                   className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
//                                 >
//                                   {index + 1}. photo.{photo.split(".").pop()}{" "}
//                                   <span className="flex items-center gap-x-2">
//                                     <span
//                                       onClick={() => downloadFile(photo)}
//                                       className="text-blue cursor-pointer"
//                                     >
//                                       <DownloadIcon className="w-4 h-4" />
//                                     </span>{" "}
//                                     <span
//                                       onClick={() =>
//                                         removeLastUpload(photo, "photo")
//                                       }
//                                       className="text-red cursor-pointer"
//                                     >
//                                       <XIcon className="w-4 h-4" />
//                                     </span>{" "}
//                                   </span>
//                                 </li>
//                               );
//                             })
//                           ) : (
//                             <li className="text-sm">Aucun document trouvé.</li>
//                           )}
//                         </ul>
//                       </ScrollArea>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="lastUploadFiles"
//                 render={() => (
//                   <FormItem className="-space-y-0.5">
//                     <FormLabel>Liste des fichiers enregistrés</FormLabel>
//                     <FormControl>
//                       <ScrollArea className="bg-gray p-4 border rounded-md h-[100px]">
//                         <ul className="w-full text-sm">
//                           {lastUploadFiles.length > 0 ? (
//                             lastUploadFiles.map((file, index) => {
//                               return (
//                                 <li
//                                   key={index}
//                                   className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
//                                 >
//                                   {index + 1}. fichier.{file.split(".").pop()}{" "}
//                                   <span className="flex items-center gap-x-2">
//                                     <span
//                                       onClick={() => downloadFile(file)}
//                                       className="text-blue cursor-pointer"
//                                     >
//                                       <DownloadIcon className="w-4 h-4" />
//                                     </span>{" "}
//                                     <span
//                                       onClick={() =>
//                                         removeLastUpload(file, "file")
//                                       }
//                                       className="text-red cursor-pointer"
//                                     >
//                                       <XIcon className="w-4 h-4" />
//                                     </span>{" "}
//                                   </span>
//                                 </li>
//                               );
//                             })
//                           ) : (
//                             <li className="text-sm">Aucun document trouvé.</li>
//                           )}
//                         </ul>
//                       </ScrollArea>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>
//           <div className="space-y-2">
//             <h2 className="font-semibold">Projet</h2>
//             <FormField
//               control={form.control}
//               name="projectId"
//               render={({ field }) => (
//                 <FormItem className="-space-y-2">
//                   <FormControl>
//                     <Combobox
//                       isLoading={isLoadingProject}
//                       datas={projects.map((project) => ({
//                         id: project.id,
//                         label: project.name,
//                         value: project.id,
//                       }))}
//                       value={field.value}
//                       setValue={(e) => {
//                         field.onChange(e);
//                         setSelectedProject(projects.find((p) => p.id === e));
//                       }}
//                       placeholder="Sélectionner un projet"
//                       searchMessage="Rechercher un projet"
//                       noResultsMessage="Aucun projet trouvé."
//                       addElement={<ProjectModal clientId={clientId} />}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <div className="space-y-2">
//             <h2 className="font-semibold">Détails des paiements</h2>
//             <FormField
//               control={form.control}
//               name="note"
//               render={({ field }) => (
//                 <FormItem className="-space-y-2">
//                   <FormControl>
//                     <TextInput
//                       design="text-area"
//                       required={false}
//                       label="Note"
//                       value={field.value}
//                       handleChange={field.onChange}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//         </div>
//         <div className="space-y-4.5 max-w-full">
//           <div className="space-y-2">
//             <div className="flex justify-between gap-x-2">
//               <h2 className="font-semibold">Facture</h2>
//               {isPendingDocument ? (
//                 <Spinner size={10} />
//               ) : (
//                 <p className="font-medium text-sm">
//                   N°: {documentData?.data?.invoicesPrefix}-{invoiceNumber}
//                 </p>
//               )}
//             </div>
//             <Badge variant="secondary" className="px-3 py-2">
//               Non envoyé
//             </Badge>
//           </div>

//           <div className="space-y-2 pb-4 border-neutral-200 border-b">
//             <div className="flex justify-between text-sm">
//               <h2 className="font-semibold">Date</h2>
//               <p>{new Date().toLocaleDateString().replaceAll("/", "-")}</p>
//             </div>
//             <div className="flex justify-between text-sm">
//               <h2>Condition</h2>
//               <p>
//                 {client
//                   ? paymentTerms.find((p) => p.value === client.paymentTerms)
//                       ?.label
//                   : "----"}
//               </p>
//             </div>
//             <div className="flex justify-between text-sm">
//               <h2>Date d’échéance</h2>
//               <p>
//                 {selectedProject?.deadline
//                   ? new Date(selectedProject.deadline)
//                       .toLocaleDateString()
//                       .replaceAll("/", "-")
//                   : "----"}
//               </p>
//             </div>
//           </div>
//           <div className="space-y-2 pb-4 border-neutral-200 border-b">
//             <div className="flex justify-between text-sm">
//               <h2>Total HT</h2>

//               <p>
//                 {items.length > 0 ? (
//                   <>
//                     {formatNumber(
//                       calculatePrice(
//                         totalHT,
//                         parseFloat(
//                           String(clientDiscount.discount).replace("%", "")
//                         ),
//                         clientDiscount.discountType
//                       )
//                     )}
//                   </>
//                 ) : (
//                   0
//                 )}{" "}
//                 {currency}
//               </p>
//             </div>
//             <div className="flex justify-between text-sm">
//               <h2>Réduction</h2>
//               <div className="flex items-center gap-x-2 max-w-[150px]">
//                 <TextInput
//                   type="number"
//                   value={clientDiscount.discount}
//                   className="!rounded-lg h-8"
//                   handleChange={(e) => {
//                     setHasEditedDiscount(true);
//                     setClientDiscount({
//                       ...clientDiscount,
//                       discount: Number(e),
//                     });
//                   }}
//                 />

//                 <ToggleGroup
//                   type="single"
//                   value={clientDiscount.discountType}
//                   onValueChange={(e) => {
//                     setHasEditedDiscount(true);
//                     setClientDiscount({
//                       ...clientDiscount,
//                       discountType: e as "purcent" | "money",
//                     });
//                   }}
//                 >
//                   <ToggleGroupItem value="purcent">%</ToggleGroupItem>
//                   <ToggleGroupItem value="money">$</ToggleGroupItem>
//                 </ToggleGroup>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-2 pb-4 border-neutral-200 border-b">
//             <div className="flex justify-between text-sm">
//               <h2 className="font-semibold">Total TTC</h2>
//               <p>
//                 {items.length > 0 ? (
//                   <>
//                     {formatNumber(
//                       calculatePrice(
//                         totalHT,
//                         parseFloat(
//                           String(clientDiscount.discount).replace("%", "")
//                         ),
//                         clientDiscount.discountType
//                       )
//                     )}
//                   </>
//                 ) : (
//                   0
//                 )}{" "}
//                 {currency}
//               </p>
//             </div>
//             <div className="flex justify-between text-sm">
//               <h2>Avance</h2>
//               <p>0 {currency}</p>
//             </div>
//             <div className="flex justify-between text-sm">
//               <h2>Payer</h2>
//               <p>
//                 {" "}
//                 {items.length > 0 ? (
//                   <>
//                     {formatNumber(
//                       calculatePrice(
//                         totalHT,
//                         parseFloat(
//                           String(clientDiscount.discount).replace("%", "")
//                         ),
//                         clientDiscount.discountType
//                       )
//                     )}
//                   </>
//                 ) : (
//                   0
//                 )}{" "}
//                 {currency}
//               </p>
//             </div>
//           </div>

//           <div className="flex justify-center pt-2">
//             <Button type="submit" variant="primary" className="justify-center">
//               {isPendingInvoice ? <Spinner /> : "Valider"}
//             </Button>
//           </div>
//         </div>
//       </form>
//     </Form>
//   );
// }
