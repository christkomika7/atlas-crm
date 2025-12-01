"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import AddTaskForm from "./add-task-form";
import EditTaskForm from "./edit-task-form";
import TaskInfo from "./task-info";

type TaskModalProps = {
  children: React.ReactNode;
  title: string;
  type: "create" | "update" | "info";
  id?: string;
  projectId: string;
};
export default function TaskModal({
  children,
  title,
  type,
  id,
  projectId
}: TaskModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="min-w-[950px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {type === "create" && <AddTaskForm closeModal={setOpen} projectId={projectId} />}
        {type === "update" && id && (
          <EditTaskForm closeModal={setOpen} id={id as string} projectId={projectId} />
        )}
        {type === "info" && id && (
          <TaskInfo closeModal={setOpen} id={id as string} />
        )}
      </DialogContent>
    </Dialog>
  );
}
