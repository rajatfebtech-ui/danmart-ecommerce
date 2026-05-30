import React, { useEffect, useState } from "react";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { ClipLoader } from "react-spinners";
import { ToastContainer } from "react-toastify";
import ProductCard from "../../components/ProductCard";

const TopProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([GlobalAxios.get("/product/top"), GlobalAxios.get("/wishlist")])
      .then(([pR, wR]) => { setProducts(pR.data.data || []); setWishlist((wR.data.data || []).map((w) => w.product_id)); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToastContainer position="bottom-right" />
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Top Products</h1>
      <p className="text-sm text-slate-500 mb-8">Our best-selling items loved by collectors worldwide</p>
      {loading ? <div className="flex justify-center py-16"><ClipLoader size={36} color="#d97706" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} wishlist={wishlist}
              onWishlistChange={() => GlobalAxios.get("/wishlist").then((r) => setWishlist((r.data.data || []).map((w) => w.product_id))).catch(() => {})} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProductsPage;
