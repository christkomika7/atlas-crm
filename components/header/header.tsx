"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../icons";
import Circle from "../ui/circle";

type HeaderProps = {
  title: string;
  back?: string | 1;
  children?: React.ReactNode;
};

export default function Header({ title, back, children }: HeaderProps) {
  const router = useRouter();

  function handleBack() {
    switch (typeof back) {
      case "number":
        router.back();
        break;
      case "string":
        router.push(back);
        break;
      default:
        return;
    }
  }

  return (
    <div className="flex items-center justify-between gap-x-2 px-4 h-18  sticky -top-0.5 left-0 z-40 !w-(--left-sidebar-width) bg-white border-b border-neutral-200">
      <div
        className={clsx(
          "grid w-fit",
          back
            ? "grid-cols-[44px_1fr] gap-x-3 items-center"
            : "grid-cols-1 items-end"
        )}
      >
        {back && (
          <button className="cursor-pointer" onClick={handleBack}>
            <Circle>
              <ArrowLeftIcon className="fill-neutral-600" />
            </Circle>
          </button>
        )}
        <h2 className="font-semibold text-2xl">{title}</h2>
      </div>
      <div className="flex  justify-end items-center">{children}</div>
    </div>
  );
}
