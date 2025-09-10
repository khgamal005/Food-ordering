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
  "use client";

import { FC, useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { clearCart } from "@/redux/features/cart/cartSlice";
import Lottie from "lottie-react";
import animationData from "@/assets/animations/107043-success.json";
import axios from "axios";

const Success: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay
        style={{ width: 300, height: 300 }}
      />
      <h5 className="text-center mt-4 text-2xl text-gray-700">
        Your order is successful 😍
      </h5>
    </div>
  );
};

const OrderSuccessPage: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function saveOrder() {
      const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const formData = JSON.parse(localStorage.getItem("checkoutForm") || "{}");

      if (cart.length > 0) {
        await axios.post("/api/orders", {
          cart,
          formData,
          paymentMethod: "stripe",
        });

        // Clear Redux + LocalStorage in one call
        dispatch(clearCart());
      }
    }

    saveOrder();
  }, [dispatch]);

  return <Success />;
};

export default OrderSuccessPage;
