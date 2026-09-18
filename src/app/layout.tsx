import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/presentation/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Urban Density",
  description:
    "Real-time urban density monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} bg-base text-primary min-h-screen antialiased selection:bg-accent/20 selection:text-accent`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
