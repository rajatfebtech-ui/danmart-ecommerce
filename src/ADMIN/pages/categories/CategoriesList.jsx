import React, { useEffect, useState } from "react";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { id?, name, slug, description }
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    AdminAxios.get("/categories").then((r) => setCategories(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => setModal({ name: "", slug: "", description: "" });
  const openEdit = (c) => setModal({ ...c });

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.id) {
        await AdminAxios.put(`/categories/${modal.id}`, modal);
        toast.success("Category updated");
      } else {
        await AdminAxios.post("/categories", modal);
        toast.success("Category created");
      }
      setModal(null);
      load();
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await AdminAxios.delete(`/categories/${id}`);
      toast.success("Deleted");
      setCategories((c) => c.filter((x) => x.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 text-sm"><FiPlus size={15} />New Category</button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><ClipLoader size={32} color="#d97706" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Slug</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-slate-400 py-12">No categories yet</td></tr>
              ) : categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-5 py-3.5 text-slate-500 truncate max-w-xs">{c.description || "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">{modal.id ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                <input required value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value, slug: modal.id ? modal.slug : autoSlug(e.target.value) })}
                  className={inputCls} placeholder="Antiques" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug *</label>
                <input required value={modal.slug} onChange={(e) => setModal({ ...modal, slug: e.target.value })} className={inputCls} placeholder="antiques" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea rows={2} value={modal.description || ""} onChange={(e) => setModal({ ...modal, description: e.target.value })}
                  className={`${inputCls} resize-none`} placeholder="Short description…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
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

export default CategoriesList;
