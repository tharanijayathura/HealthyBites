import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main-grid">
        {/* Column 1: Brand Info */}
        <div className="footer-col">
          <BrandLogo className="mb-4" />
          <p className="mb-4">
            Fuel Your Fitness. Nourish Your Body. Freshly prepared, protein-dense meals designed specifically for athletes, gym-goers, and active individuals in Colombo.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-[#DDE8CB] bg-[#1A2110] border border-[#2C3821] px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-[#6C8C17]" />
            <span>Macro-tracked · Zero Preservatives</span>
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="footer-col">
          <h4>Explore</h4>
          <div className="footer-links-list">
            <Link to="/">Home</Link>
            <Link to="/menu">Weekly Meal Menu</Link>
            <Link to="/how-it-works">How Ordering Works</Link>
            <Link to="/about">About Healy Bite</Link>
            <Link to="/cart">Your Shopping Cart</Link>
            <Link to="/contact">Help &amp; Support</Link>
          </div>
        </div>

        {/* Column 3: Hours & Operational Info */}
        <div className="footer-col">
          <h4>Ordering Hours</h4>
          <div className="flex items-start gap-3 text-sm text-[#A9ADA2] mb-3">
            <Clock size={16} className="text-[#6C8C17] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Cutoff: 8:00 PM</strong>
              <small className="text-xs text-[#A9ADA2]">Orders must be placed by 8:00 PM for next scheduled day deliveries.</small>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm text-[#A9ADA2]">
            <MapPin size={16} className="text-[#6C8C17] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Colombo Kitchen Hub</strong>
              <small className="text-xs text-[#A9ADA2]">Colombo 03 &amp; greater Colombo delivery zones.</small>
            </div>
          </div>
        </div>

        {/* Column 4: Contact Us */}
        <div className="footer-col">
          <h4>Contact &amp; Orders</h4>
          <div className="footer-contact-item">
            <Phone size={16} />
            <a href="tel:+94712599785">071 259 9785</a>
          </div>
          <div className="footer-contact-item">
            <MessageCircle size={16} />
            <a href="https://wa.me/94712599785" target="_blank" rel="noreferrer">
              +94 71 259 9785 (WhatsApp)
            </a>
          </div>
          <div className="footer-contact-item">
            <Mail size={16} />
            <a href="mailto:vmsadtharani@gmail.com">vmsadtharani@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="container footer-bottom-bar">
        <div>
          © {new Date().getFullYear()} Healy Bite Sri Lanka. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>Fresh Weekly Nutrition</span>
          <span>•</span>
          <Link to="/contact" className="hover:text-white">Contact</Link>
          <span>•</span>
          <Link to="/admin" className="text-[#6C8C17] hover:underline">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
