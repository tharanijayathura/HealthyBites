# HEALY BITE — Complete MERN Stack Business Website

A production-oriented, modern, responsive website for **Healy Bite**, a healthy gym-meal preparation business in Sri Lanka.

Healy Bite delivers freshly prepared, macro-balanced, nutritious meals designed for gym enthusiasts, athletes, and fitness-focused individuals across Colombo.

---

## 🌟 Key Features

### 1. Customer Website
- **Cinematic Dark Luxury Aesthetics**: Inspired by high-end dark culinary designs, featuring the official brand palette:
  - Deep Forest Black (`#0D0E03`) & Midnight Leaf Black (`#090B01`)
  - Banana Leaf Green (`#6C8C17`) & Deep Natural Green (`#3C7100`)
  - Soft Ivory (`#F4F1E5`), Dark Olive Charcoal (`#1A2110`), and Warm Sand (`#D8BE8C`)
- **Interactive Hero Showcase**: Rotating featured fitness dishes with macro badges and halo ambient glow.
- **7-Day Rotating Weekly Menu**: Interactive day tabs (Monday to Sunday) with dynamic dish updates, dietary category filtering (High Protein, Lean & Cut, Keto, Clean Bulk, Omega-3 Recovery, Pre-Workout Energy), and upcoming delivery date selectors.
- **Meal Details Modal**: High-resolution dish photography, complete macro breakdown (Calories, Protein, Carbs, Fat), ingredients chips, allergen warnings, and quantity selector.
- **Guest Shopping Cart**: Full React Context cart with localStorage persistence. Items are neatly grouped by delivery date.
- **Authoritative Checkout**:
  - Full Name, Phone, optional WhatsApp number, and Email
  - Delivery vs Hub Pickup toggle (automatically discounts delivery fees on pickup)
  - Preferred delivery time slots (Morning, Lunch, Evening)
  - Special preparation and dietary instructions
  - Authoritative server-side price and date revalidation
- **WhatsApp Ordering Integration**: Formats a clean, professional click-to-chat WhatsApp order message and opens WhatsApp for customer dispatch.

### 2. Admin Control Center
- **Secure Authentication**: Hashed passwords with bcrypt and secure JWT authentication.
- **Live KPI Overview**:
  - Total Meals, Active Meals, and Sold-Out count
  - Total Orders, Pending WhatsApp Orders, and Confirmed Orders
  - Verified Order Revenue calculation
- **Meals Management (Full CRUD)**:
  - Add, edit, archive, and delete meals
  - Integrated visual food photo picker (`/images/food/1.png` – `7.png`) and custom URL support
  - Exact nutritional macros: Calories, Protein (g), Carbohydrates (g), Fats (g)
  - Clean ingredients and allergen tagging
  - One-click "Mark Sold Out" toggle
  - Multi-day weekday assignment
- **Weekly Schedule Matrix**: Visual 7-day grid showing all assigned meals per day.
- **Order Management**:
  - Search by Order Code (`HB-XXXX`), customer name, or phone number
  - Filter by status: All, Pending WhatsApp, Confirmed, Preparing, Completed, Cancelled
  - One-click status updates
  - Direct "Chat with Client" button that opens WhatsApp directly to the customer's phone number!
- **Business Settings**: Centralized management of business name, contact phone, receiving WhatsApp number, email, delivery fees, pickup hub address, cutoff time, and description.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Lucide React icons
- **Backend**: Node.js 22+, Express.js 5, MongoDB & Mongoose
- **Security**: Bcrypt password hashing, JWT authentication via HTTP-only cookies, Helmet headers, Express rate limiting, and CORS configuration

---

## 🚀 Quick Setup & Running Guide

### 1. Requirements
- Node.js 22+ and npm (`node -v`)
- MongoDB Atlas or local MongoDB instance (`mongodb://127.0.0.1:27017/healy_bite`)

### 2. Configure Environment Variables

**Server (`server/.env`):**
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_32_character_random_jwt_secret
ADMIN_EMAIL=healthyxxxbites@gmail.com
ADMIN_PASSWORD=your_strong_admin_password
```

**Client (`client/.env`):**
```ini
VITE_API_BASE_URL=/api
```

### 3. Install Dependencies
From the project root:
```bash
npm run install:all
```

### 4. Seed Database & Create Administrator
```bash
# Seed 7 premium gym meals with photos, macros & default business settings:
npm run seed --prefix server

# Create the initial super-admin account:
npm run admin:create --prefix server
```

The customer registration form creates normal customer accounts only. Staff can request
an administrator account from the discreet `staff` link in the footer or at
`/admin/register`. Every staff request starts as pending and must be approved by a
super-admin in the Admin Team tab before the staff member can sign in through the
normal `/login` page. Approved staff are sent to the admin dashboard; customer
accounts continue to be sent to the menu. The
`admin:create` command creates or updates the configured super-admin using credentials
from `server/.env`.

### 5. Start Development Servers
Run both frontend and backend concurrently:
```bash
npm run dev
```

- **Customer Website**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin Portal**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

### 6. Run Tests
```bash
npm test --prefix server
```

---

## 📞 Temporary Business Contact Info
- **Business Name**: Healy Bite
- **Email**: `vmsadtharani@gmail.com`
- **Phone**: `0712599785`
- **WhatsApp**: `+94 71 259 9785`
- **Central Kitchen Hub**: Colombo 03, Sri Lanka
