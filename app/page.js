import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GreatSeperator from "@/components/GreatSeperator";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* <GreatSeperator/> */}
      <Hero />
    </div>
  );
}