import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogIn, Shield, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { itemCount } = useCart();
  const { user, admin, logoutCustomer, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      setHeaderHidden(currentScrollY > lastScrollY.current && currentScrollY > 80);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await logoutCustomer();
    navigate('/');
  };

  return (
    <header className={`site-header ${scrolled ? 'header-scrolled shadow-2xl' : ''} ${headerHidden ? 'header-hidden' : ''}`}>
      <div className="container nav-wrap">
        {/* Brand Logo */}
        <BrandLogo />

        {/* Desktop Navigation */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? 'active' : ''}>
            Weekly Menu
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => isActive ? 'active' : ''}>
            How It Works
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
            Contact
          </NavLink>
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          {/* Cart Icon: Only shown if there are items in the cart and not on admin pages */}
          {!isAdminRoute && itemCount > 0 && (
            <Link
              to="/cart"
              className="cart-btn animate-fade-in"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag size={18} className="text-[#6C8C17]" />
                <span className="cart-badge">{itemCount}</span>
              </div>
              <span className="font-semibold text-xs hidden sm:inline text-[#DDE8CB]">Cart</span>
            </Link>
          )}

          {/* User Auth Pill */}
          {!isAdminRoute && !admin && (
            <>
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-[#1A2110] animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A2110] border border-[#2C3821] hover:border-[#6C8C17] text-xs font-semibold text-[#DDE8CB] transition-all"
                    title={user.name}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#2C3821] flex items-center justify-center text-[#6C8C17] font-bold text-[11px]">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-27.5 truncate hidden md:inline">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-[#A9ADA2] hover:text-[#FFB3A8] p-1.5 transition-colors hidden sm:block"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-outline btn-sm text-xs font-semibold flex items-center gap-1.5"
                >
                  <LogIn size={14} className="text-[#6C8C17]" />
                  <span>Sign In</span>
                </Link>
              )}
            </>
          )}

          {/* Admin link pill if logged in as admin */}
          {admin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#263117] border border-[#6C8C17] text-xs font-bold text-[#DDE8CB] hover:bg-[#3C7100]/40 transition-colors"
            >
              <Shield size={13} className="text-[#6C8C17]" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slideout Drawer */}
      {mobileOpen && (
        <div className="mobile-nav-drawer" role="navigation" aria-label="Mobile Navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? 'active' : ''}>
            Weekly Menu
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => isActive ? 'active' : ''}>
            How It Works
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
            Contact
          </NavLink>

          {itemCount > 0 && (
            <Link to="/cart" className="flex items-center justify-between text-sm py-2 text-[#DDE8CB]">
              <span className="flex items-center gap-2">
                <ShoppingBag size={17} className="text-[#6C8C17]" /> Shopping Cart
              </span>
              <span className="cart-badge">{itemCount}</span>
            </Link>
          )}

          {user ? (
            <div className="pt-3 border-t border-[#2C3821] flex flex-col gap-2">
              <Link to="/account" className="flex items-center gap-2 text-sm text-[#DDE8CB]">
                <User size={16} className="text-[#6C8C17]" />
                <span>My Profile ({user.name})</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs text-[#A9ADA2] hover:text-[#FFB3A8] py-1 text-left"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : !admin ? (
            <div className="pt-3 border-t border-[#2C3821] flex items-center justify-between">
              <Link to="/login" className="btn btn-primary btn-sm text-xs">
                Customer Sign In
              </Link>
              <Link to="/register" className="text-xs text-[#DDE8CB] hover:underline">
                Create Account
              </Link>
            </div>
          ) : null}

          <div className="pt-2 border-t border-[#2C3821] flex items-center justify-between">
            <span className="text-xs text-[#A9ADA2]">Staff Access</span>
            <Link to={admin ? '/admin' : '/admin/login'} className="text-xs text-[#6C8C17] hover:underline flex items-center gap-1">
              <Shield size={12} /> {admin ? 'Dashboard' : 'Admin Login'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
