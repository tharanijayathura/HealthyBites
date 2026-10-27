import { useState, useEffect } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, ShieldCheck } from 'lucide-react';
import { get } from '../api/client';

export default function ContactPage() {
  const [settings, setSettings] = useState({
    businessName: 'Healy Bite',
    email: 'vmsadtharani@gmail.com',
    phone: '0712599785',
    whatsappNumber: '94712599785',
    pickupLocation: 'Healy Bite Hub, Colombo 03, Sri Lanka',
    cutoffTime: '11:00 PM',
    orderThrough: 'Wholesome, delicious meals made to nourish your body and power your day.',
    deliveryAreas: 'Moratuwa, Rawathawatta, Katubedda, Angulana, Rathmalana, Suwarapola, Piliyandala',
    paymentMethod: 'COD only'
  });

  const [inquiry, setInquiry] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    get('/settings')
      .then(data => {
        setSettings(s => ({ ...s, ...data }));
      })
      .catch(() => {});
  }, []);

  const handleWhatsAppInquiry = (e) => {
    e.preventDefault();
    const text = `Hello Healthy Bite! I would like to inquire about your meal plans.\n\nName: ${inquiry.name}\nPhone: ${inquiry.phone}\nInquiry: ${inquiry.message}`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="container section-py">
      {/* Header */}
      <div className="section-header text-center max-w-2xl mx-auto">
        <span className="eyebrow">
          <MessageCircle size={16} /> WE'RE HERE TO HELP
        </span>
        <h1>
          Contact <span className="brand-leaf">Healy Bite.</span>
        </h1>
        <p className="mx-auto">
          Have questions regarding meal subscriptions, corporate orders, gym partnerships, or custom dietary requests? Reach out anytime.
        </p>
      </div>

      {/* 3 Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pillar-card block text-center hover:border-[#6C8C17]"
        >
          <div className="pillar-icon-box mx-auto">
            <MessageCircle size={26} />
          </div>
          <h3>WhatsApp Support</h3>
          <p className="text-sm text-[#A9ADA2] mb-3">Instant responses during ordering hours.</p>
          <strong className="text-base brand-leaf">+{settings.whatsappNumber}</strong>
        </a>

        {/* Phone */}
        <a
          href={`tel:${settings.phone}`}
          className="pillar-card block text-center hover:border-[#6C8C17]"
        >
          <div className="pillar-icon-box mx-auto">
            <Phone size={26} />
          </div>
          <h3>Call Directly</h3>
          <p className="text-sm text-[#A9ADA2] mb-3">Speak to our kitchen coordinator.</p>
          <strong className="text-base text-white">{settings.phone}</strong>
        </a>

        {/* Email */}
        <a
          href={`mailto:${settings.email}`}
          className="pillar-card block text-center hover:border-[#6C8C17]"
        >
          <div className="pillar-icon-box mx-auto">
            <Mail size={26} />
          </div>
          <h3>Official Email</h3>
          <p className="text-sm text-[#A9ADA2] mb-3">Partnerships &amp; business inquiries.</p>
          <strong className="text-base text-white break-all">{settings.email}</strong>
        </a>
      </div>

      {/* Two Column Layout: Quick WhatsApp Inquiry Form & Operational Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Quick Message Form */}
        <div className="form-panel">
          <span className="eyebrow">SEND AN INQUIRY</span>
          <h2 className="text-2xl font-bold mb-4">Chat with Healy Bite</h2>
          <p className="text-sm text-[#A9ADA2] mb-6">
            Fill in your message below to start a conversation with our customer care on WhatsApp.
          </p>

          <form onSubmit={handleWhatsAppInquiry}>
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Kasun"
                required
                value={inquiry.name}
                onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="07XXXXXXXX"
                required
                value={inquiry.phone}
                onChange={e => setInquiry({ ...inquiry, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Message / Question *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="I would like to inquire about bulk ordering for my gym athletes..."
                required
                value={inquiry.message}
                onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Send Message on WhatsApp <Send size={16} />
            </button>
          </form>
        </div>

        {/* Operational Info */}
        <div className="space-y-6">
          <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock size={19} className="text-[#6C8C17]" /> Operating &amp; Order Deadlines
            </h3>
            <div className="space-y-3 text-sm text-[#A9ADA2]">
              <div className="flex justify-between pb-2 border-b border-[#2C3821]">
                <span>Daily Cutoff Time:</span>
                <strong className="text-white">{settings.cutoffTime || '8:00 PM'}</strong>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#2C3821]">
                <span>Delivery Days:</span>
                <strong className="text-white">Monday – Sunday</strong>
              </div>
              <div className="flex justify-between">
                <span>Meal Prep Schedule:</span>
                <strong className="text-white">Cooked Fresh Every Morning</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Payment:</span>
                <strong className="text-white text-right">{settings.paymentMethod}</strong>
              </div>
            </div>
          </div>

          <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin size={19} className="text-[#6C8C17]" /> Hub &amp; Delivery Zone
            </h3>
            <p className="text-sm text-[#A9ADA2] leading-relaxed mb-4">
              {settings.orderThrough}
            </p>
            <div className="text-xs text-[#D8BE8C] bg-[#090B01] p-3 rounded-xl border border-[#2C3821]">
              <div className="mb-2">Free delivery areas: <strong>{settings.deliveryAreas}</strong></div>
              <div>Hub Address: <strong>{settings.pickupLocation}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
