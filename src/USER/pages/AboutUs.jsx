import React from "react";
import { Link } from "react-router-dom";
import { FiAward, FiGlobe, FiUsers, FiStar } from "react-icons/fi";

const stats = [
  { icon: FiGlobe, label: "Countries Served", value: "25+" },
  { icon: FiAward, label: "Years of Experience", value: "15+" },
  { icon: FiUsers, label: "Happy Customers", value: "10K+" },
  { icon: FiStar, label: "Curated Products", value: "500+" },
];

const AboutUs = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    {/* Hero */}
    <div className="text-center mb-14">
      <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Our Story</span>
      <h1 className="text-4xl font-black text-slate-800 mt-2 mb-4">About DanMart Global</h1>
      <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
        At DanMart, we've curated an immersive experience that transcends traditional shopping — a gateway to another era through authentic antiques and rare collectibles.
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-white rounded-2xl shadow-card p-6 text-center">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Icon size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
      ))}
    </div>

    {/* Story */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-14">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Company</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          Every item in our carefully curated collection is not just an object — it's a gateway to another era, meticulously selected to showcase the epitome of craftsmanship, unparalleled elegance, and enduring beauty.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Here, each artifact tells a story, weaving together the rich tapestry of human history and culture, inviting you to embark on a journey through time and aesthetics. Discover a world where the past and present coalesce, and every acquisition becomes a cherished piece of heritage.
        </p>
        <Link to="/contact" className="inline-flex items-center gap-2 mt-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm active:scale-95">
          Get in Touch
        </Link>
      </div>
      <div>
        <img src="about.webp" alt="About DanMart" className="rounded-2xl shadow-card w-full h-72 object-cover" />
      </div>
    </div>

    {/* Products highlight */}
    <div className="bg-amber-50 rounded-2xl p-8 lg:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <img src="product1.jpg" alt="Featured Product" className="rounded-2xl shadow-card w-full h-64 object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Brass Compass — Our Signature</h2>
          <p className="text-slate-600 leading-relaxed">
            Leather casing provides protection and adds a touch of elegance. Engraved with the inspiring quote "Go Confidently" for added motivation. Perfect gift choice for hikers, travelers, and loved ones with a passion for exploration.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">
            Shop Now →
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default AboutUs;
