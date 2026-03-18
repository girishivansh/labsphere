<div align="center">

# 🔬 LabSphere
### *Smart Lab. Smart Management.*

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**A complete, production-ready Chemistry Lab Inventory Management System**  
Built with the MERN stack — manage chemicals, equipment, issue/return workflows, and generate reports.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-reference) • [Deployment](#-deployment)

---



</div>

---

## ✨ Features

### 🔐 Authentication & Role-Based Access Control
- **3-step portal login** — Select role → Enter credentials → Access granted
- **Strict role enforcement** — Admin can't login via Teacher portal and vice versa
- JWT-based secure authentication with 7-day token expiry
- Password hashing with bcryptjs (unique hash per user)
- Unauthorized access redirects to a dedicated error page

### 👥 User Roles & Permissions

| Feature | Admin | Teacher | Student |
|---------|:-----:|:-------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ |
| View Inventory | ✅ | ✅ | ✅ |
| Add/Edit Items | ✅ | ✅ | ❌ |
| Delete Items | ✅ | ❌ | ❌ |
| Issue Items | ✅ | ✅ | ❌ |
| Record Returns | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

### 📦 Inventory Management
- Add chemicals and equipment with full metadata
- Auto-generated item codes (CHEM-001, EQUIP-001)
- QR code generated automatically for every item
- Hazard level tagging (Low / Medium / High / Extreme)
- Search, filter by type, filter by low stock
- Paginated tables for fast loading

### 🔄 Issue & Return System
- Issue items to students/teachers with quantity tracking
- Stock auto-deducted on issue
- Return with condition: **Good** / **Damaged** / **Broken**
- Stock auto-restored on return (based on condition)
- Auto damage report created for damaged/broken returns

### 📊 Reports & Analytics
- **Daily Report** — All issues and returns for a selected date
- **Monthly Report** — Usage summary per item
- **Low Stock Report** — Items below minimum limit
- **Damage Reports** — All damage/breakage history

### 🚨 Low Stock Alerts
- Dashboard warning banner when items fall below minimum limit
- Red highlight on low-stock items in inventory table

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | UI framework + build tool |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Lucide React | Icons |
| QRCode.react | QR code rendering |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database + ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| QRCode | Server-side QR generation |
| Helmet | Security headers |
| Morgan | Request logging |
| Express Rate Limit | API rate limiting |

---

## 📁 Project Structure

```
LabSphere/
│
├── 📁 backend/
│   ├── 📁 config/
│   │   ├── db.js              # MongoDB connection
│   │   └── seed.js            # Demo data seeder
│   ├── 📁 models/
│   │   ├── User.js            # User schema
│   │   ├── Item.js            # Item schema (auto QR on save)
│   │   ├── IssueLog.js        # Issue tracking
│   │   ├── ReturnLog.js       # Return tracking
│   │   └── DamageReport.js    # Damage reports
│   ├── 📁 controllers/        # Business logic
│   ├── 📁 routes/             # API route definitions
│   ├── 📁 middleware/
│   │   ├── auth.js            # JWT authenticate + authorize
│   │   └── errorHandler.js    # Global error handler
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Express app entry point
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── layout/        # Sidebar + AppLayout
│   │   │   └── ui/            # Reusable UI components
│   │   ├── 📁 hooks/
│   │   │   └── useAuth.jsx    # Auth context + hook
│   │   ├── 📁 pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── IssuesPage.jsx
│   │   │   ├── ReturnsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   ├── 📁 services/
│   │   │   └── api.js         # All Axios API calls
│   │   └── 📁 utils/
│   │       └── helpers.js     # Date formatters + badge helpers
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) v6+
- [Git](https://git-scm.com)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/girishivansh/labsphere.git
cd labsphere
```

**2. Backend Setup**
```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chemlab_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Seed demo data (run only once):
```bash
npm run seed
```

Start backend server:
```bash
npm run dev
```
> ✅ MongoDB Connected + 🚀 LabSphere API running on port 5000

**3. Frontend Setup** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Open browser: **http://localhost:5173**

---



## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | All |

### Items
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/items` | Get all items (paginated) | All |
| GET | `/api/items/:id` | Get item by ID | All |
| POST | `/api/items` | Create new item | Admin, Teacher |
| PUT | `/api/items/:id` | Update item | Admin, Teacher |
| DELETE | `/api/items/:id` | Delete item | Admin |
| GET | `/api/items/low-stock` | Get low stock items | All |

### Issues
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/issues` | Get all issues | All |
| POST | `/api/issues` | Create issue | Admin, Teacher |
| GET | `/api/issues/today` | Get today's issues | Admin, Teacher |

### Returns
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/returns` | Get all returns | All |
| POST | `/api/returns` | Record return | Admin, Teacher |
| GET | `/api/returns/recent` | Get today's returns | Admin, Teacher |

### Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reports/dashboard` | Dashboard stats | All |
| GET | `/api/reports/daily` | Daily report | Admin, Teacher |
| GET | `/api/reports/monthly` | Monthly report | Admin, Teacher |
| GET | `/api/reports/damage` | Damage reports | Admin, Teacher |
| GET | `/api/reports/low-stock` | Low stock report | All |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin, Teacher |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Deactivate user | Admin |

---

## 🌐 Deployment

### Free Deployment Stack
| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Database | MongoDB Atlas | Free |

### Quick Deploy Guide

**1. MongoDB Atlas**
- Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
- Whitelist all IPs: `0.0.0.0/0`
- Copy connection string

**2. Backend on Render**
- Connect GitHub repo
- Root Directory: `backend`
- Build: `npm install` | Start: `npm start`
- Add environment variables

**3. Frontend on Vercel**
- Connect GitHub repo
- Root Directory: `frontend`
- Add `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 🔒 Security Features

- ✅ JWT authentication with expiry
- ✅ bcrypt password hashing (salt rounds: 10)
- ✅ Role-based access control (RBAC)
- ✅ HTTP security headers (Helmet)
- ✅ Rate limiting (200 req/15min)
- ✅ CORS restricted to frontend origin
- ✅ MongoDB injection prevention (Mongoose)
- ✅ Environment variables for secrets

---

## 👨‍💻 Developer

<div align="center">

**Shivansh Giri**  
B.S. Computer Science & Data Analytics  
IIT Patna | Batch 2025–2029

[![GitHub](https://img.shields.io/badge/GitHub-girishivansh-181717?style=flat&logo=github)](https://github.com/girishivansh)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-shivansh--giri2008-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/shivansh-giri2008)
[![LeetCode](https://img.shields.io/badge/LeetCode-Shivansh2008-FFA116?style=flat&logo=leetcode)](https://leetcode.com/Shivansh2008)

</div>

---

<div align="center">

**LabSphere** — *Every Chemical. Every Equipment. Every Time.*

⭐ Star this repo if you found it helpful!

</div>
