import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from './contexts/AuthContext';
import "./globals.css";
import LayoutWrapper from "./layoutWrapper";
import { LoadingProvider } from "./contexts/LoadingContext";
import Loading from "./components/Loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dirts Garage",
  description: "Garage management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
          <Loading />
        </LoadingProvider>
      </body>
    </html >
  );
}