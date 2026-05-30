import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { FiEye, FiFilter } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

const STATUSES = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

const statusBadge = (s) => ({ pending: "badge-amber", paid: "badge-green", shipped: "badge-blue", delivered: "badge-green", cancelled: "badge-red" }[s] || "badge-gray");

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    AdminAxios.get("/orders").then((r) => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await AdminAxios.put(`/orders/${id}/status`, { status });
      setOrders((o) => o.map((x) => x.id === id ? { ...x, status } : x));
      toast.success("Status updated");
    } catch { toast.error("Failed to update status"); }
    setUpdating(null);
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => (o.status || o.order_status) === filter);

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter size={14} className="text-slate-400" />
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === s ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-amber-400"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><ClipLoader size={32} color="#d97706" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-12">No orders found</td></tr>
                ) : filtered.map((o) => {
                  const status = o.status || o.order_status || "pending";
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">#{o.id}</td>
                      <td className="px-5 py-3.5 text-slate-600">{o.customer_name || o.user_name || "Guest"}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-3.5 font-semibold">${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.payment_method === "paypal" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                          {o.payment_method || "COD"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select value={status} disabled={updating === o.id}
                          onChange={(e) => handleStatus(o.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white">
                          {STATUSES.filter((s) => s !== "all").map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/admin/orders/${o.id}`} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all inline-flex">
                          <FiEye size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
