import { useEffect, useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import MealCard from '../components/MealCard';
import { get } from '../api/client';
import { demoMeals } from '../data/demoMeals';
import { DAYS, upcomingDatesForDay, formatDate } from '../utils/dates';

const CATEGORIES = [
  'All Meals',
  'High Protein',
  'Lean & Cut',
  'Keto & Low Carb',
  'Clean Bulk',
  'Omega-3 & Recovery',
  'Pre-Workout & Energy'
];

export default function MenuPage() {
  const [day, setDay] = useState('Monday');
  const [deliveryDate, setDeliveryDate] = useState(() => upcomingDatesForDay('Monday')[0]);
  const [selectedCategory, setSelectedCategory] = useState('All Meals');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When weekday changes, update default upcoming delivery date
    const dates = upcomingDatesForDay(day);
    if (dates.length > 0) {
      setDeliveryDate(dates[0]);
    }
  }, [day]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    get(`/meals?day=${day}`)
      .then(result => {
        if (active) {
          if (Array.isArray(result) && result.length > 0) {
            setMeals(result);
          } else {
            // Filter fallback
            const filtered = demoMeals.filter(m => m.availableDays.includes(day));
            setMeals(filtered);
          }
        }
      })
      .catch(() => {
        if (active) {
          const filtered = demoMeals.filter(m => m.availableDays.includes(day));
          setMeals(filtered);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [day]);

  const availableDates = upcomingDatesForDay(day);

  // Filter by category
  const filteredMeals = meals.filter(meal => {
    if (selectedCategory === 'All Meals') return true;
    return meal.category === selectedCategory;
  });

  return (
    <main className="container section-py">
      {/* Header */}
      <div className="section-header">
        <span className="eyebrow">
          <Calendar size={16} /> 7-DAY ROTATING NUTRITION
        </span>
        <h1>
          Explore the <span className="brand-leaf">Weekly Menu.</span>
        </h1>
        <p>
          Select a weekday to view meals curated for that day, choose your upcoming delivery date, and add meals straight to your cart.
        </p>
      </div>

      {/* Weekday Selector Tabs */}
      <div className="day-selector-wrap" role="tablist" aria-label="Select Weekday">
        {DAYS.map(d => (
          <button
            key={d}
            role="tab"
            aria-selected={d === day}
            className={`day-tab-btn ${d === day ? 'active' : ''}`}
            onClick={() => setDay(d)}
          >
            <span>{d}</span>
            <small className="text-[10px] opacity-75 font-normal">
              {upcomingDatesForDay(d)[0] ? formatDate(upcomingDatesForDay(d)[0]).split(' ')[0] + ' ' + formatDate(upcomingDatesForDay(d)[0]).split(' ')[1] : ''}
            </small>
          </button>
        ))}
      </div>

      {/* Sub-toolbar: Date Dropdown & Category Filter */}
      <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="menu-date-control flex items-center gap-3">
          <Calendar size={18} className="text-[#6C8C17]" />
          <span className="menu-date-label text-sm font-semibold text-[#DDE8CB]">Delivery Date for {day}:</span>
          <select
            className="form-control menu-date-select"
            value={deliveryDate || ''}
            onChange={(e) => setDeliveryDate(e.target.value)}
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)} ({day})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#A9ADA2]">
          Showing <strong>{filteredMeals.length}</strong> delicious meal{filteredMeals.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meal Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#6C8C17] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#A9ADA2]">Fetching fresh meals for {day}...</p>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="empty-state py-20">
          <Sparkles size={40} className="text-[#6C8C17] mb-2" />
          <h3 className="text-lg font-bold">No meals in this category for {day}</h3>
          <p className="text-sm text-[#A9ADA2] mb-4">
            Try choosing a different dietary category or switch to another weekday.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedCategory('All Meals')}
          >
            Reset Category Filter
          </button>
        </div>
      ) : (
        <div className="meal-grid">
          {filteredMeals.map(meal => (
            <MealCard
              key={meal._id}
              meal={meal}
              deliveryDate={deliveryDate}
            />
          ))}
        </div>
      )}
    </main>
  );
}
