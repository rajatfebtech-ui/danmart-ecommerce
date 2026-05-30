import React, { useEffect, useState } from "react";
import AdminAxios from "../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { FiShoppingBag, FiDollarSign, FiPackage, FiUsers, FiTrendingUp } from "react-icons/fi";

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AdminAxios.get("/dashboard"), AdminAxios.get("/orders?limit=5")])
      .then(([sR, oR]) => {
        setStats(sR.data.data || sR.data);
        setRecentOrders((oR.data.data || []).slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => {
    const m = { pending: "badge-amber", paid: "badge-green", shipped: "badge-blue", delivered: "badge-green", cancelled: "badge-red" };
    return m[s] || "badge-gray";
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back — here's what's happening</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiShoppingBag} label="Total Orders" value={stats?.total_orders ?? 0} sub="All time" color="bg-amber-500" />
        <StatCard icon={FiDollarSign} label="Revenue" value={`$${parseFloat(stats?.total_revenue ?? 0).toFixed(0)}`} sub="All time" color="bg-emerald-500" />
        <StatCard icon={FiPackage} label="Products" value={stats?.total_products ?? 0} sub="In catalog" color="bg-blue-500" />
        <StatCard icon={FiUsers} label="Customers" value={stats?.total_users ?? 0} sub="Registered" color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><FiTrendingUp size={16} className="text-amber-600" />Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View all →</a>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-slate-800">#{o.id}</td>
                    <td className="py-3 pr-4 text-slate-600">{o.customer_name || o.user_name || "Guest"}</td>
                    <td className="py-3 pr-4 font-semibold">${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`${statusBadge(o.status || o.order_status)} text-xs font-medium px-2.5 py-1 rounded-full`}>
                        {(o.status || o.order_status || "pending")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
