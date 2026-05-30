import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../store/slices/productsSlice";
import ProductCard from "./ProductCard";
import GlobalAxios from "../../../Global/GlobalAxios";
import { ToastContainer } from "react-toastify";

const SimilarProducts = () => {
  const dispatch = useDispatch();
  const products = useSelector((s) => s.products.items);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    dispatch(fetchProductsThunk());
    GlobalAxios.get("/wishlist").then((r) => setWishlist((r.data.data || []).map((w) => w.product_id))).catch(() => {});
  }, [dispatch]);

  if (!products.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToastContainer position="bottom-right" />
      <h2 className="text-xl font-bold text-slate-800 mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} wishlist={wishlist}
            onWishlistChange={() => GlobalAxios.get("/wishlist").then((r) => setWishlist((r.data.data || []).map((w) => w.product_id))).catch(() => {})} />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
