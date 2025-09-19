import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";
import { db } from "@/lib/prisma";

export default async function Home() {
  const size = await db.size.create({
    data: {
      name: "small",
      console.log("products", products);
    });

  return (
    <main className="container">
      <Header />
      <Hero />
      {/* You can pass `products` as props to BestSellers if needed */}
      <BestSellers />
    </main>
  );
}
