import React from "react";

type ShowValueProps = {
  title: string;
  value: string;
};

export default function ShowValue({ title, value }: ShowValueProps) {
  return (
    <div className="bg-gray px-4 py-2 rounded-lg">
      <h2 className="font-semibold text-sm">{title}</h2>
      <p className="font-medium text-xs">{value}</p>
    </div>
  );
}
