import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  Dumbbell,
  Calendar,
  MessageCircle,
  Flame,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { get } from '../api/client';
import { demoMeals } from '../data/demoMeals';
import { money } from '../utils/money';
import { upcomingDatesForDay, formatDate } from '../utils/dates';
import MealCard from '../components/MealCard';

const faqs = [
  {
    q: 'How does weekly meal ordering work with Healy Bite?',
    a: 'We offer specialized, macro-balanced menus for each day of the week (Monday through Sunday). You can browse the days, select upcoming delivery dates up to 4 weeks in advance, add meals to your cart, and submit your order details via WhatsApp.'
  },
  {
    q: 'How does WhatsApp checkout work?',
    a: 'When you submit the checkout form, our system validates your meals, dates, and prices, creates a pending order code, and generates a formatted order summary. WhatsApp will open with this message pre-filled. You simply press Send in WhatsApp, and our team verifies and confirms your order directly.'
  },
  {
    q: 'What is the order cutoff time for next-day delivery?',
    a: 'Orders for any scheduled delivery day close at 8:00 PM the evening before. This allows our culinary team to source fresh local ingredients and prepare your meals fresh each morning.'
  },
  {
    q: 'Where do you deliver in Sri Lanka?',
    a: 'We currently deliver throughout Colombo (Colombo 01–15) and surrounding suburbs. You can also opt for self-pickup from our Colombo 03 kitchen hub with zero delivery fee.'
  },
  {
    q: 'Are nutritional macros accurately measured?',
    a: 'Yes, each meal is portioned according to standardized recipes with high-protein sources, complex carbohydrates, and clean fats so you can accurately track your daily macros.'
  }
];

export default function Home() {
  const [featuredMeals, setFeaturedMeals] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [revealProgress, setRevealProgress] = useState(0);

  const heroTrackRef = useRef(null);

  useEffect(() => {
    const heroTrack = heroTrackRef.current;
    if (!heroTrack) return undefined;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = null;

    const updateRevealProgress = () => {
      frameId = null;
      if (reducedMotionQuery.matches) {
        setRevealProgress(0);
        return;
      }

      const scrollDistance = Math.max(heroTrack.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -heroTrack.getBoundingClientRect().top / scrollDistance));
      setRevealProgress(progress);
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateRevealProgress);
      }
    };

    updateRevealProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    reducedMotionQuery.addEventListener('change', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      reducedMotionQuery.removeEventListener('change', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    get('/meals')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedMeals(data.slice(0, 3));
        } else {
          setFeaturedMeals(demoMeals.slice(0, 3));
        }
      })
      .catch(() => {
        setFeaturedMeals(demoMeals.slice(0, 3));
      });
  }, []);

  return (
    <>
      {/* 1. CINEMATIC HERO SECTION WITH SCROLL-DRIVEN PLATE REVEAL */}
      <section ref={heroTrackRef} className="hero-scroll-section">
        <div className="hero-wrapper">
        <div
          className="hero-bg-overlay"
          style={{ backgroundImage: `url('/images/hero/hero-background.png')` }}
        />

        <div className="container hero-grid">
          {/* Left Copy */}
          <div className="hero-content">
            <span className="eyebrow">
              <Leaf size={16} className="text-[#6C8C17]" />
              FUEL YOUR FITNESS. NOURISH YOUR BODY.
            </span>

            <h1>
              Fuel your fitness.<br />
              <em>One healthy bite</em> at a time.
            </h1>

            <p className="hero-subtitle">
              Discover delicious, protein-rich meals prepared to support your active lifestyle.
              Choose your favorite meals and order easily through WhatsApp.
            </p>

            <div className="hero-cta-group">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Explore This Week's Menu <ArrowRight size={19} />
              </Link>
              <Link to="/how-it-works" className="btn btn-outline btn-lg">
                How It Works
              </Link>
            </div>

            {/* Quick Hero Metrics */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <strong>45g+</strong>
                <span>Avg Protein / Meal</span>
              </div>
              <div className="hero-stat-item">
                <strong>100%</strong>
                <span>Fresh &amp; Wholesome</span>
              </div>
              <div className="hero-stat-item">
                <strong>07 Days</strong>
                <span>Weekly Rotation</span>
              </div>
            </div>
          </div>

          {/* Right Plate Showcase — SCROLL-DRIVEN CIRCULAR REVEAL */}
          <div className="hero-showcase" aria-label="Gym meal plate revealed as you scroll">
            <div className="plate-halo">
              <div className="plate-outer-glow" />

              <div className="plate-disc">
                <img
                  src="/images/hero/weight-10kg.png"
                  alt="10 kilogram gym weight plate"
                  className="plate-image"
                  draggable={false}
                />
                <img
                  src="/images/hero/gym-meal-plate.png"
                  alt="Gym meal plate with grilled chicken, rice, avocado, and vegetables"
                  className="plate-image plate-food-image"
                  style={{ '--reveal-angle': `${revealProgress * 360}deg` }}
                  draggable={false}
                />
              </div>

              <div
                className="floating-badge-top plate-food-detail"
                style={{ '--food-detail-opacity': revealProgress }}
              >
                HIGH PROTEIN
              </div>

              <div
                className="floating-detail-pill floating-detail-left plate-food-detail"
                style={{ '--food-detail-opacity': revealProgress }}
              >
                LEAN FUEL
              </div>

              <div
                className="floating-macro-card plate-food-detail"
                style={{ '--food-detail-opacity': revealProgress }}
              >
                <div className="macro-icon">
                  <Flame size={20} />
                </div>
                <div>
                  <strong className="text-sm block text-white font-bold leading-tight">
                    Grilled Chicken &amp; Steamed Greens
                  </strong>
                  <span className="text-xs text-[#DDE8CB]">
                    52g Protein · 520 kcal
                  </span>
                </div>
              </div>

              <div
                className="floating-detail-pill floating-detail-bottom plate-food-detail"
                style={{ '--food-detail-opacity': revealProgress }}
              >
                FRESH DAILY
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 2. INTRODUCTION & BRAND VALUE PROPOSITION */}
      <section className="container section-py">
        <div className="section-header text-center">
          <span className="eyebrow">
            <Sparkles size={16} /> THE HEALY BITE STANDARD
          </span>
          <h2>
            Nutrition engineered for <span className="brand-leaf">real performance.</span>
          </h2>
          <p>
            Whether you are bulking, cutting, or maintaining peak daily energy, our chef-prepared meals take the guesswork out of healthy eating.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Leaf size={26} />
            </div>
            <h3>Freshly Prepared Meals</h3>
            <p>
              Cooked fresh in small culinary batches using quality meats, fresh produce, and whole grains. Never frozen.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Dumbbell size={26} />
            </div>
            <h3>Protein-Focused Choices</h3>
            <p>
              Packed with 40g to 55g of high-quality lean protein per box to support intensive training and lean muscle growth.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Calendar size={26} />
            </div>
            <h3>Convenient Weekly Ordering</h3>
            <p>
              A thoughtfully planned 7-day rotating menu allowing you to plan upcoming meals across the entire month.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <MessageCircle size={26} />
            </div>
            <h3>Simple WhatsApp Checkout</h3>
            <p>
              Select your favorite meals, build your cart, and place orders directly with our team via WhatsApp in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED MEALS PREVIEW */}
      <section className="container section-py pt-0">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="eyebrow">POPULAR ATHLETE PICKS</span>
            <h2>Featured Gym Meals</h2>
            <p className="text-[#A9ADA2] text-sm">Crafted for balanced macros and unforgettable flavor.</p>
          </div>
          <Link to="/menu" className="btn btn-outline">
            Browse All 7 Days <ArrowRight size={17} />
          </Link>
        </div>

        <div className="meal-grid">
          {featuredMeals.map(meal => (
            <MealCard
              key={meal._id}
              meal={meal}
              deliveryDate={upcomingDatesForDay(meal.availableDays?.[0] || 'Monday')[0]}
            />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="container section-py">
        <div className="section-header text-center">
          <span className="eyebrow">
            <Clock size={16} /> SEAMLESS WORKFLOW
          </span>
          <h2>How Ordering Works</h2>
          <p>Getting freshly prepped gym nutrition delivered to your door is effortless.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num-badge">01</div>
            <h3>Choose Day &amp; Date</h3>
            <p>
              Explore our Monday through Sunday menu and pick your desired upcoming delivery dates.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">02</div>
            <h3>Customize Your Cart</h3>
            <p>
              Select portion sizes and add meals tailored to your personal caloric and macronutrient targets.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">03</div>
            <h3>Checkout via WhatsApp</h3>
            <p>
              Enter your contact details and hit "Place Order via WhatsApp" to open your pre-filled order draft.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">04</div>
            <h3>Verified &amp; Delivered</h3>
            <p>
              Our team verifies the details, cooks your meal fresh on delivery day, and delivers it directly to you.
            </p>
          </div>
        </div>
      </section>

      {/* 5. QUALITY BANNER (Atmospheric Gym Theme) */}
      <section className="container mb-24">
        <div
          className="relative rounded-3xl overflow-hidden border border-[#2C3821] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: `linear-gradient(135deg, rgba(26, 33, 16, 0.95) 0%, rgba(13, 14, 3, 0.98) 100%)`
          }}
        >
          <div className="max-w-xl">
            <span className="eyebrow">
              <ShieldCheck size={16} /> COMMITTED TO EXCELLENCE
            </span>
            <h2 className="text-3xl font-bold mb-4">
              Pure Ingredients. Zero Fillers.
            </h2>
            <p className="text-[#A9ADA2] text-sm leading-relaxed mb-6">
              We never use artificial MSG, excessive table sugars, or cheap seed oils. Every meal is seasoned with natural herbs, Himalayan sea salt, and extra virgin olive oil so you can look and feel your absolute best.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#DDE8CB]">
              <span className="flex items-center gap-1.5 bg-[#090B01] px-3.5 py-1.5 rounded-full border border-[#2C3821]">
                <CheckCircle2 size={15} className="text-[#6C8C17]" /> 100% Lean Meats
              </span>
              <span className="flex items-center gap-1.5 bg-[#090B01] px-3.5 py-1.5 rounded-full border border-[#2C3821]">
                <CheckCircle2 size={15} className="text-[#6C8C17]" /> Complex Carbohydrates
              </span>
              <span className="flex items-center gap-1.5 bg-[#090B01] px-3.5 py-1.5 rounded-full border border-[#2C3821]">
                <CheckCircle2 size={15} className="text-[#6C8C17]" /> Fresh Local Greens
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Order Your Meals Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="container section-py pt-0">
        <div className="section-header text-center">
          <span className="eyebrow">GOT QUESTIONS?</span>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about our meal prep and delivery service.</p>
        </div>

        <div className="faq-wrap">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-[#6C8C17] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="container mb-24">
        <div className="text-center bg-gradient-to-b from-[#1A2110] to-[#0D0E03] border border-[#384628] rounded-3xl p-12 md:p-16">
          <span className="eyebrow">
            <MessageCircle size={16} /> FAST &amp; DIRECT
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to upgrade your daily nutrition?
          </h2>
          <p className="text-[#A9ADA2] max-w-lg mx-auto mb-8 text-sm md:text-base">
            Skip the cooking, grocery shopping, and meal prep hassle. Let Healy Bite fuel your training week with delicious meals delivered to your door.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Explore Weekly Menu <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/94712599785?text=Hello%20Healthy%20Bites!%20I%20would%20like%20to%20inquire%20about%20your%20meal%20plans."
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-lg"
            >
              <MessageCircle size={18} className="text-[#6C8C17]" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
