import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./onboarding-3d.css";
import "./navbar-radio.css";
import "./auction-ui.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Navbar } from "../components/Navbar";
import { AmbientBackground } from "../components/AmbientBackground";
import { CapacitorDeviceManager } from "../components/CapacitorDeviceManager";
import { GlobalSwipeManager } from "../components/GlobalSwipeManager";

export const metadata: Metadata = {
  title: "IPL GM: War Room — Franchise Simulator & Auction Arena",
  description: "Elite IPL T20 Franchise GM War Room: Mega & Mini Auction, Dual Lineup Strategy, and 74-Match Championship.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#030c06",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body className="antialiased w-full h-full min-h-[100dvh] bg-[#030c06] text-slate-100 overflow-x-hidden">
        <ThemeProvider>
          <CapacitorDeviceManager />
          <AmbientBackground />
          <Navbar />
          <GlobalSwipeManager />
          <main className="w-full min-h-[100dvh] flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
