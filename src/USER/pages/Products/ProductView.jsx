import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { FiShoppingCart, FiHeart, FiTruck, FiRefreshCw, FiShield } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import StarRating from "../../components/StarRating";
import ProductCard from "../../components/ProductCard";
import { useDispatch } from "react-redux";
import { addCartItem } from "../../store/slices/cartSlice";
import { addWishlistThunk, removeWishlistThunk } from "../../store/slices/wishListSlice";

const imageURI = import.meta.env.VITE_IMAGE_BASE_URL;

const ProductView = () => {
  const { id, slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      GlobalAxios.get(`/product/${id}/${slug}`),
      GlobalAxios.get("/wishlist"),
    ]).then(([pR, wR]) => {
      const data = pR.data.data;
      setProduct(data.product || data);
      setSimilar(data.similar_products || []);
      setMainImage((data.product || data).thumbnail);
      setWishlist((wR.data.data || []).map((w) => w.product_id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, slug]);

  const isWished = wishlist.includes(parseInt(id));

  const handleCart = async () => {
    setCartLoading(true);
    try {
      const r = await GlobalAxios.post("/cart", { product_id: product.id, quantity: qty });
      if (r.data.status === "success") {
        toast.success("Added to cart!");
        dispatch(addCartItem(product.id));
      }
    } catch { toast.error("Could not add to cart"); }
    finally { setCartLoading(false); }
  };

  const handleWishlist = async () => {
    if (isWished) {
      await dispatch(removeWishlistThunk(product.id));
      setWishlist(wishlist.filter((w) => w !== parseInt(id)));
      toast.info("Removed from wishlist");
    } else {
      await dispatch(addWishlistThunk(product.id));
      setWishlist([...wishlist, parseInt(id)]);
      toast.success("Added to wishlist!");
    }
  };

  if (loading) return <div className="flex justify-center py-24"><ClipLoader size={36} color="#d97706" /></div>;
  if (!product) return <div className="text-center py-24 text-slate-500">Product not found.</div>;

  const images = product.images?.length ? product.images : [product.thumbnail];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToastContainer position="bottom-right" />

      {/* Breadcrumb */}
      <div className="text-sm text-slate-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-3">
            <img src={`${imageURI}/${mainImage}`} alt={product.name}
              onError={(e) => { e.target.src = "/product1.jpg"; }}
              className="w-full h-96 object-contain p-4" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button key={i} onClick={() => setMainImage(img)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${mainImage === img ? "border-amber-500" : "border-slate-200 hover:border-amber-300"}`}>
                <img src={`${imageURI}/${img}`} alt="" onError={(e) => { e.target.src = "/product1.jpg"; }} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">{product.category}</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2 mb-3 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating || 4} />
            <span className="text-xs text-slate-400">({product.reviews_count || 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-slate-800">${product.price}</span>
            {product.old_price && <span className="text-lg text-slate-400 line-through">${product.old_price}</span>}
            {product.old_price && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-lg">
              -{Math.round((1 - product.price / product.old_price) * 100)}% OFF
            </span>}
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Quantity + Buttons */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 text-slate-600 hover:bg-slate-50 text-lg font-medium transition-colors">−</button>
              <span className="px-4 py-2.5 font-semibold text-sm min-w-[40px] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 text-slate-600 hover:bg-slate-50 text-lg font-medium transition-colors">+</button>
            </div>
            <button onClick={handleCart} disabled={cartLoading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 text-sm">
              {cartLoading ? <ClipLoader size={16} color="#fff" /> : <><FiShoppingCart size={15}/> Add to Cart</>}
            </button>
            <button onClick={handleWishlist}
              className="w-11 h-11 border-2 border-slate-200 hover:border-amber-400 rounded-xl flex items-center justify-center transition-all">
              {isWished ? <AiFillHeart size={18} className="text-red-500" /> : <FiHeart size={16} className="text-slate-500" />}
            </button>
          </div>

          {/* Policies */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FiTruck, label: "Free Shipping", sub: "On orders $100+" },
              { icon: FiRefreshCw, label: "14-Day Returns", sub: "Hassle free" },
              { icon: FiShield, label: "Authentic", sub: "100% genuine" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-amber-50 rounded-xl p-3 text-center">
                <Icon size={18} className="text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                <p className="text-[11px] text-slate-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-5">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} wishlist={wishlist}
                onWishlistChange={() => GlobalAxios.get("/wishlist").then((r) => setWishlist((r.data.data || []).map((w) => w.product_id))).catch(() => {})} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductView;
