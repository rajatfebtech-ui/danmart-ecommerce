import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { toast, ToastContainer } from "react-toastify";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password } = e.target;
    if (password.value.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const r = await GlobalAxios.post("/register", { name: name.value, email: email.value, password: password.value });
      if (r.data.status === "success") {
        toast.success("Account created! Please sign in.");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        toast.error(r.data.message || "Registration failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <ToastContainer position="top-right" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-slate-800">Dan<span className="text-amber-500">Mart</span></Link>
          <p className="text-slate-500 text-sm mt-2">Create your free account today</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Create Account</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input name="name" type="text" required placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
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
                <input name="password" type={showPwd ? "text" : "password"} required placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
