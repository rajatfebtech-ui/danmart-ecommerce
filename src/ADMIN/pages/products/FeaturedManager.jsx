import React, { useEffect, useState } from "react";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { FiStar, FiCheck, FiX } from "react-icons/fi";

const imageBase = import.meta.env.VITE_IMAGE_BASE_URL;

// Reusable page for managing is_top (Featured) or is_new (New Arrivals)
const FeaturedManager = ({ field, title, subtitle, color = "amber" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const load = () => {
    setLoading(true);
    AdminAxios.get("/products")
      .then((r) => setProducts(r.data.data || []))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (product) => {
    setToggling(product.id);
    const newVal = !product[field];
    try {
      await AdminAxios.put(`/products/${product.id}`, { ...product, [field]: newVal });
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, [field]: newVal } : p));
      toast.success(`${product.name} ${newVal ? "added to" : "removed from"} ${title}`);
    } catch {
      toast.error("Failed to update");
    }
    setToggling(null);
  };

  const active = products.filter((p) => p[field]);
  const inactive = products.filter((p) => !p[field]);

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={32} color="#d97706" /></div>;

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <h2 className="font-bold text-slate-700 text-sm">Currently in {title} <span className="text-slate-400 font-normal">({active.length})</span></h2>
          </div>
          <div className="space-y-2">
            {active.length === 0 && <p className="text-sm text-slate-400 text-center py-6">None added yet</p>}
            {active.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                <img src={`${imageBase}/${p.thumbnail}`} alt={p.name}
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { e.target.src = "/product1.jpg"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">${parseFloat(p.price).toFixed(2)}</p>
                </div>
                <button onClick={() => toggle(p)} disabled={toggling === p.id}
                  className="flex-shrink-0 p-1.5 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg transition-all disabled:opacity-40">
                  {toggling === p.id ? <ClipLoader size={12} color="#ef4444" /> : <FiX size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
            <h2 className="font-bold text-slate-700 text-sm">Available Products <span className="text-slate-400 font-normal">({inactive.length})</span></h2>
          </div>
          <div className="space-y-2">
            {inactive.length === 0 && <p className="text-sm text-slate-400 text-center py-6">All products are added</p>}
            {inactive.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-amber-50 hover:border-amber-100 transition-colors">
                <img src={`${imageBase}/${p.thumbnail}`} alt={p.name}
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { e.target.src = "/product1.jpg"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">${parseFloat(p.price).toFixed(2)}</p>
                </div>
                <button onClick={() => toggle(p)} disabled={toggling === p.id}
                  className="flex-shrink-0 p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-all disabled:opacity-40">
                  {toggling === p.id ? <ClipLoader size={12} color="#d97706" /> : <FiCheck size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeaturedProductsManager = () => (
  <FeaturedManager
    field="is_top"
    title="Featured Products"
    subtitle="Products shown in the Featured section on homepage"
  />
);

export const NewArrivalsManager = () => (
  <FeaturedManager
    field="is_new"
    title="New Arrivals"
    subtitle="Products shown in the New Arrivals section on homepage"
  />
);

export default FeaturedManager;
