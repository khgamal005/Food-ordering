import getTrans from '@/lib/translation';
import { getCurrentLocale } from '@/lib/getCurrentLocale';
import MenuItem from './MenuItem';
import { ProductWithRelations } from '@/types/product';

async function Menu({ items }: { items: ProductWithRelations[] }) {
  const locale = await getCurrentLocale();
  const { noProductsFound } = await getTrans(locale);

  if (items.length === 0) {
    return <p className="text-accent text-center">{noProductsFound}</p>;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

export default Menu;
