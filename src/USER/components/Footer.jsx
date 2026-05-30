import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="text-2xl font-black text-white">
            Dan<span className="text-amber-400">Mart</span>
            <span className="text-sm font-light text-slate-400 ml-1">Global</span>
          </Link>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Your premier destination for authentic antiques, compasses, and rare collectibles from around the world.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-slate-700 hover:bg-amber-600 flex items-center justify-center transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[["Home", "/"], ["About Us", "/about"], ["Contact Us", "/contact"], ["Track Order", "/track"], ["My Orders", "/orders"]].map(([label, path]) => (
              <li key={path}>
                <NavLink to={path} className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-white font-semibold mb-4">Customer Service</h4>
          <ul className="space-y-2.5">
            {[["Shopping Cart", "/cart"], ["Wishlist", "/wishlist"], ["Checkout", "/checkout"], ["Order History", "/orders"]].map(([label, path]) => (
              <li key={path}>
                <NavLink to={path} className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-slate-400">
              <FiMapPin size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              43 Old Tehsil Rampur Road, Roorkee 247667, INDIA
            </li>
            <li>
              <a href="tel:+919837184618" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                <FiPhone size={13} className="text-amber-400 flex-shrink-0" /> +91 9837184618
              </a>
            </li>
            <li>
              <a href="mailto:danmartglobal@gmail.com" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-amber-400 transition-colors">
                <FiMail size={13} className="text-amber-400 flex-shrink-0" /> danmartglobal@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} DanMart Global. All Rights Reserved.</span>
          <span>Made with ♥ by FEBTECH IT Solutions</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
