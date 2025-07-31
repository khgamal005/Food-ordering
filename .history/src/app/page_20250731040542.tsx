import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";

export default function async Home() {
  return (
    <main className="container">
      const  products  = await db.findmany({
        console.log("products", products);
      });
      <Header />
      <Hero />
      {/* <BestSellers /> */}
    </main>
  );
}
