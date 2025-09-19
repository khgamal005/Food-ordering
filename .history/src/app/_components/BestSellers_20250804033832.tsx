import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { db } from "@/lib/prisma";
import { getBestSellers } from "@/server/db/products";

async function BestSellers() {
  const bestSellers = await getBestSellers();
const product = await db.product.findFirst();

if (product) {
  await db.extra.createMany({
    data: [
      { name: "CHEESE", price: 5, productId: product.id },
      { name: "BACON", price: 7, productId: product.id },
      { name: "TOMATO", price: 3, productId: product.id },
      { name: "ONION", price: 2, productId: product.id },
      { name: "PEPPER", price: 4, productId: product.id },
    ],
    skipDuplicates: true,
  });
}



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
