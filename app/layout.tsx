import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from './contexts/AuthContext';
import "./globals.css";
import LayoutWrapper from "./layoutWrapper";
import { LoadingProvider } from "./contexts/LoadingContext";
import Loading from "./components/Loading";

export const viewport: Viewport = {
  themeColor: 'oklch(27.9% 0.041 260.031)',
}


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dirt's Garage",
  description: "Dirt's Garage management system",
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