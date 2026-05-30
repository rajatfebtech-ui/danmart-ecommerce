import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import ProductCard from "../../components/ProductCard";
import { FiBookmark } from "react-icons/fi";

const ProductCategories = () => {
  const { id, slug } = useParams();
  const [items, setItems] = useState([]);
  const [catName, setCatName] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([
      GlobalAxios.get(`/product-categories/${slug}`),
      GlobalAxios.get("/wishlist"),
    ]).then(([cR, wR]) => {
      setItems(cR.data.data?.products || []);
      setCatName(cR.data.data?.category?.name || "");
      setWishlist((wR.data.data || []).map((w) => w.product_id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, slug]);

  const handleCatalog = async () => {
    if (!Cookies.get("authToken")) { toast.error("Please login first"); navigate("/login"); return; }
    try {
      await GlobalAxios.post("/quotations", { category_id: id });
      toast.success("Catalog request submitted!");
    } catch { toast.error("Failed to submit catalog request"); }
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>;

  return (
    <>
      <ToastContainer position="bottom-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{catName || "Category"}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} products found</p>
        </div>
        <button onClick={handleCatalog}
          className="flex items-center gap-2 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <FiBookmark size={14}/> Request Catalog
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-center py-16 text-slate-400">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} wishlist={wishlist}
              onWishlistChange={() => GlobalAxios.get("/wishlist").then((r) => setWishlist((r.data.data || []).map((w) => w.product_id))).catch(() => {})} />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductCategories;
