import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";
import { db } from "@/lib/prisma";

export default async function Home() {
const size = await db.size.createMany({
  data: [
    {name: "CHEESE" ,productId: "ytjuki8"},          // This should match your `ProductSizes` enum value
    {name :"onion", productId: "ytjuki8"}  // Make sure this ID exists in your Product table
  ]
});

console.log("Created size:", size);

  return (
    <main className="container">
      <Header />
      <Hero />
      {/* You can pass `products` as props to BestSellers if needed */}
      <BestSellers />
    </main>
  );
}
