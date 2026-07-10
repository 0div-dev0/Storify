import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GreatSeperator from "@/components/GreatSeperator";

export default function DashboardPage() {

  return(
    <>
    <Navbar/>
    {/* <GreatSeperator/> */}
    <Hero/>

    </>
  );
    
}