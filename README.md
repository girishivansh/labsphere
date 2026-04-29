<div align="center">

# 🔬 LabSphere
### *Smart Lab. Smart Management.*

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**A complete, production-ready Chemistry Lab Inventory Management System**  
Built with the MERN stack — manage chemicals, equipment, issue/return workflows, and generate comprehensive reports.

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-reference) • [Deployment](#-zero-cost-deployment)

---

</div>

## 💡 Why LabSphere?

Managing a chemistry lab involves handling sensitive chemicals, tracking expensive equipment, and ensuring safety through proper usage logs. Traditional paper-based or simple spreadsheet systems are error-prone and inefficient. 

**LabSphere** digitizes the entire process. It offers real-time stock tracking, strict role-based access, and automated hazard reporting, turning a chaotic lab environment into a structured, safe, and easily manageable ecosystem.

---

## ✨ Key Features

### 🔐 Ironclad Security & Role-Based Access
- **Streamlined Portal** — Select role → Authenticate → Access personalized dashboard.
- **Strict Role Enforcement** — Segregated access for Admins, Teachers, and Students.
- **JWT Authentication** — Secure, stateless sessions with 7-day token expiry.
- **Data Protection** — Passwords hashed with `bcryptjs` and database secured against injections.

### 📦 Smart Inventory & Asset Tracking
- **Comprehensive Metadata** — Log chemicals and equipment with extreme detail.
- **Automated Cataloging** — Auto-generated item codes (e.g., `CHEM-001`, `EQUIP-001`).
- **QR Code Integration** — Instant, server-generated QR codes for every asset.
- **Hazard Awareness** — Visual hazard level tagging (Low / Medium / High / Extreme).
- **Proactive Alerts** — Dashboard warnings and visual cues when items fall below minimum stock limits.

### 🔄 Seamless Issue & Return Workflows
- **Real-Time Stock Adjustment** — Quantities auto-deduct on issue and restore on return.
- **Condition Monitoring** — Track returned items as **Good**, **Damaged**, or **Broken**.
- **Automated Damage Reports** — Instantly generates incident logs for damaged/broken returns, ensuring accountability.

### 📊 Comprehensive Analytics & Reports
- **Daily Operations** — Snapshot of all issues and returns for any given date.
- **Monthly Usage** — Detailed utilization metrics per item.
- **Low Stock Radar** — Instantly identify what needs reordering.
- **Damage History** — Maintain a clear ledger of breakages and equipment depreciation.

### 👥 User Permissions Matrix

| Feature | Admin | Teacher | Student |
|---------|:-----:|:-------:|:-------:|
| **Dashboard Access** | ✅ | ✅ | ✅ |
| **View Inventory** | ✅ | ✅ | ✅ |
| **Add/Edit Items** | ✅ | ✅ | ❌ |
| **Issue Items** | ✅ | ✅ | ❌ |
| **Record Returns** | ✅ | ✅ | ❌ |
| **View Reports** | ✅ | ✅ | ❌ |
| **Delete Items** | ✅ | ❌ | ❌ |
| **Manage Users** | ✅ | ❌ | ❌ |

---

## 🛠 Tech Stack

### Frontend 🎨
- **Core:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State/HTTP:** Axios
- **UI Goodies:** Lucide React (Icons), QRCode.react, React Hot Toast (Notifications)

### Backend ⚙️
- **Core:** Node.js + Express
- **Database:** MongoDB + Mongoose ODM
- **Security:** JWT, bcryptjs, Helmet
- **Utilities:** Morgan (Logging), Express Rate Limit, server-side QRCode generation

---

## 📁 Project Architecture

```text
LabSphere/
├── backend/                  # Robust Express + MongoDB API
│   ├── config/               # DB connections & Seeders
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT Auth, Error handling
│   ├── models/               # Mongoose Schemas (User, Item, Logs)
│   ├── routes/               # Modular API routes
│   └── server.js             # Application entry point
│
├── frontend/                 # Reactive React + Tailwind UI
│   ├── src/
│   │   ├── components/       # Reusable UI & Layouts
│   │   ├── hooks/            # Custom hooks (useAuth)
│   │   ├── pages/            # View components (Dashboard, Inventory, etc.)
│   │   ├── services/         # Axios API clients
│   │   └── utils/            # Formatters & Helpers
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (v6+ local or Atlas)
- [Git](https://git-scm.com)

### Installation Guide

**1. Clone the repository**
```bash
git clone https://github.com/girishivansh/labsphere.git
cd labsphere
```

**2. Initialize the Backend**
```bash
cd backend
npm install
copy .env.example .env
```
*Configure your `.env` file:*
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chemlab_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```
*Seed demo data & Start:*
```bash
npm run seed  # Run only once to populate DB
npm run dev
```

**3. Initialize the Frontend** (In a new terminal)
```bash
cd frontend
npm install
npm run dev
```
🌐 **Open your browser and navigate to:** `http://localhost:5173`

---

## 📡 API Reference

Our robust REST API ensures seamless communication between the client and server.

<details>
<summary><b>Authentication & Users</b></summary>

- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Retrieve current profile
- `GET /api/users` - List users *(Admin/Teacher)*
- `POST /api/users` - Create user *(Admin)*
</details>

<details>
<summary><b>Inventory Management</b></summary>

- `GET /api/items` - List items (paginated)
- `POST /api/items` - Add new item *(Admin/Teacher)*
- `PUT /api/items/:id` - Update item *(Admin/Teacher)*
- `DELETE /api/items/:id` - Remove item *(Admin)*
- `GET /api/items/low-stock` - Alert on low stock
</details>

<details>
<summary><b>Workflows & Reports</b></summary>

- `POST /api/issues` - Issue item *(Admin/Teacher)*
- `POST /api/returns` - Record return *(Admin/Teacher)*
- `GET /api/reports/dashboard` - High-level metrics
- `GET /api/reports/damage` - Incident logs *(Admin/Teacher)*
</details>

---

## 🌐 Zero-Cost Deployment

LabSphere is engineered to be deployed easily on free-tier services.

| Service | Recommended Platform | Cost |
|---------|----------------------|------|
| **Frontend** | Vercel | Free |
| **Backend** | Render | Free |
| **Database** | MongoDB Atlas | Free |

**Quick Tips:**
- Whitelist `0.0.0.0/0` on MongoDB Atlas.
- Ensure `VITE_API_URL` is set in Vercel to your deployed Render backend URL.
- Use `npm install` and `npm start` for your backend build commands.

---

## 🛡️ Production Security Checklist

- [x] JWT-based stateless authentication
- [x] Password hashing with `bcryptjs` (Cost factor: 10)
- [x] Strict Role-Based Access Control (RBAC) middleware
- [x] HTTP headers secured via Helmet
- [x] DDoS mitigation via Express Rate Limiting (200 req/15min)
- [x] Strict CORS policies
- [x] NoSQL Injection protection via Mongoose

---

## 👨‍💻 Meet the Developer

<div align="center">

**Shivansh Giri**  
B.S. Computer Science & Data Analytics  
*IIT Patna | Batch 2025–2029*

[![GitHub](https://img.shields.io/badge/GitHub-girishivansh-181717?style=flat&logo=github)](https://github.com/girishivansh)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-shivansh--giri2008-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/shivansh-giri2008)
[![LeetCode](https://img.shields.io/badge/LeetCode-Shivansh2008-FFA116?style=flat&logo=leetcode)](https://leetcode.com/Shivansh2008)

</div>

---

<div align="center">

**LabSphere** — *Every Chemical. Every Equipment. Every Time.*

🌟 **If LabSphere makes your life easier, consider giving it a star on GitHub!** 🌟

</div>
