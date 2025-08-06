import { cache } from "@/lib/cache";
import { db } from "@/lib/prisma";


export const getBestSellers = cach()=>{

  const bestSellers = await db.product.findMany({
    include: {
      sizes: true,
      extras: true,
    },
  });
  return bestSellers;
}
// export const getProducts = cache(
//   () => {
//     const products = db.product.findMany({
//       orderBy: {
//         order: "asc",
//       },
//     });
//     return products;
//   },
//   ["products"],
//   { revalidate: 3600 }
// );

// export const getProduct = cache(
//   (id: string) => {
//     const product = db.product.findUnique({
//       where: {
//         id,
//       },
//       include: {
//         sizes: true,
//         extras: true,
//       },
//     });
//     return product;
//   },
//   [`product-${crypto.randomUUID()}`],
//   { revalidate: 3600 }
// );
