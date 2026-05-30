import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { FiArrowLeft, FiSave } from "react-icons/fi";

const EMPTY = { name: "", slug: "", price: "", old_price: "", stock: "", category_id: "", description: "", thumbnail: "", is_active: true, is_top: false, is_new: true };

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AdminAxios.get("/categories").then((r) => setCategories(r.data.data || [])).catch(() => {});
    if (isEdit) {
      AdminAxios.get(`/products/${id}`)
        .then((r) => { const p = r.data.data || r.data; setForm({ ...EMPTY, ...p }); })
        .catch(() => toast.error("Failed to load product"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await AdminAxios.put(`/products/${id}`, form);
        toast.success("Product updated");
      } else {
        await AdminAxios.post("/products", form);
        toast.success("Product created");
      }
      setTimeout(() => navigate("/admin/products"), 800);
    } catch { toast.error("Failed to save product"); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={32} color="#d97706" /></div>;

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/products")} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-all">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">{isEdit ? "Edit Product" : "New Product"}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{isEdit ? `Editing #${id}` : "Fill in the details below"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5 bg-white rounded-2xl shadow-card p-6">
          <Field label="Product Name *">
            <input required value={form.name} onChange={(e) => { set("name", e.target.value); if (!isEdit) set("slug", autoSlug(e.target.value)); }}
              className={inputCls} placeholder="Brass Compass" />
          </Field>
          <Field label="Slug *">
            <input required value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} placeholder="brass-compass" />
          </Field>
          <Field label="Description">
            <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
              className={`${inputCls} resize-none`} placeholder="Product description…" />
          </Field>
          <Field label="Thumbnail filename">
            <input value={form.thumbnail} onChange={(e) => set("thumbnail", e.target.value)}
              className={inputCls} placeholder="product1.jpg" />
            {form.thumbnail && (
              <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${form.thumbnail}`} alt="preview"
                className="w-20 h-20 object-cover rounded-xl mt-2" onError={(e) => { e.target.src = "/product1.jpg"; }} />
            )}
          </Field>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Pricing & Stock</h3>
            <Field label="Price *">
              <input type="number" required min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} placeholder="29.99" />
            </Field>
            <Field label="Original Price (for discount)">
              <input type="number" min="0" step="0.01" value={form.old_price} onChange={(e) => set("old_price", e.target.value)} className={inputCls} placeholder="39.99" />
            </Field>
            <Field label="Stock *">
              <input type="number" required min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} placeholder="50" />
            </Field>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Category & Status</h3>
            <Field label="Category">
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className={inputCls}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="space-y-2">
              {[["is_active", "Active"], ["is_top", "Top Product"], ["is_new", "New Arrival"]].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={Boolean(form[k])} onChange={(e) => set(k, e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded" />
                  <span className="text-sm text-slate-700">{l}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <ClipLoader size={14} color="#fff" /> : <FiSave size={14} />}
            {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
