import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiStar, FiTrendingUp } from "react-icons/fi";
import GlobalAxios from "../../../Global/GlobalAxios";

const Categories = () => {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    GlobalAxios.get("/product-categories").then((r) => setCats(r.data.data || [])).catch(() => {});
  }, []);

  const staticLinks = [
    { label: "Top Products", href: "/top-products", icon: <FiTrendingUp size={14} /> },
    { label: "Featured Products", href: "/feature-products", icon: <FiStar size={14} /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 sticky top-20">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-3">Categories</h3>
      <nav className="space-y-0.5">
        {cats.map((c) => (
          <NavLink key={c.id} to={`/category/${c.id}/${c.slug}`}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${isActive ? "bg-amber-50 text-amber-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
            }>
            <FiGrid size={13} /> {c.name}
          </NavLink>
        ))}
      </nav>

      <hr className="my-4 border-slate-100" />
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-3">Collections</h3>
      <nav className="space-y-0.5">
        {staticLinks.map((l) => (
          <NavLink key={l.href} to={l.href}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${isActive ? "bg-amber-50 text-amber-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
            }>
            {l.icon} {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Categories;
