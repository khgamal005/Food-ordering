import MainHeading from '@/components/main-heading';
import Menu from '@/components/menu';
import { db } from '@/lib/prisma';

async function BestSellers() {
  const products = await db.product.findMany();

  return (
    <section>
      <div className="container">
        <div className="text-center mb-4">
          <MainHeading
            subTitle="Check out"
            title="Our Best Sellers"
          />
        </div>
        <Menu items={products} />
      </div>
    </section>
  );
}

export default BestSellers;

