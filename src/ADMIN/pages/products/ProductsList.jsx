import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminAxios from "../../../../Global/AdminAxios";
import { ClipLoader } from "react-spinners";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    AdminAxios.get("/products").then((r) => setProducts(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await AdminAxios.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch { toast.error("Failed to delete"); }
    setDeleting(null);
  };

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <ToastContainer position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary inline-flex items-center gap-2 text-sm">
          <FiPlus size={15} />Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
        <div className="relative max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><ClipLoader size={32} color="#d97706" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-12">No products found</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={`${imageURI}/${p.thumbnail}`} alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = "/product1.jpg"; }} />
                        <div>
                          <p className="font-medium text-slate-800 truncate max-w-[160px]">{p.name}</p>
                          <p className="text-xs text-slate-400">#{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{p.category_name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">${parseFloat(p.price).toFixed(2)}</p>
                      {p.old_price && <p className="text-xs text-slate-400 line-through">${parseFloat(p.old_price).toFixed(2)}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={p.stock > 5 ? "badge-green" : p.stock > 0 ? "badge-amber" : "badge-red"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={p.is_active !== false ? "badge-green" : "badge-gray"}>
                        {p.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/edit/${p.id}`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                          <FiEdit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                          className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
