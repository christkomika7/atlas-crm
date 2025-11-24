"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  userEditSchema,
  UserEditSchemaType,
} from "@/lib/zod/user.schema";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import { RequestResponse } from "@/types/api.types";
import { getUser, updateUserByCompany } from "@/action/user.action";
import { useEffect, useState } from "react";

import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import ProfileInput from "@/components/ui/profile-input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { ProfileType } from "@/types/user.types";
import { formatPermissions } from "@/lib/permission";
import { resolveImageSrc, urlToFile } from "@/lib/utils";

export default function NewEmployeeEditForm() {
  const param = useParams();
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const form = useForm<UserEditSchemaType>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      dashboard: { create: false, edit: false, read: false },
      clients: { create: false, edit: false, read: false, },
      suppliers: { create: false, edit: false, read: false },
      invoices: { create: false, edit: false, read: false },
      quotes: { create: false, edit: false, read: false },
      deliveryNotes: { create: false, edit: false, read: false },
      creditNotes: { create: false, edit: false, read: false, },
      purchaseOrder: { create: false, edit: false, read: false, },
      productServices: { create: false, edit: false, read: false, },
      billboards: { create: false, edit: false, read: false, },
      projects: { create: false, edit: false, read: false },
      appointment: { create: false, edit: false, read: false, },
      contract: { create: false, edit: false, read: false, },
      transaction: { create: false, edit: false, read: false, },
      setting: { create: false, edit: false, read: false, },
    }
  });

  const { mutate: mutateGetUser, isPending: isGetingUser } = useQueryAction<
    { id: string },
    RequestResponse<ProfileType>
  >(getUser, () => { }, "user");

  const { mutate: mutateUpdateUser, isPending: isUpdatingUser } = useQueryAction<
    { profileId: string, data: UserEditSchemaType },
    RequestResponse<ProfileType>
  >(updateUserByCompany, () => { }, "user");

  useEffect(() => {
    getImage()
  }, [image])

  useEffect(() => {
    if (param.id) {
      initialize()
    }

  }, [param])

  function initialize() {
    mutateGetUser({ id: param.id as string }, {
      onSuccess(data) {
        if (data.data) {
          const profile = data.data;
          setImage(profile.image || "");
          form.reset({
            image: undefined,
            lastname: profile.lastname,
            firstname: profile.firstname,
            email: profile.user.email,
            phone: profile.phone ?? "",
            job: profile.job,
            salary: profile.salary,
            dashboard: { create: false, edit: false, read: false },
            clients: { create: false, edit: false, read: false, },
            suppliers: { create: false, edit: false, read: false },
            invoices: { create: false, edit: false, read: false },
            quotes: { create: false, edit: false, read: false },
            deliveryNotes: { create: false, edit: false, read: false },
            creditNotes: { create: false, edit: false, read: false, },
            purchaseOrder: { create: false, edit: false, read: false, },
            productServices: { create: false, edit: false, read: false, },
            billboards: { create: false, edit: false, read: false, },
            projects: { create: false, edit: false, read: false },
            appointment: { create: false, edit: false, read: false, },
            contract: { create: false, edit: false, read: false, },
            transaction: { create: false, edit: false, read: false, },
            setting: { create: false, edit: false, read: false, },
            ...formatPermissions(profile.permissions)
          })
        }
      }
    })
  }

  async function getImage() {
    if (image) {
      const file = await urlToFile(image);
      const resolveImage = resolveImageSrc(file);
      if (resolveImage) {
        setPreview(resolveImage)
      }
    }
  }


  async function submit(formData: UserEditSchemaType) {
    const { success, data } = userEditSchema.safeParse(formData);
    if (!success) return;
    if (param.id) {
      mutateUpdateUser(
        { profileId: param.id as string, data },
      );
    }
  }

  if (isGetingUser) return <Spinner />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="p-3.5 border border-neutral-100 rounded-xl">
          <div className="space-y-4.5 max-w-xl">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <div className="w-28 h-28">
                      <ProfileInput
                        initialImage={preview}

                        onChange={(file) => field.onChange(file)}
                        label={
                          <Label
                            htmlFor="profile"
                            className="right-2 bottom-2 z-20 absolute flex justify-center items-center"
                          >
                            <span className="flex justify-center items-center bg-blue border-2 border-white rounded-full size-5 text-white">
                              <PlusIcon className="size-4" />
                            </span>
                          </Label>
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Nom"
                      value={field.value}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Prénom"
                      value={field.value}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="email"
                      design="float"
                      label="Adresse mail"
                      value={field.value}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Numéro de téléphone"
                      value={field.value}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="job"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Poste"
                      value={field.value}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Salaire"
                      value={field.value}
                      handleChange={e => field.onChange(String(e))}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Mot de passe"
                      value={field.value ?? ""}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Nouveau mot de passe"
                      value={field.value ?? ""}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-[200px_80px_80px_80px] pb-2">
                <p></p>
                <p className="font-medium text-sm text-center">Créer</p>
                <p className="font-medium text-sm text-center">Modifier</p>
                <p className="font-medium text-sm text-center">Lire</p>
              </div>
              {/* Dashboard */}
              <FormField
                control={form.control}
                name="dashboard"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Dashboard</p>
                        <Controller
                          name="dashboard.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="dashboard.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="dashboard.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Client */}
              <FormField
                control={form.control}
                name="clients"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Client</p>
                        <Controller
                          name="clients.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="clients.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="clients.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Supplier */}
              <FormField
                control={form.control}
                name="suppliers"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Fournisseur</p>
                        <Controller
                          name="suppliers.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="suppliers.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="suppliers.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Invoices */}
              <FormField
                control={form.control}
                name="invoices"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Factures</p>
                        <Controller
                          name="invoices.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="invoices.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="invoices.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Quotes */}
              <FormField
                control={form.control}
                name="quotes"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Devis</p>
                        <Controller
                          name="quotes.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="quotes.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="quotes.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Delivery notes */}
              <FormField
                control={form.control}
                name="deliveryNotes"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Bon de livraison</p>
                        <Controller
                          name="deliveryNotes.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="deliveryNotes.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="deliveryNotes.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Purchase order */}
              <FormField
                control={form.control}
                name="purchaseOrder"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Bons de commande</p>
                        <Controller
                          name="purchaseOrder.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="purchaseOrder.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="purchaseOrder.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Credit notes */}
              <FormField
                control={form.control}
                name="creditNotes"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Avoirs</p>
                        <Controller
                          name="creditNotes.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="creditNotes.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="creditNotes.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Products & Services */}
              <FormField
                control={form.control}
                name="productServices"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">
                          Produits & Services
                        </p>
                        <Controller
                          name="productServices.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="productServices.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="productServices.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Billboards */}
              <FormField
                control={form.control}
                name="billboards"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">
                          Panneaux d'affichage
                        </p>
                        <Controller
                          name="billboards.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="billboards.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="billboards.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Projects */}
              <FormField
                control={form.control}
                name="projects"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Projets</p>
                        <Controller
                          name="projects.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="projects.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="projects.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Appointment */}
              <FormField
                control={form.control}
                name="appointment"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Rendez-vous</p>
                        <Controller
                          name="appointment.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="appointment.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="appointment.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Transactions */}
              <FormField
                control={form.control}
                name="transaction"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Transaction</p>
                        <Controller
                          name="transaction.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="transaction.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="transaction.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Settings */}
              <FormField
                control={form.control}
                name="setting"
                render={() => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <div className="grid grid-cols-[200px_80px_80px_80px]">
                        <p className="font-medium text-sm">Paramètres</p>
                        <Controller
                          name="setting.create"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="setting.edit"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name="setting.read"
                          control={form.control}
                          render={({ field }) => (
                            <div className="flex justify-center">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2 max-w-xl">
          <Button type="submit" variant="primary" className="max-w-sm">
            {isUpdatingUser ? <Spinner /> : "Valider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
