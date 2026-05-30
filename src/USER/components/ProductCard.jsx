import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { ClipLoader } from "react-spinners";
import StarRating from "./StarRating";
import GlobalAxios from "../../../Global/GlobalAxios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addCartItem } from "../store/slices/cartSlice";
import { addWishlistThunk, removeWishlistThunk } from "../store/slices/wishListSlice";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const ProductCard = ({ product, wishlist = [], onWishlistChange }) => {
  const dispatch = useDispatch();
  const [cartLoading, setCartLoading] = useState(false);
  const isWished = wishlist.includes(product.id);

  const handleCart = async (e) => {
    e.preventDefault();
    setCartLoading(true);
    try {
      const r = await GlobalAxios.post("/cart", { product_id: product.id, quantity: 1 });
      if (r.data.status === "success") {
        toast.success("Added to cart!");
        dispatch(addCartItem(product.id));
      }
    } catch { toast.error("Could not add to cart"); }
    finally { setCartLoading(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (isWished) {
      await dispatch(removeWishlistThunk(product.id));
      toast.info("Removed from wishlist");
    } else {
      await dispatch(addWishlistThunk(product.id));
      toast.success("Added to wishlist!");
    }
    onWishlistChange?.();
  };

  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.id}/${product.slug}`}>
          <img
            src={`${imageURI}/${product.thumbnail}`}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = "/product1.jpg"; }}
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
        )}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center shadow-sm transition-all hover:scale-110">
          {isWished
            ? <AiFillHeart size={18} className="text-red-500" />
            : <FiHeart size={16} className="text-slate-500" />
          }
        </button>
      </div>

      <div className="p-4">
        <Link to={`/products/${product.id}/${product.slug}`}>
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 hover:text-amber-700 transition-colors leading-snug mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.rating || 4} />
          <span className="text-xs text-slate-400">({product.reviews_count || 0})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-800">${product.price}</span>
            {product.old_price && <span className="text-sm text-slate-400 line-through">${product.old_price}</span>}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-amber-600 font-medium">Only {product.stock} left</span>
          )}
        </div>
        <button onClick={handleCart} disabled={cartLoading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm active:scale-95 disabled:opacity-60">
          {cartLoading ? <ClipLoader size={16} color="#fff" /> : <><FiShoppingCart size={15}/> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
