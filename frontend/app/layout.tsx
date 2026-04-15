import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

export const metadata: Metadata = {
  title: "FalconAI Dashboard",
  description: "Admin dashboard for FalconAI cold email backend"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen md:flex">
          <Sidebar />
          <div className="flex-1">
            <TopNavbar />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
