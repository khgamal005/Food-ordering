'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTotalAmount } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';
import { selectCartItems } from '@/redux/features/cart/cartSlice';
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";






function CheckoutForm() {
  const cart = useAppSelector(selectCartItems);
  const totalAmount = getTotalAmount(cart);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe" | null>(null);

    const dispatch = useDispatch();
  const cart = useAppSelector(selectCartItems);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert("Please choose a payment method.");
      return;
    }

    if (paymentMethod === "cod") {
      // 👉 COD checkout logic
      console.log("Processing Cash on Delivery order...");
    } else if (paymentMethod === "stripe") {
      // 👉 Stripe checkout logic (redirect to Stripe Checkout session)
      console.log("Redirecting to Stripe checkout...");
    }
  };

  return (
    cart &&
    cart.length > 0 && (
      <div className='grid gap-6 bg-gray-100 rounded-md p-4'>
        <h2 className='text-2xl text-black font-semibold'>Checkout</h2>
        <form onSubmit={handleCheckout}>
          <div className='grid gap-4'>
            {/* Phone */}
            <div className='grid gap-1'>
              <Label htmlFor='phone' className='text-accent'>
                Phone
              </Label>
              <Input id='phone' placeholder='Enter your phone' type='text' name='phone' />
            </div>

            {/* Address */}
            <div className='grid gap-1'>
              <Label htmlFor='address' className='text-accent'>
                Street address
              </Label>
              <Textarea id='address' placeholder='Enter your address' name='address' className='resize-none' />
            </div>

            {/* Postal + City + Country */}
            <div className='grid grid-cols-2 gap-2'>
              <div className='grid gap-1'>
                <Label htmlFor='postal-code' className='text-accent'>
                  Postal code
                </Label>
                <Input type='text' id='postal-code' placeholder='Enter postal code' name='postal-code' />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='city' className='text-accent'>
                  City
                </Label>
                <Input type='text' id='city' placeholder='Enter your City' name='city' />
              </div>
              <div className='grid gap-1 col-span-2'>
                <Label htmlFor='country' className='text-accent'>
                  Country
                </Label>
                <Input type='text' id='country' placeholder='Enter your country' name='country' />
              </div>
            </div>

            {/* Payment buttons */}
            <div className='flex gap-3'>
              <Button
                type='submit'
                onClick={() => setPaymentMethod("cod")}
                className='h-10 flex-1 bg-green-600 hover:bg-green-700'
              >
                Cash on Delivery
              </Button>
              <Button
                type='submit'
                onClick={() => setPaymentMethod("stripe")}
                className='h-10 flex-1 bg-blue-600 hover:bg-blue-700'
              >
                Pay with Stripe {formatCurrency(totalAmount)}
              </Button>
            </div>
          </div>
        </form>
      </div>
    )
  );
}

export default CheckoutForm;

