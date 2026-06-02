import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
      const res = await axios.post(`${base}/admin/login`, form);
      if (res.data.status === "success") {
        Cookies.set("adminToken", res.data.data.token, { expires: 1 });
        navigate("/admin");
      } else {
        toast.error(res.data.message || "Invalid credentials");
      }
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <ToastContainer position="top-right" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">DanMart <span className="text-amber-500">Admin</span></h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to manage your store</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="email" required placeholder="Enter your email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type={showPwd ? "text" : "password"} required placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all text-sm active:scale-95">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
