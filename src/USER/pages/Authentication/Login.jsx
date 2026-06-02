import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { login } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";

const baseUrl = import.meta.env.VITE_API_URL || "https://api.danmartglobal.com/api/v1";

const Login = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("login"); // "login" | "forgot" | "forgot-sent"
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const UUID = Cookies.get("guestUUID") || null;
    const data = { email: e.target.email.value, password: e.target.password.value, "guest-uuid": UUID };
    try {
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
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await axios.post(`${baseUrl}/user/forgot-password`, { email: forgotEmail });
    } catch {
      // even if API fails, show success so email isn't enumerated
    } finally {
      setForgotLoading(false);
      setView("forgot-sent");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <ToastContainer position="top-right" />
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-slate-800">Dan<span className="text-amber-500">Mart</span></Link>
          <p className="text-slate-500 text-sm mt-2">
            {view === "login" ? "Welcome back! Sign in to your account" : "Reset your password"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">

          {/* ── Login form ── */}
          {view === "login" && (
            <>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <button type="button" onClick={() => setView("forgot")}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline">
                      Forgot password?
                    </button>
                  </div>
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
            </>
          )}

          {/* ── Forgot password form ── */}
          {view === "forgot" && (
            <>
              <button onClick={() => setView("login")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
                <FiArrowLeft size={14} /> Back to Sign In
              </button>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Forgot Password</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="email" required placeholder="you@example.com"
                      value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60">
                  {forgotLoading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {/* ── Forgot sent confirmation ── */}
          {view === "forgot-sent" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-500 mb-2">
                If <strong>{forgotEmail}</strong> is registered, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-slate-400 mb-6">Check your spam folder if you don't see it.</p>
              <button onClick={() => { setView("login"); setForgotEmail(""); }}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 text-sm">
                Back to Sign In
              </button>
            </div>
          )}

        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-sm text-slate-500 hover:text-amber-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
