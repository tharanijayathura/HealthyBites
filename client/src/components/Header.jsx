import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Leaf, Dumbbell, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className={`site-header ${scrolled ? 'header-scrolled shadow-xl' : ''}`}>
      <div className="container nav-wrap">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="Healy Bite Home">
          <div className="brand-icon-box">
            <Leaf size={22} className="text-[#6C8C17]" />
          </div>
          <span>
            Healy<span className="brand-leaf">Bite.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? 'active' : ''}>
            Weekly Menu
          </NavLink>
          <a href="/#how-it-works" onClick={() => setMobileOpen(false)}>
            How It Works
          </a>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
            Contact
          </NavLink>
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          <Link to="/cart" className="cart-btn" aria-label={`Shopping cart with ${itemCount} items`}>
            <ShoppingBag size={18} className="text-[#6C8C17]" />
            <span className="font-semibold text-sm hidden sm:inline">Cart</span>
            <span className="cart-badge">{itemCount}</span>
          </Link>

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
          <a href="/#how-it-works" onClick={() => setMobileOpen(false)}>
            How It Works
          </a>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
            Contact
          </NavLink>
          <Link to="/cart" className="flex items-center justify-between text-sm py-2 text-[#DDE8CB]">
            <span>Shopping Cart</span>
            <span className="cart-badge">{itemCount}</span>
          </Link>
          <div className="pt-2 border-t border-[#2C3821] flex items-center justify-between">
            <span className="text-xs text-[#A9ADA2]">Management</span>
            <Link to="/admin" className="text-xs text-[#6C8C17] hover:underline">
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
