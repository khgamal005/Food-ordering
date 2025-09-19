import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";
import { db } from "@/lib/prisma";

export default async function Home() {
const extra = await db.Extra.createMany({
  data: [
    { name: "CHEESE", price: 5, productId: "ytjuki8" },
    { name: "BACON", price: 7, productId: "ytjuki8" },
    { name: "TOMATO", price: 3, productId: "ytjuki8" },
    { name: "ONION", price: 2, productId: "ytjuki8" },
    { name: "PEPPER", price: 4, productId: "ytjuki8" },
  ],
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
