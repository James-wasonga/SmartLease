'use client'

import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import FeaturedProperties from "@/components/FeaturedProperties";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { fetchProperties } from "@/services/request/grapql/landlord";

export default function Home() {

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties().then(j => console.log(j));
  }, []);
  
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <Benefits />
      <FeaturedProperties />
      <Testimonials />
      <Footer />
    </main>
  );
}
