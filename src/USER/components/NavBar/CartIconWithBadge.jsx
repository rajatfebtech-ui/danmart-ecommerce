import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart } from 'react-icons/fa';
import GlobalAxios from '../../../../Global/GlobalAxios';

const CartIconWithBadge = () => {
  const itemsCount = useSelector((state) => state.cart.items);
  const [items, setItems] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await GlobalAxios.get('/cart');
        setItems(response.data.data.carts.reduce((acc, item) => acc + item.quantity, 0));
      } catch (error) {
        console.log(error);
      }
    };
    fetchCart();
  }, [items, setItems,itemsCount]);

  return (
    <div className="relative">
      <FaShoppingCart size={24} />
      {items > 0 && (
        <span className="absolute w-[18px] h-[18px] top-[-5px] right-[-10px] bg-red-500 p-2 text-white rounded-full flex items-center justify-center text-xs">
          {items}
        </span>
      )}
    </div>
  );
};

export default CartIconWithBadge;