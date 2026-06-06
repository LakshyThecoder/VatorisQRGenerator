import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Code Studio - Premium Permanent & Custom QR Codes",
  description: "Generate beautiful, permanent, non-expiring QR codes with custom styling, logos, gradients, real-world mockups, batch generation, and scanning capabilities. Runs 100% offline.",
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
