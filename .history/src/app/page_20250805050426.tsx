import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";

export default async function Home() {



  return (
    <main className="container">
      <Header />
      <Hero />
      <BestSellers />
            <About />

    </main>
  );
}
