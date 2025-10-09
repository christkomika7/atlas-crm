import { email } from "@/action/billboard.action";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { emailSchema, EmailSchemaType } from "@/lib/zod/email.schema";
import { useDataStore } from "@/stores/data.store";
import usePdfStore from "@/stores/pdf.store";
import { RequestResponse } from "@/types/api.types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

type BillboardSendEmailFormProps = {
  close: () => void;
};

export default function BillboardSendEmailForm({
  close,
}: BillboardSendEmailFormProps) {
  const pdf = usePdfStore.use.pdf();
  const companyId = useDataStore.use.currentCompany();

  const form = useForm<EmailSchemaType>({
    resolver: zodResolver(emailSchema),
    defaultValues: {},
  });

  const { mutate, isPending } = useQueryAction<
    EmailSchemaType,
    RequestResponse<string>
  >(email, () => { }, "email");

  useEffect(() => {
    if (pdf && companyId) {
      form.reset({
        contract: pdf,
        companyId,
      });
    }
  }, [form, pdf, companyId]);

  async function submit(emailData: EmailSchemaType) {
    const { success, data } = emailSchema.safeParse(emailData);
    if (!success) return;
    mutate(data, {
      onSuccess() {
        close();
      },
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="space-y-4.5 max-w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    design="float"
                    label="Adress mail"
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
            name="message"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    required={false}
                    design="text-area"
                    label="Message"
                    value={field.value}
                    handleChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center gap-x-2 pt-2">
          <Button
            disabled={isPending}
            variant="primary"
            className="justify-center max-w-xs"
          >
            {isPending ? <Spinner /> : "Envoyer via email"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
