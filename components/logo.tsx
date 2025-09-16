import Image from "next/image";
import React from "react";
import { LogoIcon } from "./icons";
import clsx from "clsx";

type LogoProps = {
  color?: "white" | "black";
  width?: number;
  height?: number;
};

export default function Logo({
  color = "black",
  width = 120,
  height = 87,
}: LogoProps) {
  return (
    <span
      className="flex justify-center items-center"
      style={{
        width,
        height,
      }}
    >
      <LogoIcon
        className={clsx(color === "white" ? "fill-white" : "fill-black")}
      />
    </span>
  );
}
