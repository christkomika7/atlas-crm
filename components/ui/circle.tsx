import clsx, { ClassValue } from "clsx";

type CircleProps = {
  size?: number;
  className?: ClassValue;
  children: React.ReactNode;
};

export default function Circle({
  children,
  size = 20,
  className,
}: CircleProps) {
  return (
    <div
      className={clsx(
        "flex justify-center items-center border border-neutral-200 rounded-full size-11.5",
        className
      )}
    >
      <span
        className="flex"
        style={{
          width: size,
          height: size,
        }}
      >
        {children}
      </span>
    </div>
  );
}
