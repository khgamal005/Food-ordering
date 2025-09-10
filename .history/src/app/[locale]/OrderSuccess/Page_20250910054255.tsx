// 'use client';

// import { FC } from 'react';
// import Lottie from 'lottie-react';
// import animationData from '@/assets/animations/107043-success.json';

// const Success: FC = () => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white">
//       <Lottie
//         animationData={animationData}
//         loop={false}
//         autoplay
//         style={{ width: 300, height: 300 }}
//       />
//       <h5 className="text-center mt-4 text-2xl text-gray-700">
//         Your order is successful 😍
//       </h5>
//     </div>
//   );
// };

// const OrderSuccessPage: FC = () => {
//   return <Success />;
// };

// export default OrderSuccessPage;
// 'use client';

// import { useEffect } from 'react';
// import { useAppDispatch } from '@/redux/hooks';
// import { clearCart } from '@/redux/features/cart/cartSlice';
// import { toast } from '@/hooks/use-toast';
// import axios from 'axios';
// import Lottie from 'lottie-react';
// import animationData from '@/assets/animations/107043-success.json';

// export default function OrderSuccessPage() {
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const savedOrder = localStorage.getItem('pendingOrder');
//     if (savedOrder) {
//       const { cart, formData } = JSON.parse(savedOrder);

//       axios.post('/api/orders', {
//         ...formData,
//         cart,
//         paymentMethod: 'stripe',
//       })
//       .then(() => {
//         dispatch(clearCart());
//         localStorage.removeItem('pendingOrder');
//         toast({ description: 'Order placed successfully 🎉' });
//       })
//       .catch(() => {
//         toast({ description: 'Failed to save order in DB' });
//       });
//     }
//   }, [dispatch]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white">
//       <Lottie animationData={animationData} loop={false} autoplay style={{ width: 300, height: 300 }} />
//       <h5 className="text-center mt-4 text-2xl text-gray-700">
//         Your payment was successful 😍
//       </h5>
//     </div>
//   );
// }
