import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlobalAxios from "../../../Global/GlobalAxios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import StarRating from "../components/StarRating";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const WishList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(null);

  const fetchWishlist = () => {
    GlobalAxios.get("/wishlist").then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const addToCart = async (productId) => {
    setCartLoading(productId);
    try {
      const r = await GlobalAxios.post("/cart", { product_id: productId, quantity: 1 });
      if (r.data.status === "success") toast.success("Added to cart!");
    } catch { toast.error("Could not add to cart"); }
    finally { setCartLoading(null); }
  };

  const removeFromWishlist = async (productId) => {
    await GlobalAxios.delete(`/wishlist/${productId}`);
    toast.info("Removed from wishlist");
    fetchWishlist();
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToastContainer position="bottom-right" />
      <h1 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2"><FiHeart className="text-amber-600"/> My Wishlist <span className="text-slate-400 font-normal text-lg">({items.length})</span></h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <FiHeart size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-5">Your wishlist is empty</p>
          <Link to="/" className="bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm inline-block">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => {
            const p = item.product || {};
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <Link to={`/products/${p.id}/${p.slug}`}>
                    <img src={`${imageURI}/${p.thumbnail}`} alt={p.name}
                      onError={(e) => { e.target.src = "/product1.jpg"; }}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <button onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors">
                    <FiTrash2 size={15} className="text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={`/products/${p.id}/${p.slug}`}>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 hover:text-amber-700 mb-2">{p.name}</h3>
                  </Link>
                  <StarRating rating={p.rating || 4} />
                  <div className="flex items-baseline gap-1.5 mt-2 mb-3">
                    <span className="font-bold text-slate-800">${p.price}</span>
                    {p.old_price && <span className="text-sm text-slate-400 line-through">${p.old_price}</span>}
                  </div>
                  <button onClick={() => addToCart(item.product_id)} disabled={cartLoading === item.product_id}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm active:scale-95">
                    {cartLoading === item.product_id ? <ClipLoader size={15} color="#fff" /> : <><FiShoppingCart size={14}/> Add to Cart</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishList;
