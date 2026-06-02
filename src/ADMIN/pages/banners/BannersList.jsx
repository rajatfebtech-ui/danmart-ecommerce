import React, { useEffect, useState } from "react";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiUpload, FiMove, FiInfo } from "react-icons/fi";

const imageBase = import.meta.env.VITE_IMAGE_BASE_URL;

const EMPTY_BANNER = { image: "", title: "", desc: "", cta: "Shop Now", href: "/" };

const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";

const BannersList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const load = () => {
    setLoading(true);
    AdminAxios.get("/banners")
      .then((r) => setBanners(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setModal({ ...EMPTY_BANNER }); setPreviewUrl(""); };
  const openEdit = (b) => { setModal({ ...b }); setPreviewUrl(b.image ? `${imageBase}/${b.image}` : ""); };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreviewUrl(base64);
      try {
        const res = await AdminAxios.post("/upload-image", { filename: file.name, data: base64 });
        const filename = res.data?.data?.filename || file.name;
        setModal((m) => ({ ...m, image: filename }));
        toast.success("Image uploaded");
      } catch {
        setModal((m) => ({ ...m, image: file.name }));
        toast.info("Image selected: " + file.name);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.id) {
        await AdminAxios.put(`/banners/${modal.id}`, modal);
        toast.success("Banner updated");
      } else {
        await AdminAxios.post("/banners", modal);
        toast.success("Banner created");
      }
      setModal(null);
      load();
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await AdminAxios.delete(`/banners/${id}`);
      toast.success("Deleted");
      setBanners((b) => b.filter((x) => x.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Banners</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage homepage slider banners</p>
        </div>
        <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 text-sm">
          <FiPlus size={15} />Add Banner
        </button>
      </div>

      {/* Size guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <FiInfo size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Recommended Banner Size</p>
          <ul className="space-y-0.5 text-xs">
            <li>• <strong>Desktop:</strong> 1920 × 520 px (wide landscape)</li>
            <li>• <strong>Mobile:</strong> 768 × 300 px</li>
            <li>• <strong>Format:</strong> JPG or WEBP for best performance</li>
            <li>• <strong>Max file size:</strong> 5MB</li>
            <li>• Use high-contrast images — text is overlaid on left side</li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><ClipLoader size={32} color="#d97706" /></div>
      ) : (
        <div className="space-y-4">
          {banners.length === 0 && (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center text-slate-400">
              <FiMove size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No banners yet. Click "Add Banner" to create one.</p>
            </div>
          )}
          {banners.map((b, i) => (
            <div key={b.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Banner preview */}
                <div className="relative sm:w-72 h-36 flex-shrink-0 bg-slate-100">
                  <img
                    src={b.image?.startsWith("http") ? b.image : `${imageBase}/${b.image}`}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "/banner.jpeg"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center pl-4">
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{b.title}</p>
                      <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">{b.desc}</p>
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    #{i + 1}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{b.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{b.desc}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">CTA: {b.cta}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono truncate max-w-[160px]">{b.href}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all">
                      <FiEdit2 size={13} />Edit
                    </button>
                    <button onClick={() => handleDelete(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-all">
                      <FiTrash2 size={13} />Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">{modal.id ? "Edit Banner" : "New Banner"}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image</label>
                <p className="text-xs text-slate-400 mb-2">Recommended: 1920×520px, JPG/WEBP, max 5MB</p>
                <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-5 cursor-pointer transition-all
                  ${uploading ? "border-amber-300 bg-amber-50" : "border-slate-200 hover:border-amber-400 hover:bg-amber-50"}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
                  {uploading
                    ? <><ClipLoader size={14} color="#d97706" /><span className="text-sm text-amber-600">Uploading…</span></>
                    : <><FiUpload size={16} className="text-slate-400" /><span className="text-sm text-slate-500">Click to upload banner image</span></>
                  }
                </label>
                {previewUrl && (
                  <img src={previewUrl} alt="preview" className="w-full h-28 object-cover rounded-xl mt-2 border border-slate-200"
                    onError={(e) => { e.target.src = "/banner.jpeg"; }} />
                )}
                <input value={modal.image} onChange={(e) => { setModal({ ...modal, image: e.target.value }); setPreviewUrl(e.target.value ? `${imageBase}/${e.target.value}` : ""); }}
                  className={`${inputCls} mt-2`} placeholder="Or enter filename: banner.jpeg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input required value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })}
                  className={inputCls} placeholder="Discover Rare Antiques" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <input value={modal.desc} onChange={(e) => setModal({ ...modal, desc: e.target.value })}
                  className={inputCls} placeholder="Authentic collectibles curated from around the world" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Button Text</label>
                  <input value={modal.cta} onChange={(e) => setModal({ ...modal, cta: e.target.value })}
                    className={inputCls} placeholder="Shop Now" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Button Link</label>
                  <input value={modal.href} onChange={(e) => setModal({ ...modal, href: e.target.value })}
                    className={inputCls} placeholder="/category/1/antiques" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={saving || uploading}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <ClipLoader size={12} color="#fff" /> : <FiCheck size={13} />}
                  {modal.id ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersList;
