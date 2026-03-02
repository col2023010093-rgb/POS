You are the world’s best senior full-stack web developer and UI/UX animation expert.
Your task is to build a modern, highly animated, production-ready POS (Point of Sale) web application.

The system must be visually stunning, smooth, responsive, and scalable.

🏗 Tech Stack Requirements
🔹 Frontend

React (Vite)

Context API (AuthContext, CartContext, MenuContext)

Tailwind CSS for styling

Framer Motion (primary animation library)

GSAP + ScrollTrigger (for advanced & scroll animations)

Optional: Three.js or React Three Fiber for subtle 3D hero section

🔹 Backend

Node.js + Express

MongoDB

JWT Authentication

Role-based middleware (admin/user)

🎨 Animation Requirements
✨ UI Animations

Page transitions using Framer Motion

Smooth button hover effects

Animated modals (cart, payment)

Micro-interactions (add to cart, order success)

🌊 Scroll Animations

Parallax hero section using GSAP ScrollTrigger

Animated menu sections on scroll

Smooth scrolling (Locomotive Scroll optional)

🎬 Advanced Effects

Subtle 3D animated background in hero section

Floating gradient blobs or animated particles

Smooth dashboard transitions

All animations must:

Be smooth (60fps)

Not block performance

Use proper cleanup in React hooks

🧠 Architecture Rules
Frontend Structure

context/ → AuthContext, CartContext, MenuContext

pages/ → Home, Menu, Login, Orders, AdminDashboard

components/ → Reusable UI elements

utils/api.js → Centralized API communication

ProtectedRoute for authentication

AdminDashboard accessible only to admin role

Backend Structure

controllers/

middleware/ (auth.js, adminMiddleware.js)

models/ (User, Product, Order, Notification)

routes/

seed.js for initial data

🔐 Features Required
👤 Authentication

JWT login/register

Role-based access (Admin/User)

🛒 POS Core

Dynamic menu from database

Add/remove items from cart

Real-time cart updates

Checkout flow

Payment processing logic

Order history

👨‍💼 Admin Dashboard

Add/Edit/Delete products

View orders

Sales analytics section (animated charts)

Notification system

🎨 UI Design Direction

Design should be:

Dark modern theme

Glassmorphism cards

Smooth rounded corners

Subtle gradients

Professional SaaS-level polish

Inspiration:
Stripe, Linear, Apple, Modern SaaS dashboards.

⚡ Performance Requirements

Lazy load heavy components

Optimize animation triggers

Use React best practices

Clean separation of concerns

Scalable folder structure

📦 Deliverables

Full project folder structure

Key frontend files (App.jsx, contexts, example animated page)

Backend starter structure

Example animation implementation (Framer Motion + GSAP)

Instructions to run locally

Code must be clean, production-ready, and modular.