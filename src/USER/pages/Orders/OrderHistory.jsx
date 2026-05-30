import React, { useEffect, useState } from "react";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { ClipLoader } from "react-spinners";
import { FiPackage, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const statusClass = (s) => ({
  pending:   "badge-amber",
  paid:      "badge-green",
  unpaid:    "badge-red",
  shipped:   "badge-blue",
  delivered: "badge-green",
  cancelled: "badge-gray",
}[s] || "badge-gray");

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    GlobalAxios.get("/order-history")
      .then((r) => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const cancelOrder = async (id) => {
    try {
      await GlobalAxios.post(`/cancel-order/${id}`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch { toast.error("Could not cancel order"); }
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToastContainer position="bottom-right" />
      <h1 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2"><FiPackage className="text-amber-600"/> Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl shadow-card">
          <FiPackage size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-5">No orders yet</p>
          <Link to="/" className="bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-slate-800">Order #{order.id}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={statusClass(order.status)}>{order.status}</span>
                  <span className={statusClass(order.payment_status)}>{order.payment_status}</span>
                  {order.status !== "cancelled" && (
                    <button onClick={() => cancelOrder(order.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition-colors">
                      <FiX size={12}/> Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={`${imageURI}/${item.product?.thumbnail}`} alt={item.product?.name}
                      onError={(e) => { e.target.src = "/product1.jpg"; }}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity} × ${item.product?.price}</p>
                    </div>
                    <span className="text-sm font-semibold">${(item.quantity * (item.product?.price || 0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100 my-4" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-bold text-slate-800 text-base">${order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
