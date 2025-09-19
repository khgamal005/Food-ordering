import Hero from "./_components/Hero";


export default async function Home() {
  return (
    <main className="container">
      <Hero />
      <BestSeller />
      <About />
    </main>
  );
}
