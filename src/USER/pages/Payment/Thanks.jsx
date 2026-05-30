import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCheckCircle, FiPackage } from "react-icons/fi";

const Thanks = () => {
  const params = new URLSearchParams(useLocation().search);
  const order_id = params.get("order_id");

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FiCheckCircle size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500 text-sm mb-6">
          Thank you for your purchase. A confirmation has been sent to your email.
        </p>
        {order_id && (
          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Order ID:</span> #{order_id}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders"
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">
            <FiPackage size={15}/> View Orders
          </Link>
          <Link to="/"
            className="flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-600 hover:border-slate-300 font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
