import clsx, { ClassValue } from "clsx";

type EmployeeListProps = {
  children: React.ReactNode;
  value: string | React.ReactNode;
  className?: ClassValue;
};

export default function EmployeeList({
  children,
  value,
  className,
}: EmployeeListProps) {
  return (
    <div
      className={clsx(
        "flex justify-between items-center py-3 border-neutral-100 border-b",
        className
      )}
    >
      <div className="font-medium text-sm">{children}</div>
      <div className="text-neutral-500 text-sm">{value}</div>
    </div>
  );
}
