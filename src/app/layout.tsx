import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import KBar from "@/components/kbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Normal Human",
  description: "One Place for all your emails",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <ThemeProvider 
          attribute={'class'}
          defaultTheme={'system'}
          enableSystem
          disableTransitionOnChange>
            <KBar>
            {children}
            <Toaster richColors={true}></Toaster>
            </KBar>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
