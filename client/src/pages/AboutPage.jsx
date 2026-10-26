import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Dumbbell, Award, Flame, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="container section-py">
      {/* Header */}
      <div className="section-header text-center max-w-3xl mx-auto">
        <span className="eyebrow">
          <Leaf size={16} /> OUR MISSION &amp; STORY
        </span>
        <h1>
          Nutrition Built for <span className="brand-leaf">Peak Living.</span>
        </h1>
        <p className="mx-auto">
          Healy Bite was founded with a singular conviction: athletic performance and daily wellness begin with clean, consistent, chef-crafted nutrition.
        </p>
      </div>

      {/* Story Grid with Gym Atmosphere Background */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div className="relative rounded-3xl overflow-hidden border border-[#2C3821] aspect-4/3">
          <img
            src="/images/bg4.png"
            alt="Modern training facility and lifestyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0D0E03] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#090B01]/90 backdrop-blur border border-[#2C3821]">
            <span className="text-xs text-[#6C8C17] uppercase tracking-wider font-bold">Healy Bite Kitchen</span>
            <p className="text-sm text-white font-medium m-0">Fresh culinary prep every morning in Colombo</p>
          </div>
        </div>

        <div className="space-y-6">
          <span className="eyebrow">THE PROBLEM WE SOLVE</span>
          <h2 className="text-3xl font-bold">
            No more boring chicken and soggy broccoli.
          </h2>
          <p className="text-[#A9ADA2] text-sm md:text-base leading-relaxed">
            Most gym-goers and fitness enthusiasts struggle with the same dilemma: spending countless hours grocery shopping, weighing portions, and cooking repetitive meals, or compromising with unhealthy, oily restaurant takeout.
          </p>
          <p className="text-[#A9ADA2] text-sm md:text-base leading-relaxed">
            Healy Bite eliminates that trade-off. We combine the precision of sports dietetics with high-end culinary craft. Every meal delivers honest macros, vibrant flavor profiles, and premium local ingredients.
          </p>

          <div className="pt-2">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Explore Our Weekly Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="section-header text-center max-w-2xl mx-auto mb-12">
        <span className="eyebrow">OUR COMMITMENT</span>
        <h2>The Healy Bite Principles</h2>
        <p className="mx-auto">Non-negotiable quality standards in every meal box we seal.</p>
      </div>

      <div className="pillars-grid mb-24">
        <div className="pillar-card">
          <div className="pillar-icon-box">
            <Dumbbell size={24} />
          </div>
          <h3>Protein-First Philosophy</h3>
          <p>
            We prioritize genuine lean protein cuts—chicken breast, sirloin, salmon, and farm eggs—never cheap soy fillers or excessive carbohydrates.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <ShieldCheck size={24} />
          </div>
          <h3>Honest Macro Tracking</h3>
          <p>
            Every single menu item displays caloric count and exact macronutrients (protein, carbs, fat) so your fitness diary remains 100% accurate.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <Award size={24} />
          </div>
          <h3>Farm-Fresh Ingredients</h3>
          <p>
            Locally sourced Sri Lankan vegetables, unpolished brown basmati, virgin olive oils, and natural Himalayan herbs for optimum micronutrient absorption.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <Users size={24} />
          </div>
          <h3>Athlete-Approved Taste</h3>
          <p>
            Tested with coaches, lifters, and everyday athletes to ensure healthy eating is something you eagerly look forward to every single day.
          </p>
        </div>
      </div>
    </main>
  );
}
