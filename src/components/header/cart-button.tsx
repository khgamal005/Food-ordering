'use client';
import React, { useEffect, useState } from 'react';
import Link from '../link';
import { Routes } from '@/constants/enums';
import { ShoppingCartIcon } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { selectCartItems } from '@/redux/features/cart/cartSlice';
import { getCartQuantity } from '@/lib/cart';

const CartButton = () => {
  const [mounted, setMounted] = useState(false);
  const cart = useAppSelector(selectCartItems);
  const cartQuantity = getCartQuantity(cart);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href={`/${Routes.CART}`} className='block relative group'>
      {mounted && (
        <span className='absolute -top-4 start-4 w-5 h-5 text-sm bg-primary rounded-full text-white text-center'>
          {cartQuantity}
        </span>
      )}
      <ShoppingCartIcon
        className='text-accent group-hover:text-primary duration-200 transition-colors !w-6 !h-6'
      />
    </Link>
  );
};

export default CartButton;
