"use client";

import EmployeeCard from "./employee-card";
import AddEmployee from "./add-employee";
import { useEmployeeStore } from "@/stores/employee.store";
import { UserSchemaType } from "@/lib/zod/user.schema";
import { useEffect } from "react";

type EmployeePanelProps = {
  handleChange: (employees: UserSchemaType[]) => void;
};

export default function EmployeePanel({ handleChange }: EmployeePanelProps) {
  const { employees } = useEmployeeStore();

  useEffect(() => {
    const newEmployees: UserSchemaType[] = employees;
    handleChange(newEmployees);
  }, [employees]);

  return (
    <div className="flex flex-wrap items-center gap-6">
      {employees.map((employee, index) => (
        <EmployeeCard
          key={index}
          id={index}
          name={employee.firstname + " " + employee.lastname}
          imageKey={employee.email}
        />
      ))}
      <AddEmployee />
    </div>
  );
}
