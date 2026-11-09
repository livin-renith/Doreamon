import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOREAMON — Enter a World Where Creatures Come Alive",
  description:
    "An immersive world of curious creatures, magical places, and stories waiting to be discovered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col selection:bg-sky-200 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
