import type { Metadata } from "next";
import { generalSans } from "../fonts/font";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import TanstackProvider from "@/config/tanstack-provider";

export const metadata: Metadata = {
  title: "Atlas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${generalSans.className} antialiased overflow-hidden`}>
        <TanstackProvider>
          <Toaster />
          {children}
        </TanstackProvider>
      </body>
    </html>
  );
}
