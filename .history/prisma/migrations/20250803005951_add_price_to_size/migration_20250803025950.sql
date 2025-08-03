/*
  Warnings:

  - Added the required column `price` to the `Size` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Size" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
