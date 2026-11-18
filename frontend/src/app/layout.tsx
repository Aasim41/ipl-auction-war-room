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
  title: "AuctionXI — Official IPL Franchise GM & Tournament Arena",
  description: "Official IPL 2027 Franchise GM Simulator: Mega/Mini Auction War Room, Dual Lineup Strategy, and 74-Match Championship.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#07090f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body className="antialiased w-full h-full min-h-[100dvh] bg-[#07090f] text-slate-100 overflow-x-hidden">
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
