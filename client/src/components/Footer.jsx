import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  Clock,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { get } from '../api/client';

export default function Footer() {
  const [settings, setSettings] = useState({
    cutoffTime: '11:00 PM',
    orderThrough: 'Wholesome, delicious meals made to nourish your body and power your day.',
    deliveryAreas: 'Moratuwa, Rawathawatta, Katubedda, Angulana, Rathmalana, Suwarapola, Piliyandala',
    paymentMethod: 'COD only'
  });

  useEffect(() => {
    get('/settings').then(data => setSettings(current => ({ ...current, ...data }))).catch(() => {});
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = 'https://wa.me/94712599785?text=Hello%20Healthy%20Bites!%20I%20would%20like%20to%20order%20your%20meals.';

  return (
    <footer className="hb-footer">
      <div className="container hb-footer__outer">
        <section className="hb-footer__cta" aria-labelledby="footer-cta-title">
          <div className="hb-footer__cta-content">
            <span className="hb-footer__eyebrow">
              <Leaf size={16} aria-hidden="true" /> FUEL YOUR FITNESS
            </span>
            <h2 id="footer-cta-title" className="hb-footer__headline">
              <span>Eat well.</span><br />
              Train hard<span className="hb-footer__period">.</span>
            </h2>
            <p className="hb-footer__intro">{settings.orderThrough}</p>
            <div className="hb-footer__actions">
              <Link to="/menu" className="hb-footer__button hb-footer__button--primary">
                Explore Weekly Menu <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hb-footer__button hb-footer__button--outline"
              >
                <MessageCircle size={18} aria-hidden="true" /> Order on WhatsApp
              </a>
            </div>
          </div>

          <div className="hb-footer__visual" aria-hidden="true">
            <div className="hb-footer__visual-glow" />
            <img
              className="hb-footer__weight-image"
              src="/images/hero/weight-10kg.png"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              className="hb-footer__food-image"
              src="/images/hero/gym-meal-plate.png"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <div className="hb-footer__main">
          <div className="hb-footer__brand">
            <BrandLogo className="hb-footer__brand-logo" />
            <p>{settings.orderThrough}</p>
            <div className="hb-footer__assurance">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>Macro-tracked · Zero Preservatives</span>
            </div>
          </div>

          <nav className="hb-footer__column" aria-label="Footer navigation">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/menu">Weekly Meal Menu</Link>
            <Link to="/how-it-works">How Ordering Works</Link>
            <Link to="/cart">Your Shopping Cart</Link>
            <Link to="/about">About Healy Bite</Link>
            <Link to="/contact">Help &amp; Support</Link>
          </nav>

          <div className="hb-footer__column hb-footer__operations">
            <h3>Ordering Information</h3>
            <div className="hb-footer__detail">
              <Clock size={17} aria-hidden="true" />
              <p>
                <strong>Cutoff: {settings.cutoffTime}</strong>
                <span>Order by this time for the next scheduled delivery day.</span>
              </p>
            </div>
            <div className="hb-footer__detail">
              <MapPin size={17} aria-hidden="true" />
              <p><strong>Free delivery areas</strong><span>{settings.deliveryAreas}</span></p>
            </div>
            <div className="hb-footer__detail">
              <ShieldCheck size={17} aria-hidden="true" />
              <p><strong>Payment</strong><span>{settings.paymentMethod}</span></p>
            </div>
          </div>

          <div className="hb-footer__column hb-footer__contact">
            <h3>Get in Touch</h3>
            <a href="tel:+94712599785"><Phone size={17} aria-hidden="true" /> 071 259 9785</a>
            <a href="https://wa.me/94712599785" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp Orders
            </a>
            <a href="mailto:vmsadtharani@gmail.com"><Mail size={17} aria-hidden="true" /> vmsadtharani@gmail.com</a>
            <span className="hb-footer__location"><MapPin size={17} aria-hidden="true" /> Sri Lanka</span>
          </div>
        </div>

        <div className="hb-footer__signature" aria-hidden="true">HEALY BITE</div>

        <div className="hb-footer__bottom">
          <div className="hb-footer__copyright">
            <span>© {new Date().getFullYear()} Healy Bite Sri Lanka. All rights reserved.</span>
            <span className="hb-footer__credit">Designed &amp; Developed by Tharani Jayathura</span>
          </div>
          <div className="hb-footer__bottom-links">
            <span>Made with care in Sri Lanka</span>
            <Link to="/contact">Contact</Link>
          </div>
          <button type="button" className="hb-footer__back-to-top" onClick={scrollToTop} aria-label="Back to top" title="Back to top">
            <ArrowUp size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
