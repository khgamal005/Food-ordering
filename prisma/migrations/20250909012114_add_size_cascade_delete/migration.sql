-- DropForeignKey
ALTER TABLE "public"."Size" DROP CONSTRAINT "Size_productId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Size" ADD CONSTRAINT "Size_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
