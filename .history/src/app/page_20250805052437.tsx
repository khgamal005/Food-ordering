import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";
import About from "@/components/about";

export default async function Home() {
  return (
    <main className="container">
      <Hero />
      <BestSellers />
      <About />
    </main>
  );
}
