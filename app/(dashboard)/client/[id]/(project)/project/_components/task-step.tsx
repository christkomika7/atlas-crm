import { all, check, remove } from "@/action/step.action";
import PopoverContainer from "@/components/modal/popover-container";
import { Button } from "@/components/ui/button";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { TaskStepType } from "@/types/step.type";
import { EditIcon, PlusIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddTaskState from "./add-task-state";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/ui/spinner";
import { cn, sanitize } from "@/lib/utils";
import useTaskStore from "@/stores/task.store";
import EditTaskState from "./edit-task-state";

type TaskStepProps = {
  id: string;
};

export default function TaskStep({ id }: TaskStepProps) {
  const steps = useTaskStore.use.step();
  const removeStep = useTaskStore.use.removeStep();
  const updateStep = useTaskStore.use.updateStep();
  const [stepData, setStepData] = useState<TaskStepType[] | null>(null);

  const { mutate: mutateRemove, isPending: isPendingRemove } = useQueryAction<
    { id: string },
    RequestResponse<TaskStepType>
  >(remove, () => {}, "task-steps");

  const { mutate: mutateCheck, isPending: isPendingCheck } = useQueryAction<
    { id: string; check: boolean },
    RequestResponse<TaskStepType>
  >(check, () => {}, "task-steps");

  useEffect(() => {
    if (id) {
      setStepData(steps.filter((s) => s.taskId === id));
    }
  }, [steps, id]);

  const handleButtonClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  function removeTaskStep(id: string) {
    mutateRemove(
      { id },
      {
        onSuccess(data) {
          if (data.data) {
            removeStep(data.data.id);
          }
        },
      }
    );
  }

  function updateCheck(id: string, check: boolean) {
    mutateCheck(
      { id, check },
      {
        onSuccess(data) {
          if (data.data) {
            updateStep(data.data);
          }
        },
      }
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-x-2">
        <div className="flex items-center gap-x-1 font-semibold text-xs">
          <span>Étape(s)</span>{" "}
          {(isPendingCheck || isPendingRemove) && <Spinner size={10} />}
        </div>
        <PopoverContainer
          actionButton={
            <Button
              onClick={handleButtonClick}
              onMouseDown={handleButtonClick}
              variant="outline"
              className="shadow-none w-fit size-6 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          }
        >
          <AddTaskState id={id} />
        </PopoverContainer>
      </div>

      <div className="space-y-1">
        {stepData && stepData?.length > 0 ? (
          stepData.map((step) => (
            <div
              key={step.id}
              className="flex justify-between items-center gap-x-2"
            >
              <label
                htmlFor={sanitize(step.stepName)}
                className="flex items-center gap-x-2 font-medium text-sm"
              >
                <Checkbox
                  onClick={handleButtonClick}
                  onMouseDown={handleButtonClick}
                  defaultChecked={step.check}
                  id={sanitize(step.stepName)}
                  className="size-4"
                  onCheckedChange={(e) => {
                    updateCheck(step.id, Boolean(e));
                  }}
                />
                <span
                  className={cn(step.check && "line-through text-gray-500")}
                >
                  {step.stepName}
                </span>
              </label>
              <div className="flex items-center gap-x-2">
                <PopoverContainer
                  actionButton={
                    <span
                      onClick={handleButtonClick}
                      onMouseDown={handleButtonClick}
                      className="cursor-pointer"
                    >
                      <EditIcon className="w-3.5 h-3.5 text-blue" />
                    </span>
                  }
                >
                  <EditTaskState id={step.id} />
                </PopoverContainer>

                <span
                  onMouseDown={handleButtonClick}
                  onClick={(e) => {
                    handleButtonClick(e);
                    removeTaskStep(step.id);
                  }}
                  className="cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5 text-red" />
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-neutral-600">Aucune étape ajooutée</p>
        )}
      </div>
    </div>
  );
}
