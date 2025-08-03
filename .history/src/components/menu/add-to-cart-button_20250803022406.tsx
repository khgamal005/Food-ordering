'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/formatters';
import { Checkbox } from '../ui/checkbox';
// import { Extra, ProductSizes, Size } from '@prisma/client';
import { useState } from 'react';
import { ProductWithRelations } from '@/types/product';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import {
//   addCartItem,
//   removeCartItem,
//   removeItemFromCart,
//   selectCartItems,
// } from '@/redux/features/cart/cartSlice';
// import { getItemQuantity } from '@/lib/cart';
