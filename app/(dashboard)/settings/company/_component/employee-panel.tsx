"use client";

import EmployeeCard from "./employee-card";
import AddEmployee from "./add-employee";
import { useEmployeeStore } from "@/stores/employee.store";

export default function EmployeePanel() {
  const employees = useEmployeeStore.use.employees();


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
