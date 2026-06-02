import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { FiArrowLeft, FiSave, FiUpload, FiX, FiPlus } from "react-icons/fi";

const EMPTY = {
  name: "", slug: "", price: "", old_price: "", stock: "",
  min_qty: 1, category_id: "", description: "",
  thumbnail: "", images: [], is_active: true, is_top: false, is_new: true,
};

const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
    {children}
  </div>
);

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [mainPreview, setMainPreview] = useState("");

  const imageBase = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    AdminAxios.get("/categories").then((r) => setCategories(r.data.data || [])).catch(() => {});
    if (isEdit) {
      AdminAxios.get(`/products/${id}`)
        .then((r) => {
          const p = r.data.data || r.data;
          setForm({ ...EMPTY, ...p, images: p.images || [] });
          if (p.thumbnail) setMainPreview(`${imageBase}/${p.thumbnail}`);
        })
        .catch(() => toast.error("Failed to load product"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Upload a single image file → returns filename
  const uploadFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;
        try {
          const res = await AdminAxios.post("/upload-image", { filename: file.name, data: base64 });
          resolve({ filename: res.data?.data?.filename || file.name, preview: base64 });
        } catch {
          resolve({ filename: file.name, preview: base64 });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Main thumbnail upload
  const handleMainImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploadingMain(true);
    const { filename, preview } = await uploadFile(file);
    set("thumbnail", filename);
    setMainPreview(preview);
    // Also add to images array if not already there
    setForm((f) => ({ ...f, thumbnail: filename, images: f.images.includes(filename) ? f.images : [filename, ...f.images] }));
    setUploadingMain(false);
    toast.success("Main image uploaded");
  };

  // Additional images upload (multiple)
  const handleExtraImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length) { toast.error("Each image must be under 5MB"); return; }
    setUploadingExtra(true);
    const results = await Promise.all(files.map(uploadFile));
    const newFilenames = results.map(r => r.filename);
    setForm((f) => {
      const existing = f.images || [];
      const merged = [...existing, ...newFilenames.filter(n => !existing.includes(n))];
      return { ...f, images: merged };
    });
    setUploadingExtra(false);
    toast.success(`${files.length} image(s) added`);
  };

  const removeExtraImage = (filename) => {
    setForm((f) => ({ ...f, images: f.images.filter(i => i !== filename) }));
  };

  const clearMain = () => { setMainPreview(""); set("thumbnail", ""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        await AdminAxios.put(`/products/${id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await AdminAxios.post("/products", payload);
        toast.success("Product created successfully");
      }
      setTimeout(() => navigate("/admin/products"), 900);
    } catch (err) {
      console.error("Save error:", err);
      const msg = err?.response?.data?.message || err.message || "Unknown error";
      toast.error(`Failed to save: ${msg}`);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={32} color="#d97706" /></div>;

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/products")}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-all">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">{isEdit ? "Edit Product" : "New Product"}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{isEdit ? `Editing #${id}` : "Fill in the details below"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main info */}
        <div className="lg:col-span-2 space-y-6 bg-white rounded-2xl shadow-card p-6">
          <Field label="Product Name *">
            <input required value={form.name}
              onChange={(e) => { set("name", e.target.value); if (!isEdit) set("slug", autoSlug(e.target.value)); }}
              className={inputCls} placeholder="Brass Compass" />
          </Field>

          <Field label="Slug *">
            <input required value={form.slug} onChange={(e) => set("slug", e.target.value)}
              className={inputCls} placeholder="brass-compass" />
          </Field>

          <Field label="Description">
            <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
              className={`${inputCls} resize-none`} placeholder="Product description…" />
          </Field>

          {/* ── Main thumbnail ── */}
          <Field label="Main Thumbnail Image" hint="Recommended: 800×800px square, max 5MB, JPG/PNG/WEBP">
            <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-5 cursor-pointer transition-all
              ${uploadingMain ? "border-amber-300 bg-amber-50" : "border-slate-200 hover:border-amber-400 hover:bg-amber-50"}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleMainImage} disabled={uploadingMain} />
              {uploadingMain
                ? <><ClipLoader size={14} color="#d97706" /><span className="text-sm text-amber-600">Uploading…</span></>
                : <><FiUpload size={16} className="text-slate-400" /><span className="text-sm text-slate-500">Click to upload main image</span></>}
            </label>
            {mainPreview && (
              <div className="relative inline-block mt-2">
                <img src={mainPreview} alt="Main" className="w-28 h-28 object-cover rounded-xl border border-slate-200"
                  onError={(e) => { e.target.src = "/product1.jpg"; }} />
                <button type="button" onClick={clearMain}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
                  <FiX size={10} />
                </button>
              </div>
            )}
            <div className="mt-2">
              <p className="text-xs text-slate-400 mb-1">Or enter existing filename:</p>
              <input value={form.thumbnail}
                onChange={(e) => { set("thumbnail", e.target.value); setMainPreview(e.target.value ? `${imageBase}/${e.target.value}` : ""); }}
                className={inputCls} placeholder="product1.jpg" />
            </div>
          </Field>

          {/* ── Additional images ── */}
          <Field label="Additional Images (Gallery)" hint="Select multiple images at once — all will be added to the product gallery">
            <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-5 cursor-pointer transition-all
              ${uploadingExtra ? "border-amber-300 bg-amber-50" : "border-slate-200 hover:border-amber-400 hover:bg-amber-50"}`}>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImages} disabled={uploadingExtra} />
              {uploadingExtra
                ? <><ClipLoader size={14} color="#d97706" /><span className="text-sm text-amber-600">Uploading…</span></>
                : <><FiPlus size={16} className="text-slate-400" /><span className="text-sm text-slate-500">Click to add multiple gallery images</span></>}
            </label>

            {/* Image grid */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.startsWith("data:") ? img : `${imageBase}/${img}`} alt={`img-${i}`}
                      className="w-full aspect-square object-cover rounded-lg border border-slate-200"
                      onError={(e) => { e.target.src = "/product1.jpg"; }} />
                    {img === form.thumbnail && (
                      <span className="absolute bottom-0.5 left-0.5 bg-amber-600 text-white text-[9px] px-1 rounded font-bold">MAIN</span>
                    )}
                    <button type="button" onClick={() => removeExtraImage(img)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiX size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>

        {/* Right — pricing, stock, settings */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Pricing & Stock</h3>
            <Field label="Price (USD) *">
              <input type="number" required min="0" step="0.01" value={form.price}
                onChange={(e) => set("price", e.target.value)} className={inputCls} placeholder="29.99" />
            </Field>
            <Field label="Original Price (crossed-out)">
              <input type="number" min="0" step="0.01" value={form.old_price}
                onChange={(e) => set("old_price", e.target.value)} className={inputCls} placeholder="39.99" />
            </Field>
            <Field label="Stock Quantity *">
              <input type="number" required min="0" value={form.stock}
                onChange={(e) => set("stock", e.target.value)} className={inputCls} placeholder="50" />
            </Field>
            <Field label="Minimum Order Quantity" hint="Customer must order at least this many">
              <input type="number" min="1" value={form.min_qty}
                onChange={(e) => set("min_qty", parseInt(e.target.value) || 1)} className={inputCls} placeholder="1" />
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
            <div className="space-y-3 pt-1">
              {[
                ["is_active", "Active (visible to customers)"],
                ["is_top", "Featured Product"],
                ["is_new", "New Arrival"],
              ].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={Boolean(form[k])} onChange={(e) => set(k, e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded" />
                  <span className="text-sm text-slate-700">{l}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving || uploadingMain || uploadingExtra}
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
