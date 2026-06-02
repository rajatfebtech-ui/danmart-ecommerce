import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  FiGrid, FiPackage, FiTag, FiShoppingBag, FiUsers,
  FiLogOut, FiMenu, FiX, FiExternalLink, FiImage, FiStar, FiZap,
} from "react-icons/fi";

const nav = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiPackage },
  { to: "/admin/featured", label: "Featured", icon: FiStar },
  { to: "/admin/new-arrivals", label: "New Arrivals", icon: FiZap },
  { to: "/admin/categories", label: "Categories", icon: FiTag },
  { to: "/admin/banners", label: "Banners", icon: FiImage },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/users", label: "Users", icon: FiUsers },
];

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    Cookies.remove("adminToken");
    navigate("/admin/login");
  };

  const Sidebar = ({ mobile }) => (
    <aside className={`${mobile ? "flex flex-col h-full" : "hidden lg:flex flex-col"} w-64 bg-slate-900 text-white flex-shrink-0`}>
      <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between">
        <h1 className="text-xl font-black">DanMart <span className="text-amber-500">Admin</span></h1>
        {mobile && <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white"><FiX size={20} /></button>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
            }>
            <Icon size={16} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-0.5">
        <a href="/" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
          <FiExternalLink size={16} />View Store
        </a>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-all">
          <FiLogOut size={16} />Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="flex flex-col w-64"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden text-slate-500 hover:text-slate-800" onClick={() => setOpen(true)}>
            <FiMenu size={20} />
          </button>
          <div className="flex-1" />
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors">
            <FiLogOut size={14} />Logout
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
