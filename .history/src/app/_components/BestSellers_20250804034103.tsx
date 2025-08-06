import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { db } from "@/lib/prisma";
import { getBestSellers } from "@/server/db/products";

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
async function seedExtrasOnce() {
  const existing = await db.extra.findFirst();
  if (existing) return; // Extras already exist — skip

  const product = await db.product.findFirst();
  if (!product) return; // No products available — skip

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