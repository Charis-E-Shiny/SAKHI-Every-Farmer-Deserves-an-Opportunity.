// /farmer — farmer home dashboard.
import type { Metadata } from "next";
import { FarmerDashboard } from "@/components/farmer/dashboard";

export const metadata: Metadata = { title: "Home" };

/** Farmer dashboard. */
export default function FarmerHome() {
  return <FarmerDashboard />;
}
