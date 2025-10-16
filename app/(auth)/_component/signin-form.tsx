"use client";

import { useForm } from "react-hook-form";
import { signInSchema, SignInSchemaType } from "@/lib/zod/sign-in.schema";
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
import { CadenasIcon, UserIcon } from "@/components/icons";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";

export default function SigninForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function submit(formData: SignInSchemaType) {
    const { success, data } = signInSchema.safeParse(formData);
    if (success) {
      setIsLoading(true);
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        fetchOptions: {
          onSuccess: (data) => {
            toast.success("Connexion réalisé avec succès.");
            router.push("/overview");
            setIsLoading(false);
          },
          onError: (error) => {
            const status = (error as any)?.status;
            if (status === 401) {
              toast.error("Identifiant ou mot de passe incorrect.");
            } else {
              toast.error("Une erreur est survenue, veuillez réessayer.");
            }
            setIsLoading(false);
          },
        },
      });
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-4.5 w-full max-w-[320px]"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="-space-y-1">
              <FormControl>
                <TextInput
                  type="email"
                  icon={<UserIcon />}
                  placeholder="Identifiant"
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
            <FormItem className="-space-y-1">
              <FormControl>
                <TextInput
                  type="password"
                  icon={<CadenasIcon />}
                  placeholder="Mot de passe"
                  value={field.value}
                  handleChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button type="submit" variant="primary">
            {isLoading ? (
              <span className="flex justify-center items-center">
                <Spinner />
              </span>
            ) : (
              "Se connecter"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
