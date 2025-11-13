"use client";
import { create, unique, update } from "@/action/step.action";
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
import {
  editTaskStepSchema,
  EditTaskStepSchemaType,
} from "@/lib/zod/task-step.schema";
import useTaskStore from "@/stores/task.store";
import { RequestResponse } from "@/types/api.types";
import { TaskStepType } from "@/types/step.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type EditTaskStateProps = {
  id: string;
  closeModal: () => void
};

export default function EditTaskState({ id, closeModal }: EditTaskStateProps) {
  const updateStep = useTaskStore.use.updateStep();
  const form = useForm<EditTaskStepSchemaType>({
    resolver: zodResolver(editTaskStepSchema),
    defaultValues: {
      stepName: "",
      check: false,
    },
  });

  const {
    mutate: mutateStep,
    isPending: isPendingStep,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<TaskStepType>>(
    unique,
    () => { },
    "task-step"
  );

  const { mutate, isPending } = useQueryAction<
    EditTaskStepSchemaType,
    RequestResponse<TaskStepType>
  >(update, () => { }, "task-steps");

  useEffect(() => {
    if (id) {
      mutateStep({ id });
    }
  }, [id]);

  useEffect(() => {
    if (data?.data) {
      form.reset({
        id: data.data.id,
        taskId: data.data.taskId,
        check: data.data.check,
        stepName: data.data.stepName,
      });
    }
  }, [form, data]);

  const handleButtonClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  async function submit(taskStepData: EditTaskStepSchemaType) {
    const { success, data } = editTaskStepSchema.safeParse(taskStepData);
    if (!success) return;
    mutate(
      { ...data },
      {
        onSuccess(data) {
          if (data.data) {
            updateStep(data.data);
            closeModal()
          }
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-0.5 m-2">
        <div className="space-y-2">
          <h2 className="flex items-center gap-x-1 font-semibold text-sm">
            Ajouter une étape {isPendingStep && <Spinner size={9} />}{" "}
          </h2>
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
                      disabled={isPendingStep}
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
            {isPending ? <Spinner /> : "Valider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
