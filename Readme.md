<div align="center">

# 🍽️ CatchOrder - Restaurant Management System

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-5.2.1-lightgrey.svg" alt="Express">
  <img src="https://img.shields.io/badge/SQLite-3-blue.svg" alt="SQLite">
  <img src="https://img.shields.io/badge/Jest-30.2.0-red.svg" alt="Jest">
</p>

A complete order management system for restaurants, built with Node.js, TypeScript, and a modular architecture. Efficiently control tables, orders, products, users, and categories in a robust and scalable application.

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [How to Use](#-how-to-use)
- [Running Tests](#-running-tests)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database](#-database)
- [Contributing](#-contributing)
- [Authors](#-authors)
- [License](#-license)

---

## 📖 About the Project

**CatchOrder** is a comprehensive solution designed to optimize restaurant operations. Using an efficient SQLite database, the system provides all necessary tools to manage the daily workflow of a dining establishment, from user authentication to final payment processing.

Key management areas:
- 👥 **Users** - Staff management with specific roles.
- 🪑 **Tables** - Real-time occupancy and status tracking.
- 📋 **Orders** - Detailed order registration and item tracking.
- 🍔 **Products** - Full menu catalog management.
- 🏷️ **Categories** - Logical organization of menu items.
- 💰 **Payments** - Integrated bill closing and history.

---

## ✨ Features

### 🔐 Authentication & Security
- [x] Secure login system using JWT.
- [x] Password hashing with bcrypt.
- [x] **Rate Limiting** to prevent brute-force attacks.
- [x] Security headers (Helmet-like implementation).

### 👥 User Management
- [x] Full CRUD for system users.
- [x] **Roles**: Admin, Manager, and Waiter.
- [x] Profile management with avatar support.

### 🪑 Table Control
- [x] Table registration and numbering.
- [x] Status management: `AVAILABLE`, `OCCUPIED`, `RESERVED`.
- [x] Dynamic waiter assignment to active tables.

### 📋 Order Management
- [x] Real-time order creation per table.
- [x] Dynamic item management (add/remove/update quantity).
- [x] Status tracking: `OPEN`, `CLOSED`, `CANCELLED`.
- [x] Automated subtotals and service fee (tip) calculations.

### 🍔 Menu & Categories
- [x] Complete product catalog with images.
- [x] Categorization (e.g., Drinks, Main Dishes, Desserts).
- [x] Availability toggle for seasonal items.

---

## 🛠️ Technologies

### Backend
- **Node.js** & **TypeScript** - Core runtime and type safety.
- **Express 5** - Web framework for robust routing.
- **SQLite3** - Portable, zero-config relational database.
- **jsonwebtoken** & **bcrypt** - Security and authentication.

### Frontend
- **Vanilla HTML/CSS/JS** - High performance, no heavy frameworks.
- **Webpack** - Module bundling and asset management.
- **PostCSS** - Modern CSS processing.

### Testing & Quality
- **Jest** & **Supertest** - Unit and integration testing.
- **ESLint** & **Prettier** - Code quality and formatting.

---

## 🏗️ Architecture

The project follows a modular architecture to ensure maintainability:

- **Backend**: Structured into Controllers, Services, Models, and Middlewares.
- **Frontend**: Page-based structure with reusable components and dedicated services for API communication.
- **Shared**: Common types and DTOs shared between frontend and backend to ensure end-to-end type safety.

---

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

---

## 🔧 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NikolasTesch/CatchOrder.git
   cd CatchOrder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy the example environment file and fill in your values.
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure `JWT_SECRET` is changed to a secure random string.*

4. **Initialize Database**:
   The system automatically runs migrations and seeds on first startup, but you can run them manually:
   ```bash
   npm run migrate
   ```

---

## 🚀 How to Use

### Development
Starts the server with hot-reload and prepares assets:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### Production
Build the project for production:
```bash
npm run build
```
Start the production server:
```bash
npm start
```

---

## ⚙️ Running Tests

### All Tests
```bash
npm test
```

### Coverage Report
```bash
npm run test:coverage
```

---

## 📁 Project Structure

```
CatchOrder/
├── 📂 public/                # Static assets and entry points
├── 📂 src/
│   ├── 📂 backend/           # API, Controllers, Models, Database logic
│   │   ├── 📂 database/      # Migrations and Seeds
│   │   └── ...
│   ├── 📂 frontend/          # Vanilla JS Pages and Styling
│   └── 📂 shared/            # Common types/DTOs
├── 📂 tests/                 # Unit and Integration tests
├── .env                      # Local configuration
└── webpack.config.ts         # Frontend build config
```

---

## 🌐 API Endpoints (Core)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/logout` | Terminate session |
| `GET` | `/api/auth/me` | Current user profile |
| `GET` | `/api/users` | List all staff members |
| `GET` | `/api/tables` | Current table status |
| `POST` | `/api/orders` | Open a new order |
| `GET` | `/api/products` | Fetch menu items |
| `GET` | `/api/categories` | Fetch item categories |

---

## 🤝 Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## ✒️ Authors

- **Nikolas Tesch** - *Initial Work* - [NikolasTesch](https://github.com/NikolasTesch)

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Developed with 💙 by [Nikolas Tesch](https://github.com/NikolasTesch)**

</div>