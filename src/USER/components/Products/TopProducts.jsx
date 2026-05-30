import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ClipLoader } from "react-spinners";
import { ToastContainer } from "react-toastify";
import GlobalAxios from "../../../../Global/GlobalAxios";
import ProductCard from "../ProductCard";

const sliderSettings = {
  dots: true, infinite: true, speed: 500, slidesToShow: 3, slidesToScroll: 1,
  autoplay: true, autoplaySpeed: 3500,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768,  settings: { slidesToShow: 2 } },
    { breakpoint: 480,  settings: { slidesToShow: 1 } },
  ],
};

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      GlobalAxios.get("/product/top"),
      GlobalAxios.get("/wishlist"),
    ]).then(([pR, wR]) => {
      setProducts(pR.data.data || []);
      setWishlist((wR.data.data || []).map((w) => w.product_id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><ClipLoader size={36} color="#d97706" /></div>;

  return (
    <section className="py-12">
      <ToastContainer position="bottom-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Best Sellers</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">Top Products</h2>
          <p className="text-slate-500 text-sm mt-1">Our most loved items by collectors worldwide</p>
        </div>
        <Slider {...sliderSettings} className="px-1">
          {products.map((p) => (
            <div key={p.id} className="px-3">
              <ProductCard product={p} wishlist={wishlist} onWishlistChange={() =>
                GlobalAxios.get("/wishlist").then((r) => setWishlist((r.data.data || []).map((w) => w.product_id))).catch(() => {})} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default TopProducts;
