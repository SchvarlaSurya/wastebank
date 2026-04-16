import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "WasteBank - Pickup Sampah Terpilah",
  description: "Setor sampah terpilah dari rumah dan dapatkan reward secara transparan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          {children}
          <Toaster 
            position="bottom-center"
            toastOptions={{
              className: 'rounded-xl border border-stone-200 px-4 py-3 shadow-lg font-sans bg-white text-stone-900',
              descriptionClassName: 'text-stone-500 text-sm'
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}
