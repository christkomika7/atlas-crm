"use client";
import { create } from "@/action/step.action";
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
import { taskStepSchema, TaskStepSchemaType } from "@/lib/zod/task-step.schema";
import useTaskStore from "@/stores/task.store";
import { RequestResponse } from "@/types/api.types";
import { TaskStepType } from "@/types/step.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type AddTaskStateProps = {
  id: string;
};

export default function AddTaskState({ id }: AddTaskStateProps) {
  const addStep = useTaskStore.use.addStep();
  const form = useForm<TaskStepSchemaType>({
    resolver: zodResolver(taskStepSchema),
    defaultValues: {
      stepName: "",
      check: false,
    },
  });

  useEffect(() => {
    if (id) {
      form.reset({
        taskId: id,
        check: false,
      });
    }
  }, [form, id]);

  const { mutate, isPending } = useQueryAction<
    TaskStepSchemaType,
    RequestResponse<TaskStepType>
  >(create, () => {}, "task-steps");

  const handleButtonClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  async function submit(taskStepData: TaskStepSchemaType) {
    const { success, data } = taskStepSchema.safeParse(taskStepData);
    if (!success) return;
    mutate(
      { ...data, check: false, taskId: id },
      {
        onSuccess(data) {
          if (data.data) {
            addStep(data.data);
            form.reset();
          }
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-0.5 m-2">
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Ajouter une étape</h2>
          <div className="space-y-4.5 max-w-full">
            <FormField
              control={form.control}
              name="stepName"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Nom de l'étape"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleButtonClick}
            onMouseDown={handleButtonClick}
            type="submit"
            variant="primary"
            className="justify-center max-w-xs"
          >
            {isPending ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
