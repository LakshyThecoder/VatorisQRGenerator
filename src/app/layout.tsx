import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valtoris - Premium Permanent & Custom QR Codes",
  description: "Generate beautiful, permanent, non-expiring QR codes with Valtoris. Fully custom styling, logos, gradients, mockups, batch generation, and scanning. 100% offline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
