import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { ClipLoader } from "react-spinners";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const ShoppingCart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = () => {
    GlobalAxios.get("/cart")
      .then((r) => setItems(r.data.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (id, qty) => {
    if (qty < 1) return;
    await GlobalAxios.put(`/cart/${id}`, { quantity: qty });
    fetchCart();
  };

  const removeItem = async (id) => {
    await GlobalAxios.delete(`/cart/${id}`);
    toast.success("Item removed");
    fetchCart();
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * (i.product?.price || 0), 0);
  const shipping = subtotal > 0 ? 9.99 : 0;
  const total = subtotal + shipping;

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToastContainer position="bottom-right" />
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Shopping Cart <span className="text-slate-400 font-normal text-lg">({items.length} items)</span></h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <img src="/empty_cart.png" alt="Empty cart" className="w-36 mx-auto mb-6 opacity-50" />
          <p className="text-slate-500 text-lg mb-5">Your cart is empty</p>
          <Link to="/" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-7 py-3 rounded-xl transition-all inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-card p-4 flex gap-4 items-center">
                <img src={`${imageURI}/${item.product?.thumbnail}`} alt={item.product?.name}
                  onError={(e) => { e.target.src = "/product1.jpg"; }}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?.id}/${item.product?.slug}`}
                    className="font-semibold text-slate-800 text-sm hover:text-amber-700 line-clamp-2 leading-snug">{item.product?.name}</Link>
                  <p className="text-amber-700 font-bold mt-1 text-sm">${item.product?.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors">
                    <FiMinus size={12} />
                  </button>
                  <span className="w-7 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors">
                    <FiPlus size={12} />
                  </button>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-slate-800 text-sm">${(item.quantity * (item.product?.price || 0)).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 mt-1.5 transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 h-fit sticky top-24">
            <h2 className="font-bold text-slate-800 text-lg mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
              <hr className="border-slate-100" />
              <div className="flex justify-between font-bold text-slate-800 text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <button onClick={() => navigate("/checkout")}
              className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
              <FiShoppingBag size={15}/> Proceed to Checkout
            </button>
            <Link to="/" className="block text-center text-sm text-amber-600 hover:underline mt-3">← Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
