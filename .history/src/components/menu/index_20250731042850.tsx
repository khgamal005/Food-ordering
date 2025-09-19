import getTrans from '@/lib/translation';
import { getCurrentLocale } from '@/lib/getCurrentLocale';
import MenuItem from './MenuItem';

async function Menu({ items }: { items: [] }) {
  const locale = await getCurrentLocale();
  const { noProductsFound } = await getTrans(locale);
  return items.length > 0 ? (
    <ul className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {items.map((item) => (
        <MenuItem item={item} />
      ))}
    </ul>
  ) : (
    <p className='text-accent text-center'>{noProductsFound}</p>
  );
}

export default Menu;
