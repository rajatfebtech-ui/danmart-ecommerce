import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { login } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const UUID = Cookies.get("guestUUID") || null;
    const data = { email: e.target.email.value, password: e.target.password.value, "guest-uuid": UUID };
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "https://api.danmartglobal.com/api/v1";
      const response = await axios.post(`${baseUrl}/user/login`, data);
      if (response.data.status === "success") {
        Cookies.set("authToken", response.data.data.token, { expires: 0.25 });
        Cookies.remove("guestUUID");
        dispatch(login());
        toast.success("Logged in successfully!");
        setTimeout(() => navigate("/"), 800);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch {
      toast.error("Invalid credentials. Try demo@danmart.com / demo1234");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <ToastContainer position="top-right" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-slate-800">Dan<span className="text-amber-500">Mart</span></Link>
          <p className="text-slate-500 text-sm mt-2">Welcome back! Sign in to your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input name="email" type="email" required placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input name="password" type={showPwd ? "text" : "password"} required placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60 mt-2">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-amber-600 font-semibold hover:underline">Register here</Link>
          </p>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 text-center">
            Demo: <strong>demo@danmart.com</strong> / <strong>demo1234</strong>
          </div>
        </div>
        <p className="text-center mt-4">
          <Link to="/" className="text-sm text-slate-500 hover:text-amber-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
