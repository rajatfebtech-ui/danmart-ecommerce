import React from 'react';
import { Link } from 'react-router-dom';

const Banner2 = ({ src, title }) => (
  <div className="w-full h-[280px] my-8 overflow-hidden relative">
    <img src={src} alt={title} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/30 flex flex-col items-center justify-center text-white text-center px-4">
      <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">Featured Collection</span>
      <h2 className="text-2xl md:text-4xl font-black mb-3 max-w-2xl">{title}</h2>
      <p className="text-slate-300 text-sm mb-5 max-w-md">Explore our handpicked selection of premium antiques and collectibles</p>
      <Link to="/feature-products"
        className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-7 py-2.5 rounded-xl transition-all hover:shadow-lg text-sm active:scale-95">
        Shop Now →
      </Link>
    </div>
  </div>
);

export default Banner2;
