import localFont from "next/font/local";

export const generalSans = localFont({
  src: [
    {
      path: "./GeneralSans-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./GeneralSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./GeneralSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./GeneralSans-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./GeneralSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});
