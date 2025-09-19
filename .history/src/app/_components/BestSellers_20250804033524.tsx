import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { db } from "@/lib/prisma";
import { getBestSellers } from "@/server/db/products";

async function BestSellers() {
  const bestSellers = await getBestSellers();
async function seedExtras() {
  await db.extra.createMany({
    data: [
      { name: "CHEESE", price: 5, productId: "ytjuki8" },
      { name: "BACON", price: 7, productId: "ytjuki8" },
      { name: "TOMATO", price: 3, productId: "ytjuki8" },
      { name: "ONION", price: 2, productId: "ytjuki8" },
      { name: "PEPPER", price: 4, productId: "ytjuki8" },
    ],
    skipDuplicates: true, // prevents errors on rerun
  });

  console.log("✅ Extras seeded.");
}

seedExtras()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit();
  })

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
