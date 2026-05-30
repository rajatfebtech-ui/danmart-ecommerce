import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../../store/slices/productsSlice";
import { ClipLoader } from "react-spinners";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GlobalAxios from "../../../../Global/GlobalAxios";
import ProductCard from "../ProductCard";

const Products = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.products);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => { dispatch(fetchProductsThunk()); }, [dispatch]);

  const loadWishlist = () => {
    GlobalAxios.get("/wishlist")
      .then((r) => setWishlist((r.data.data || []).map((w) => w.product_id)))
      .catch(() => {});
  };
  useEffect(loadWishlist, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <ClipLoader size={40} color="#d97706" />
    </div>
  );

  if (error) return <p className="text-center py-12 text-red-500">Error loading products.</p>;

  return (
    <>
      <ToastContainer position="bottom-right" />
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Our Products</h2>
        <p className="text-sm text-slate-500 mb-6">Explore our curated collection of rare antiques</p>
        {items.length === 0 ? (
          <p className="text-center py-16 text-slate-400">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} wishlist={wishlist} onWishlistChange={loadWishlist} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
