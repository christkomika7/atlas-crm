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
import TextInput from "@/components/ui/text-input";
import { userSchema, UserSchemaType } from "@/lib/zod/user.schema";
import { Checkbox } from "@/components/ui/checkbox";
import ProfileInput from "@/components/ui/profile-input";
import { PlusIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useEmployeeStore } from "@/stores/employee.store";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { hasEmail } from "@/action/user.action";
import Spinner from "@/components/ui/spinner";
import { setFile } from "@/lib/file-storage";

export default function CreateEmployeeForm() {
  const [resetKey, setResetKey] = useState(0);
  const addEmployee = useEmployeeStore.use.addEmployee();
  const emailExist = useEmployeeStore.use.emailExists();

  const form = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      image: undefined,
      lastname: "",
      firstname: "",
      email: "",
      phone: "",
      job: "",
      salary: "",
      password: "",
      dashboard: { create: false, edit: false, read: false },
      clients: { create: false, edit: false, read: false },
      suppliers: { create: false, edit: false, read: false },
      invoices: { create: false, edit: false, read: false },
      quotes: { create: false, edit: false, read: false },
      deliveryNotes: { create: false, edit: false, read: false },
      purchaseOrder: { create: false, edit: false, read: false },
      creditNotes: { create: false, edit: false, read: false },
      productServices: { create: false, edit: false, read: false },
      billboards: { create: false, edit: false, read: false },
      projects: { create: false, edit: false, read: false },
      appointment: { create: false, edit: false, read: false },
      transaction: { create: false, edit: false, read: false },
      setting: { create: false, edit: false, read: false },
    },
  });

  const { mutate, isPending } = useQueryAction<
    { id: string; email: string },
    RequestResponse<undefined>
  >(hasEmail, () => { }, "employee");

  async function submit(userData: UserSchemaType) {
    const { success, data } = userSchema.safeParse(userData);
    if (!success) return;

    const path = `${crypto.randomUUID()}_${data.firstname}_${data.lastname
      }`.toLowerCase();

    const newUser = {
      ...data,
      path,
    };

    mutate(
      { id: "", email: data.email },
      {
        async onSuccess() {
          const isExist = emailExist(data.email);
          if (isExist) return toast.error("Cet adresse mail est déjà utilisé.");
          if (newUser.image) {
            await setFile(newUser.email, {
              type: "profile",
              file: newUser.image,
            });
          }
          addEmployee({ ...newUser });
          toast.success("Employé ajouté avec succès.");
          form.reset({});
          setResetKey((prev) => prev + 1);
        },
      }
    );
  }

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
                        onChange={(file) => field.onChange(file)}
                        resetKey={resetKey}
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
                      type="number"
                      design="float"
                      label="Salaire"
                      value={field.value}
                      handleChange={field.onChange}
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
                      value={field.value}
                      handleChange={field.onChange}
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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
          <Button
            type="submit"
            variant="primary"
            className="justify-center max-w-sm"
          >
            {isPending ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
