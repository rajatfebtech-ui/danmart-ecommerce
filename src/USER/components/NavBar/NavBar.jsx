import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiChevronDown, FiLogOut, FiPackage } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import GlobalAxios from "../../../../Global/GlobalAxios";
import { logout } from "../../store/slices/authSlice";

const NavBar = () => {
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const catRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    GlobalAxios.get("/product-categories").then((r) => setCategories(r.data.data || [])).catch(() => {});
    GlobalAxios.get("/cart").then((r) => setCartCount(r.data.data?.items?.length || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    dispatch(logout());
    setUserOpen(false);
    navigate("/");
  };

  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        {/* Categories */}
        <div ref={catRef} className="relative hidden md:block flex-shrink-0">
          <button onClick={() => setCatOpen(!catOpen)}
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors whitespace-nowrap border border-amber-200">
            All Categories <FiChevronDown size={13} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
          </button>
          {catOpen && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              {categories.map((c) => (
                <Link key={c.id} to={`/category/${c.id}/${c.slug}`} onClick={() => setCatOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search antiques, compasses, telescopes…"
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50" />
          </div>
        </form>

        <div className="flex items-center gap-0.5 ml-auto">
          <Link to="/wishlist" className="relative p-2.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors">
            <FiHeart size={19} />
          </Link>
          <Link to="/cart" className="relative p-2.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors">
            <FiShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber-600 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                {cartCount}
              </span>
            )}
          </Link>
          <div ref={userRef} className="relative">
            <button onClick={() => setUserOpen(!userOpen)}
              className="p-2.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors">
              <FiUser size={19} />
            </button>
            {userOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                {isLoggedIn ? (
                  <>
                    <Link to="/orders" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors">
                      <FiPackage size={13}/> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors">
                      <FiHeart size={13}/> Wishlist
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <FiLogOut size={13}/> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors">Sign In</Link>
                    <Link to="/signup" onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Create Account</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
