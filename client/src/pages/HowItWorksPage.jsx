import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ClipboardCheck,
  MessageCircle,
  ShoppingBasket,
  Truck
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: CalendarDays,
    title: 'Choose a delivery day',
    description: 'Browse the Monday-to-Sunday menu and select an upcoming date that works for you.'
  },
  {
    number: '02',
    icon: ShoppingBasket,
    title: 'Build your cart',
    description: 'Pick your favorite meals, adjust quantities, and keep separate delivery dates organized in one cart.'
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: 'Enter your details',
    description: 'Tell us where to deliver and add any notes so our team can prepare your order correctly.'
  },
  {
    number: '04',
    icon: MessageCircle,
    title: 'Confirm on WhatsApp',
    description: 'Submit your order to generate a ready-to-send WhatsApp summary. Press Send to contact our team.'
  },
  {
    number: '05',
    icon: ChefHat,
    title: 'We prepare it fresh',
    description: 'Our kitchen verifies the order, then cooks and packs your meals fresh for the selected delivery date.'
  },
  {
    number: '06',
    icon: Truck,
    title: 'Enjoy your delivery',
    description: 'Your meals arrive at your chosen address, ready to support your training and everyday routine.'
  }
];

export default function HowItWorksPage() {
  return (
    <main className="container section-py">
      <div className="section-header text-center max-w-3xl mx-auto">
        <span className="eyebrow">
          <CheckCircle2 size={16} /> SIMPLE. FRESH. RELIABLE.
        </span>
        <h1>
          Healthy meals, <span className="brand-leaf">made easy.</span>
        </h1>
        <p className="mx-auto">
          From choosing your meals to receiving them at your door, Healy Bite keeps
          healthy eating simple and convenient.
        </p>
      </div>

      <section className="steps-grid mb-24" aria-label="How ordering works">
        {steps.map(({ number, icon: Icon, title, description }) => (
          <article className="step-card" key={number}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="pillar-icon-box">
                <Icon size={24} />
              </div>
              <span className="step-num-badge">{number}</span>
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <div className="form-panel">
          <span className="eyebrow">GOOD TO KNOW</span>
          <h2 className="text-2xl font-bold mb-5">Ordering with confidence</h2>
          <ul className="space-y-4 text-sm text-[#A9ADA2]">
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-[#6C8C17] flex-shrink-0" />
              <span>Prices and meal availability are checked again by the server at checkout.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-[#6C8C17] flex-shrink-0" />
              <span>You can order meals for different delivery dates in the same cart.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="text-[#6C8C17] flex-shrink-0" />
              <span>Your order is confirmed by our team after the WhatsApp message is received.</span>
            </li>
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#2C3821] min-h-[260px]">
          <img
            src="/images/bg3.png"
            alt="Freshly prepared Healy Bite meal"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090B01] via-[#090B01]/75 to-transparent" />
          <div className="relative flex h-full min-h-[260px] flex-col justify-center p-8">
            <span className="eyebrow">READY WHEN YOU ARE</span>
            <h2 className="max-w-sm text-2xl font-bold">Start with this week's menu.</h2>
            <p className="max-w-sm text-sm text-[#A9ADA2] mb-6">
              Choose meals that fit your schedule and let us handle the preparation.
            </p>
            <div>
              <Link to="/menu" className="btn btn-primary">
                Browse the Menu <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center">
        <p className="text-sm text-[#A9ADA2] mb-4">Have a question before ordering?</p>
        <Link to="/contact" className="btn btn-outline">
          Contact Support <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
