"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/formatters";
import { Extra, Size } from "@prisma/client";
import { ProductWithRelations } from "@/types/product";

function AddToCartButton({ item }: { item: ProductWithRelations }) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [quantity, setQuantity] = useState(1);

  const base = item.basePrice || 0;
  const sizePrice = selectedSize?.price || 0;
  const extrasPrice = selectedExtras.reduce((total, extra) => total + extra.price, 0);
  const totalPrice = (base + sizePrice + extrasPrice) * quantity;

  const handleExtraToggle = (extra: Extra) => {
    if (selectedExtras.find(e => e.id === extra.id)) {
      setSelectedExtras(prev => prev.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras(prev => [...prev, extra]);
    }
  };

  const handleConfirm = () => {
    console.log("Add to cart:", {
      product: item.name,
      size: selectedSize,
      extras: selectedExtras,
      quantity,
      totalPrice,
    });
    // Call API or toast here
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4 text-white rounded-full !px-8">Add To Cart</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center">
          <Image src={item.image} alt={item.name} width={200} height={200} />
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription className="text-center">
            {item.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-10">
          {/* Sizes */}
          <div className="space-y-4 text-center">
            <Label>Pick your size</Label>
            <RadioGroup>
              {item.sizes.map(size => (
                <div
                  key={size.id}
                  className="flex items-center space-x-2 border border-gray-100 rounded-md p-4"
                >
                  <RadioGroupItem
                    value={size.name}
                    checked={selectedSize?.id === size.id}
                    onClic

