import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";

export default function Home() {
  return (
    <main className="container">
      const  products  = await getProducts();
      <Header />
      <Hero />
      {/* <BestSellers /> */}
    </main>
  );
}
