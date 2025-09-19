import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { db } from "@/lib/prisma";

async function BestSellers() {
  const bestSellers = await getBestSellers(3);

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
