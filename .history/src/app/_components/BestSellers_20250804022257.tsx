import MainHeading from "@/components/main-heading";
import Menu fimport { getBestSellers } from '@/server/db/products';
rom "@/components/menu";

async function BestSellers() {
  const bestSellers = await getBestSellers();

  return (
    <section>
      <div className="container">
        <div className="text-center mb-4">
          <MainHeading subTitle="Check out" title="Our Best Sellers" />
        </div>
        <Menu items={bestSellers} />
      </div>
    </section>
  );
}

export default BestSellers;
