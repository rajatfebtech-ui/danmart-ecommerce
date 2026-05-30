import React from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

const PaymentCancel = () => (
  <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FiAlertCircle size={32} className="text-amber-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Cancelled</h1>
      <p className="text-slate-500 text-sm mb-7">Your payment was cancelled. No charges were made to your account.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/checkout" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">Try Again</Link>
        <Link to="/" className="border-2 border-slate-200 text-slate-600 font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">Back to Home</Link>
      </div>
    </div>
  </div>
);

export default PaymentCancel;
