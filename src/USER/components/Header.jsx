import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX, FiPhone, FiMail } from "react-icons/fi";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white">
      <div className="border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><FiPhone size={11}/> +91 9837184618</span>
            <span className="hidden sm:flex items-center gap-1.5"><FiMail size={11}/> danmartglobal@gmail.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/track" className="hover:text-amber-400 transition-colors">Track Order</Link>
            <span className="text-slate-700">|</span>
            <Link to="/admin" className="hover:text-amber-400 transition-colors">Admin Panel</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight group-hover:text-amber-300 transition-colors">
            Dan<span className="text-amber-400">Mart</span>
          </span>
          <span className="hidden sm:block text-xs text-slate-500 border-l border-slate-700 pl-2 ml-1">Global</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[["Home", "/"], ["About", "/about"], ["Contact", "/contact"]].map(([label, path]) => (
            <NavLink key={path} to={path} end={path === "/"}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-amber-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700/60"}`
              }>{label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-slate-300 hover:text-white p-1">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-700/60 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1">
            {[["Home", "/"], ["About", "/about"], ["Contact", "/contact"]].map(([label, path]) => (
              <NavLink key={path} to={path} end={path === "/"} onClick={() => setOpen(false)}
                className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? "bg-amber-600 text-white" : "text-slate-300"}`}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
