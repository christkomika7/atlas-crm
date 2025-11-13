import Image from "next/image";
import React from "react";

type LogoProps = {
  width?: number;
  height?: number;
};

export default function Logo({
  width = 120,
  height = 87,
}: LogoProps) {
  return (
    <span
      className="flex justify-center items-center relative"
      style={{
        width,
        height,
      }}
    >
      <Image fill alt="Logo" src="/logo.png" className=" w-full h-full object-cover object-center" />
    </span>
  );
}
