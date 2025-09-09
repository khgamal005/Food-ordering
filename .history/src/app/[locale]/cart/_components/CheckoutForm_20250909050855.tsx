'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTotalAmount } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';
import { selectCartItems, clearCart } from '@/redux/features/cart/cartSlice';
import { useAppSelector } from '@/redux/hooks';
import { useAppDispatch } from '@/redux/hooks';
import axios from 'axios';
import { createOrder } from '@/redux/features/order/orderlice'

function CheckoutForm() {
  const cart = useAppSelector(selectCartItems);
  const totalAmount = getTotalAmount(cart);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  // ✅ COD flow
  const handleCashOnDelivery = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      const res: any = dispatch(
        createOrder({
          formData,
          cart,
          paymentMethod: 'cod',
        })
      );
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(clearCart()); // clear cart only after success
        alert('Order placed successfully (Cash on Delivery)');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Stripe flow
  const handleStripeCheckout = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/checkout_sessions', {
        cart,
        formData,
      });
      // Redirect to Stripe Checkout page
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert('Failed to start Stripe checkout');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Unified form handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, method: 'cod' | 'stripe') => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    if (method === 'cod') {
      await handleCashOnDelivery(formData);
    } else {
      await handleStripeCheckout(formData);
    }
  };

  return (
    cart &&
    cart.length > 0 && (
      <div className='grid gap-6 bg-gray-100 rounded-md p-4'>
        <h2 className='text-2xl text-black font-semibold'>Checkout</h2>

        {/* We wrap the whole thing in ONE form */}
        <form>
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
              </div>
            </div>

            {/* Payment buttons */}
            <div className='flex gap-3'>
              <Button
                type='submit'
                disabled={loading}
                className='h-10 flex-1 bg-green-600 hover:bg-green-700'
                onClick={(e) => handleSubmit(e as any, 'cod')}
              >
                {loading ? 'Processing...' : 'Cash on Delivery'}
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='h-10 flex-1 bg-blue-600 hover:bg-blue-700'
                onClick={(e) => handleSubmit(e as any, 'stripe')}
              >
                {loading ? 'Redirecting...' : `Pay with Stripe ${formatCurrency(totalAmount)}`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    )
  );
}

export default CheckoutForm;
