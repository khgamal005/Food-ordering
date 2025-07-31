import Header from "@/components/header";
import Hero from "./_components/Hero";
import BestSellers from "./_components/BestSellers";

export default async function Home() {
  const products = await d.product.findMany(); // Fix: method should be on the model (e.g. db.product)
  console.log("products", products);

  return (
    <main className="container">
      <Header />
      <Hero />
      {/* You can pass `products` as props to BestSellers if needed */}
      {/* <BestSellers products={products} /> */}
    </main>
  );
}
