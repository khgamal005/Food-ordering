import MainHeading from '@/components/main-heading';
import Menu from '@/components/menu';
import { getCurrentLocale } from '@/lib/getCurrentLocale';
import getTrans from '@/lib/translation';
// import { getBestSellers } from '@/server/db/products';

async function BestSellers() {

  return (
    <section>
      <div className='container'>
        <div className='text-center mb-4'>
          {/* <MainHeading
            subTitle={bestSeller.checkOut}
            title={bestSeller.OurBestSellers}
          /> */}
        </div>
        <Menu items={bestSellers} />
      </div>
    </section>
  );
}

export default BestSellers;
