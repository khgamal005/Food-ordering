'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTotalAmount } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';
import { selectCartItems, clearCart } from '@/redux/features/cart/cartSlice';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import axios from 'axios';
import { createOrder } from '@/redux/features/order/orderSlice';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/router';

function CheckoutForm() {
  const cart = useAppSelector(selectCartItems);
  const totalAmount = getTotalAmount(cart);
  const dispatch = useAppDispatch();
  const router = useRouter();


  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe' | null>(null);

  // ✅ Unified submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataObj = Object.fromEntries(new FormData(e.currentTarget));
    const selectedPaymentMethod = formDataObj.paymentMethod as 'cod' | 'stripe' | undefined;

    if (!selectedPaymentMethod) return alert('Please choose a payment method');

    setLoading(true);

    try {
      if (selectedPaymentMethod === 'cod') {
        // Cash on Delivery
        const res: any = await dispatch(
          createOrder({
            formData: formDataObj,
            cart,
            paymentMethod: 'cod',
          })
        );

        if (res.meta.requestStatus === 'fulfilled') {
          dispatch(clearCart());
          toast({ description: "Order placed successfully (Cash on Delivery) 🎉" });
          router.push("/ordersuccess"); // ✅ redirect
        }
      } else if (selectedPaymentMethod === 'stripe') {
        // Stripe
        const res = await axios.post('/api/checkout_sessions', {
          cart,
          formData: formDataObj,
        });
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      toast({"Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    cart &&
    cart.length > 0 && (
      <div className='grid gap-6 bg-gray-100 rounded-md p-4'>
        <h2 className='text-2xl text-black font-semibold'>Checkout</h2>

        {/* ONE form, ONE handler */}
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4'>
            {/* Phone */}
            <div className='grid gap-1'>
              <Label htmlFor='phone' className='text-accent'>
                Phone
              </Label>
              <Input id='phone' placeholder='Enter your phone' type='text' name='phone' required />
            </div>

            {/* Address */}
            <div className='grid gap-1'>
              <Label htmlFor='address' className='text-accent'>
                Street address
              </Label>
              <Textarea id='address' placeholder='Enter your address' name='address' className='resize-none' required />
            </div>

            {/* Postal + City + Country */}
            <div className='grid grid-cols-2 gap-2'>
              <div className='grid gap-1'>
                <Label htmlFor='postal-code' className='text-accent'>
                  Postal code
                </Label>
                <Input type='text' id='postal-code' placeholder='Enter postal code' name='postalCode' required />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='city' className='text-accent'>
                  City
                </Label>
                <Input type='text' id='city' placeholder='Enter your City' name='city' required />
              </div>
              <div className='grid gap-1 col-span-2'>
                <Label htmlFor='country' className='text-accent'>
                  Country
                </Label>
                <Input type='text' id='country' placeholder='Enter your country' name='country' required />
            <div className='flex gap-3'>
              <Button
                type='submit'
                disabled={loading}
                className='h-10 flex-1 bg-green-600 hover:bg-green-700'
                onClick={() => setPaymentMethod('cod')}
                name="paymentMethod"
                value="cod"
              >
                {loading && paymentMethod === 'cod' ? 'Processing...' : 'Cash on Delivery'}
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='h-10 flex-1 bg-blue-600 hover:bg-blue-700'
                onClick={() => setPaymentMethod('stripe')}
                name="paymentMethod"
                value="stripe"
              >
                {loading && paymentMethod === 'stripe'
                  ? 'Redirecting...'
                  : `Pay with Stripe ${formatCurrency(totalAmount)}`}
              </Button>
            </div>
                  ? 'Redirecting...'
                  : `Pay with Stripe ${formatCurrency(totalAmount)}`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    )
  );
}

export default CheckoutForm;
