import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { FiMapPin, FiUser, FiMail, FiPhone } from "react-icons/fi";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const Field = ({ label, name, type = "text", placeholder, value, onChange, icon: Icon }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />}
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} required
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50`} />
    </div>
  </div>
);

const CheckOut = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "", country: "" });
  const navigate = useNavigate();
  const [{ isPending }] = usePayPalScriptReducer();

  useEffect(() => {
    Promise.all([GlobalAxios.get("/cart"), GlobalAxios.get("/shipping-details")])
      .then(([cR, sR]) => {
        setItems(cR.data.data?.items || []);
        const s = sR.data.data;
        if (s) setForm({ name: s.name || "", email: s.email || "", phone: s.phone || "", address: s.address || "", city: s.city || "", state: s.state || "", zip: s.zip || "", country: s.country || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const subtotal = items.reduce((s, i) => s + i.quantity * (i.product?.price || 0), 0);
  const shipping = 9.99;
  const total = subtotal + shipping;

  const placeOrder = async (paypalDetails = null) => {
    setSubmitting(true);
    try {
      const r = await GlobalAxios.post("/order", { ...form, paypal: paypalDetails });
      if (r.data.status === "success") {
        toast.success("Order placed successfully!");
        navigate(`/thanks?order_id=${r.data.data.order_id}&token=mock`);
      } else {
        toast.error("Could not place order");
      }
    } catch { toast.error("Order failed. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>;

  if (items.length === 0) return (
    <div className="text-center py-24">
      <p className="text-slate-500 text-lg mb-4">Your cart is empty</p>
      <button onClick={() => navigate("/")} className="bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl">Shop Now</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToastContainer position="bottom-right" />
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiUser size={16} className="text-amber-600"/> Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} icon={FiUser} />
              <Field label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} icon={FiMail} />
              <Field label="Phone" name="phone" placeholder="+1 555-0100" value={form.phone} onChange={handleChange} icon={FiPhone} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><FiMapPin size={16} className="text-amber-600"/> Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Street Address" name="address" placeholder="123 Main Street" value={form.address} onChange={handleChange} />
              </div>
              <Field label="City" name="city" placeholder="New York" value={form.city} onChange={handleChange} />
              <Field label="State" name="state" placeholder="NY" value={form.state} onChange={handleChange} />
              <Field label="ZIP / Postal Code" name="zip" placeholder="10001" value={form.zip} onChange={handleChange} />
              <Field label="Country" name="country" placeholder="United States" value={form.country} onChange={handleChange} />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-slate-800 mb-5">Payment</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
              <strong>Total due: ${total.toFixed(2)}</strong> — Click "Pay with PayPal" to complete your order securely.
            </div>
            {isPending ? (
              <div className="flex justify-center py-4"><ClipLoader size={30} color="#d97706" /></div>
            ) : (
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect", color: "gold", label: "pay" }}
                createOrder={(data, actions) =>
                  actions.order.create({ purchase_units: [{ amount: { value: total.toFixed(2), currency_code: "USD" }, description: "DanMart Order" }] })
                }
                onApprove={async (data, actions) => {
                  const details = await actions.order.capture();
                  await placeOrder({ order_id: details.id, payer: details.payer });
                }}
                onError={() => toast.error("PayPal error. Please try again.")}
              />
            )}
            <div className="relative my-4"><hr className="border-slate-200" /><span className="absolute inset-x-0 -top-2.5 text-center text-xs text-slate-400 bg-white w-fit mx-auto px-3">or</span></div>
            <button onClick={() => placeOrder()} disabled={submitting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 text-sm">
              {submitting ? <ClipLoader size={16} color="#fff" /> : "Place Order (Pay on Delivery)"}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="font-bold text-slate-800 mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={`${imageURI}/${item.product?.thumbnail}`} alt={item.product?.name}
                    onError={(e) => { e.target.src = "/product1.jpg"; }}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 flex-shrink-0">${(item.quantity * (item.product?.price || 0)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr className="border-slate-100 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
              <hr className="border-slate-100" />
              <div className="flex justify-between font-bold text-slate-800 text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
