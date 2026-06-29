# ===== README.md =====
# 📊 Expense Tracker Full-Stack Application

A elegant, fully-responsive full-stack Expense Tracker web application built using modern web technologies. Engineered with a **Clean Minimalism** design aesthetic, it empowers users with secure JWT authorization, intuitive financial entries, and advanced visual dashboards.

---

## ⚙️ Key Technical Features

- **🔐 Robust Auth System:** Register with secure name, email, and password (salted 10-rounds and hashed via `bcryptjs`). Login returns verified JSON Web Tokens (JWT) stored client-side in `localStorage`. Guarded routing redirects unauthenticated traffic instantly to `/login`.
- **📊 Comprehensive Dashboard:** Instantly view Total Net Balance, Monthly Incomes, and Monthly Expenditures. Visualized with sleek category distribution Doughnut charts and lists your recent 5 transactions with color-coded markers.
- **📝 Transaction Ledger:** Full CRUD capabilities with inline edits, deletions, category tags, search filters, and date range search parameters. Displays running totals dynamically.
- **📈 Deep Analytics Reports:** Renders real-time dashboards utilizing `chart.js` and `react-chartjs-2`, featuring month-on-month trends, category breakdowns, and gross spending bars.
- **🔌 Dual DB Fallback Engine:** To ensure a flawless live workspace preview experience, the database connection layer features a smart fallback. If a valid `MONGO_URI` isn't provided, it automatically routes queries to a local JSON file database (`/server/data/db.json`). Once a real URI is supplied, it instantly scales to a production MongoDB cluster!

---

## 📂 Complete Folder Structure

```text
expense-tracker/
│
├── server/
│   ├── config/
│   │   ├── db.ts           # Mongoose MongoDB connection & fallback orchestrator
│   │   └── localDb.ts       # Embedded JSON-file backup database engine
│   ├── models/
│   │   ├── User.ts         # User schema & dual DB controller operations
│   │   └── Transaction.ts  # Transaction schema & dual DB CRUD controllers
│   ├── middleware/
│   │   └── authMiddleware.ts # Secured endpoint router verification
│   ├── controllers/
│   │   ├── authController.ts # User Register / Login controllers
│   │   └── transactionController.ts # Transactions CRUD & aggregators
│   ├── routes/
│   │   ├── authRoutes.ts    # Authentication routes
│   │   └── transactionRoutes.ts # Transaction CRUD & Analytics routes
│   ├── server.ts           # Main full-stack entry point (Vite + Express middleware)
│   └── data/               # Auto-created folder for local database backup
│
├── src/                    # Frontend client code
│   ├── api/
│   │   └── axios.ts        # Axios client with automatic bearer headers & auth redirectors
│   ├── context/
│   │   └── AuthContext.tsx # Global session provider (credentials persistence)
│   ├── components/
│   │   ├── Sidebar.tsx     # Modern navy (#1E1E2E) navigation with mobile drawer
│   │   ├── Navbar.tsx      # Greeting details and profile notifications
│   │   ├── TransactionForm.tsx # Transaction addition/modification validation form
│   │   ├── TransactionItem.tsx # Dynamic transaction row with interactive controls
│   │   ├── SummaryCard.tsx # Visual balances with progress animations
│   │   ├── Toast.tsx       # Custom success/error notification banners
│   │   ├── Spinner.tsx     # Sleek loading spinners
│   │   └── ProtectedRoute.tsx # Guards secure views from unauthorized requests
│   ├── charts/
│   │   ├── DoughnutChart.tsx # Category percentages
│   │   ├── LineChart.tsx   # MoM Income vs Expense trend
│   │   └── BarChart.tsx    # Monthly spending trends
│   ├── pages/
│   │   ├── Login.tsx       # Polished entry gateway
│   │   ├── Register.tsx    # Responsive registration form
│   │   ├── Dashboard.tsx   # Main analytics bento grid
│   │   ├── Transactions.tsx # Central ledger view
│   │   └── Analytics.tsx   # Visualized charts center
│   ├── styles/
│   │   ├── global.css      # System color variables & baseline elements
│   │   ├── sidebar.css     # Collapsible sidebar layouts
│   │   ├── auth.css        # Interactive signup views
│   │   ├── dashboard.css   # Main overview cards
│   │   ├── transactions.css # Ledger grids
│   │   └── analytics.css   # Chart containers
│   ├── App.tsx             # Primary root Router & protected view layouts
│   ├── main.tsx            # DOM anchor script
│   └── index.css           # Tailwind CSS imports
│
├── package.json            # Unified dependencies manager
├── tsconfig.json           # TS compiling configurations
└── vite.config.ts          # Vite bundler parameters
```

---

## 🗄️ Database Schemas

### User Schema
- **`name`**: `String` (Required)
- **`email`**: `String` (Required, unique, lowercase, trimmed)
- **`passwordHash`**: `String` (Required, bcrypt salted 10)
- **`createdAt`**: `Date` (Defaults to `Date.now`)

### Transaction Schema
- **`userId`**: `ObjectId` / `String` (Ref: 'User', Required)
- **`title`**: `String` (Required)
- **`amount`**: `Number` (Required, min: 0)
- **`type`**: `String` (Required, enum: `['income', 'expense']`)
- **`category`**: `String` (Required, enum: `['Food','Transport','Shopping','Bills','Health','Entertainment','Salary','Freelance','Other']`)
- **`date`**: `Date` (Required)
- **`notes`**: `String` (Optional, defaults to empty)
- **`createdAt`**: `Date` (Defaults to `Date.now`)

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Protected | Headers / Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new user | ❌ Public | `{ name, email, password }` |
| **POST** | `/api/auth/login` | Login user & return JWT | ❌ Public | `{ email, password }` |
| **GET** | `/api/transactions` | Fetch all user transactions | 🔑 Protected | Query params: `type`, `category`, `startDate`, `endDate` |
| **POST** | `/api/transactions` | Create a transaction | 🔑 Protected | `{ title, amount, type, category, date, notes }` |
| **PUT** | `/api/transactions/:id`| Update transaction fields | 🔑 Protected | `{ title, amount, type, category, date, notes }` (any) |
| **DELETE**| `/api/transactions/:id`| Delete specific transaction | 🔑 Protected | None |
| **GET** | `/api/transactions/summary`| Fetch dashboard card metrics| 🔑 Protected | None (Returns totals & recent 5 items) |
| **GET** | `/api/transactions/analytics`| Fetch graph breakdowns | 🔑 Protected | None (Returns category split & 6-month trends) |

---

## 🛠️ Local Development Setup

To run the application locally outside of the AI Studio sandbox, execute the following steps:

### 1. Configure Environment Variables
Create a `.env` file inside the root directory and define the following variables:
```env
PORT=3000
JWT_SECRET=supersecretkey123
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/expensetracker
NODE_ENV=development
```
*(If `MONGO_URI` is left blank, the application automatically activates the self-contained JSON file database!)*

### 2. Install Packages
Run the following package install at the project root directory:
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** to access the application!
