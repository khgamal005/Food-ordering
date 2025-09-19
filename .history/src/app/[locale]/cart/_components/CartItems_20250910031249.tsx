"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { deliveryFee, getSubTotal } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { removeItemFromCart, selectCartItems } from "@/redux/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Trash2 } from "lucide-react";
import Image from "next/image";

function CartItems() {
  const cart = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const subTotal = getSubTotal(cart);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cartItems", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  if (!mounted) {
    // Avoid SSR mismatch: render nothing or a skeleton
    return null;
  }

  return (
    <div>
      {cart.length > 0 ? (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {/* item layout */}
              </li>
            ))}
          </ul>
          <div className="flex flex-col justify-end items-end pt-6">
            <span className="text-accent font-medium">
              Subtotal:
              <strong className="text-black">{formatCurrency(subTotal)}</strong>
            </span>
            <span className="text-accent font-medium">
              Delivery:
              <strong className="text-black">{formatCurrency(deliveryFee)}</strong>
            </span>
            <span className="text-accent font-medium">
              Total:
              <strong className="text-black">
                {formatCurrency(subTotal + deliveryFee)}
              </strong>
            </span>
          </div>
        </>
      ) : (
        <p className="text-accent">There are no items in your cart. Add some</p>
      )}
    </div>
  );
}

export default CartItems;
