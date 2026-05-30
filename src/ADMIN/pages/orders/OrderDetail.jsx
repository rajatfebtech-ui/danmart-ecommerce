import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { FiArrowLeft, FiMapPin, FiUser, FiCreditCard } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AdminAxios.get(`/orders/${id}`)
      .then((r) => setOrder(r.data.data || r.data))
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status) => {
    setSaving(true);
    try {
      await AdminAxios.put(`/orders/${id}/status`, { status });
      setOrder((o) => ({ ...o, status, order_status: status }));
      toast.success("Status updated");
    } catch { toast.error("Failed"); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={32} color="#d97706" /></div>;
  if (!order) return <div className="text-center py-20 text-slate-500">Order not found</div>;

  const status = order.status || order.order_status || "pending";
  const items = order.items || order.order_items || [];
  const shipping = order.shipping_details || {};

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/orders" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-all">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Order #{order.id}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{order.created_at ? new Date(order.created_at).toLocaleString() : ""}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select value={status} disabled={saving} onChange={(e) => handleStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white font-medium">
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-slate-800 mb-4">Items</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                <img src={`${imageURI}/${item.product_thumbnail || item.thumbnail}`} alt={item.product_name || item.name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = "/product1.jpg"; }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">{item.product_name || item.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <p className="font-semibold text-slate-800 text-sm">${parseFloat(item.total || item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${parseFloat(order.total_amount || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Shipping</span><span className="text-green-600">Free</span></div>
            <div className="flex justify-between font-bold text-slate-800 text-base border-t pt-2"><span>Total</span><span className="text-amber-600">${parseFloat(order.total_amount || 0).toFixed(2)}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiUser size={14} className="text-amber-600" />
              <h3 className="font-semibold text-slate-700 text-sm">Customer</h3>
            </div>
            <p className="font-medium text-slate-800 text-sm">{order.customer_name || order.user_name || "Guest"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{order.customer_email || order.user_email || "—"}</p>
          </div>

          {/* Shipping */}
          {Object.keys(shipping).length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin size={14} className="text-amber-600" />
                <h3 className="font-semibold text-slate-700 text-sm">Shipping</h3>
              </div>
              <p className="font-medium text-slate-800 text-sm">{shipping.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {shipping.address}<br />
                {shipping.city}, {shipping.state} {shipping.zip}<br />
                {shipping.country}
              </p>
              <p className="text-xs text-slate-500 mt-1">{shipping.phone}</p>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiCreditCard size={14} className="text-amber-600" />
              <h3 className="font-semibold text-slate-700 text-sm">Payment</h3>
            </div>
            <p className="text-sm font-medium text-slate-800 capitalize">{order.payment_method || "Cash on Delivery"}</p>
            {order.paypal_order_id && <p className="text-xs text-slate-400 mt-0.5 font-mono">{order.paypal_order_id}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
