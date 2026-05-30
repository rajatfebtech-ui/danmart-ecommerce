import React, { useEffect, useState } from "react";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { ClipLoader } from "react-spinners";
import { useLocation, Link } from "react-router-dom";
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiMapPin } from "react-icons/fi";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const steps = [
  { key: "pending", label: "Order Placed", icon: FiClock },
  { key: "paid", label: "Payment Confirmed", icon: FiCheckCircle },
  { key: "shipped", label: "Shipped", icon: FiTruck },
  { key: "delivered", label: "Delivered", icon: FiPackage },
];

const statusOrder = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: -1 };

const statusBadge = {
  pending: "badge-amber",
  paid: "badge-green",
  shipped: "badge-blue",
  delivered: "badge-green",
  cancelled: "badge-red",
  unpaid: "badge-red",
};

const TrackOrder = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const order_id = params.get("order_id");
  const token = params.get("token");

  useEffect(() => {
    if (!order_id) { setLoading(false); setNotFound(true); return; }
    GlobalAxios.get(`/order-track/${order_id}/${token || ""}`)
      .then((r) => { if (r.data.status === "success") setOrderData(r.data); else setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [order_id, token]);

  const currentStep = orderData ? (statusOrder[orderData.order_status] ?? 0) : -1;
  const isCancelled = orderData?.order_status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Shipping</span>
        <h1 className="text-3xl font-black text-slate-800 mt-2">Track Your Order</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <FiXCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">We couldn't find an order matching those details. Check your link or contact support.</p>
          <Link to="/" className="btn-primary inline-flex">Back to Home</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status header */}
          <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Order</p>
              <h2 className="text-2xl font-black text-slate-800">#{orderData.order_id}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Placed on {new Date(orderData.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <span className={`${statusBadge[orderData.order_status] || "badge-gray"} text-sm font-semibold px-4 py-2 rounded-full`}>
              {orderData.order_status.charAt(0).toUpperCase() + orderData.order_status.slice(1)}
            </span>
          </div>

          {/* Progress tracker */}
          {!isCancelled && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-6">Order Progress</h3>
              <div className="flex items-center">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const done = currentStep >= i;
                  const active = currentStep === i;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${done ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-400"} ${active ? "ring-4 ring-amber-200" : ""}`}>
                          <Icon size={18} />
                        </div>
                        <p className={`text-xs mt-2 font-medium text-center max-w-[72px] leading-tight ${done ? "text-amber-600" : "text-slate-400"}`}>{step.label}</p>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-1 rounded transition-all ${currentStep > i ? "bg-amber-600" : "bg-slate-100"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipping info */}
          {orderData.shipping_details && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin size={16} className="text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-700">Shipping To</h3>
              </div>
              <p className="font-medium text-slate-800">{orderData.shipping_details.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {orderData.shipping_details.address}, {orderData.shipping_details.city}, {orderData.shipping_details.state} {orderData.shipping_details.zip}
              </p>
              <p className="text-sm text-slate-500">{orderData.shipping_details.country}</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Items in This Order</h3>
            <div className="space-y-4">
              {(orderData.items || []).map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                  <img src={`${imageURI}/${item.product_thumbnail || item.thumbnail}`} alt={item.product_name || item.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = "/product1.jpg"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{item.product_name || item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm flex-shrink-0">${parseFloat(item.total || item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between">
              <span className="font-semibold text-slate-700">Total Paid</span>
              <span className="font-black text-amber-600 text-lg">${parseFloat(orderData.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center">
            <Link to="/orders" className="btn-outline inline-flex mr-3">My Orders</Link>
            <Link to="/" className="btn-primary inline-flex">Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
