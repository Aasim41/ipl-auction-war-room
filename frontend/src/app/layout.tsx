import type { Metadata } from "next";
import "./globals.css";
import "./onboarding-3d.css";
import "./navbar-radio.css";
import "./auction-ui.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Navbar } from "../components/Navbar";
import { AmbientBackground } from "../components/AmbientBackground";
import { CapacitorDeviceManager } from "../components/CapacitorDeviceManager";

export const metadata: Metadata = {
  title: "IPLMetrics — IPL Analytics & Auction Simulator",
  description: "Build squads with linear programming. Simulate live auctions. Analyze 357+ players. Dominate the mega auction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <CapacitorDeviceManager />
          <AmbientBackground />
          <Navbar />
          <main className="min-h-screen relative z-0">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
