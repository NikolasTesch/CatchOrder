<div align="center">

# 🍽️ SnapOrder

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-5.2.1-lightgrey.svg" alt="Express">
  <img src="https://img.shields.io/badge/SQLite-3-blue.svg" alt="SQLite">
  <img src="https://img.shields.io/badge/Jest-30.2.0-red.svg" alt="Jest">
</p>

Complete restaurant order management system, built with Node.js, TypeScript, and modular architecture. Efficient control of tables, orders, products, users, and more in a robust and scalable application.

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technologies](#-technologies)
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

**SnapOrder** is a complete application developed to optimize the management of operations in gastronomic establishments. With a lean and efficient SQLite database, the system offers all the necessary functionalities to control:

- 👥 **Users** - Employee management and permissions
- 🪑 **Tables** - Occupancy control and status
- 📋 **Orders** - Order registration and tracking
- 🍔 **Products** - Complete menu catalog
- 💰 **Payments** - Payment processing and financial history

Ideal for restaurants, bars, cafeterias, and food trucks looking to modernize their operational management.

---

## ✨ Features

### 🔐 Authentication and Authorization
- [x] JWT-based login system
- [x] Password hashing with bcrypt
- [x] Role-based permission control

### 👥 User Management
- [x] Create, view, update, and delete users
- [x] Profiles: Admin, Waiter, Kitchen, Cashier

### 🪑 Table Control
- [x] Table registration and management
- [x] Status: Available, Occupied, Reserved
- [x] Order association

### 📋 Order Management
- [x] Create orders associated with tables
- [x] Add/remove order items
- [x] Status: Pending, In Preparation, Ready, Delivered
- [x] Automatic total calculation

### 🍔 Product Catalog
- [x] Complete product CRUD
- [x] Categorization (Drinks, Dishes, Desserts, etc.)
- [x] Price and availability control

### 💳 Payment System
- [x] Bill closing
- [x] Multiple payment methods
- [x] Transaction history

---

## 🛠️ Technologies

This project was built with the following technologies:

### Backend
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript superset with static typing
- **[Express](https://expressjs.com/)** - Minimalist and flexible web framework
- **[SQLite3](https://www.sqlite.org/)** - Embedded SQL database

### Security
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - JWT authentication
- **[cors](https://www.npmjs.com/package/cors)** - Cross-Origin Resource Sharing control
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)** - Cookie parsing

### Development
- **[Jest](https://jestjs.io/)** - Testing framework
- **[ts-jest](https://kulshekhar.github.io/ts-jest/)** - Jest preset for TypeScript
- **[ts-node-dev](https://www.npmjs.com/package/ts-node-dev)** - Hot reload for development

### Others
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Environment variables
- **[uuid](https://www.npmjs.com/package/uuid)** - Unique ID generator

---

## 📋 Prerequisites

Before starting, make sure you have the following installed on your machine:

- **Node.js** (version 18 or higher)
- **npm** (usually comes with Node.js) or **yarn**
- **Git** (to clone the repository)

To check if you already have them installed:

```bash
node --version
npm --version
git --version
```

---

## 🔧 Installation

Follow these steps to set up the project on your local machine:

### 1. Clone the repository

```bash
git clone https://github.com/NikolasTesch/DesafioRestaurante.git
cd DesafioRestaurante
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Configure the necessary variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_PATH=./database/restaurante.db

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Run database migrations

```bash
npm run migrate
```

### 5. (Optional) Seed the database with test data

```bash
npm run seed
```

---

## 🚀 How to Use

### Development Mode

Starts the server with hot reload (automatically restarts when changes are detected):

```bash
npm run dev
```

The server will be available at: `http://localhost:3000`

### Production Mode

Compile the TypeScript project to JavaScript:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

---

## ⚙️ Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

Useful during development - automatically reruns tests:

```bash
npm run test:watch
```

### Generate coverage report

```bash
npm run test:coverage
```

The report will be generated at `coverage/lcov-report/index.html`

### 🔩 Implemented Tests

- ✅ **Unit Tests** - Isolated Controllers and Services
- ✅ **Integration Tests** - Complete API flows
- ✅ **Mocks** - Express Request/Response

**Example output:**
```
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        0.588 s
```

---

## 📁 Project Structure

```
DesafioRestaurante/
├── 📂 database/              # Database and migrations
│   ├── migrations/           # Table creation scripts
│   └── seeds/                # Initial data for seeding
├── 📂 public/                # Static files (frontend)
│   ├── css/                  # Styles
│   ├── img/                  # Images
│   └── uploads/              # File uploads
├── 📂 src/
│   ├── 📂 backend/           # Server code
│   │   ├── app.ts            # Express configuration
│   │   ├── server.ts         # Server initialization
│   │   ├── 📂 config/        # Configurations (DB, Auth, etc.)
│   │   ├── 📂 controllers/   # Controllers (route logic)
│   │   ├── 📂 middlewares/   # Middlewares (auth, validation, etc.)
│   │   ├── 📂 models/        # Data models (entities)
│   │   ├── 📂 routes/        # API route definitions
│   │   ├── 📂 services/      # Business logic
│   │   └── 📂 utils/         # Utility functions
│   ├── 📂 frontend/          # User interface
│   │   ├── 📂 components/    # Reusable components
│   │   ├── 📂 pages/         # Application pages
│   │   ├── 📂 services/      # API requests
│   │   └── 📂 utils/         # Frontend helpers
│   └── 📂 shared/            # Shared code
│       ├── 📂 dtos/          # Data Transfer Objects
│       └── 📂 types/         # TypeScript type definitions
├── 📂 tests/                 # Automated tests
│   ├── 📂 integration/       # Integration tests
│   └── 📂 unit/              # Unit tests
├── .env                      # Environment variables (not versioned)
├── .gitignore                # Files ignored by Git
├── jest.config.js            # Jest configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

---

## 🌐 API Endpoints

### 🔐 Authentication

| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| POST   | `/auth/login`   | User login          |
| POST   | `/auth/logout`  | User logout         |
| GET    | `/auth/me`      | User data           |

### 👥 Users

| Method | Endpoint         | Description               |
|--------|------------------|---------------------------|
| GET    | `/users`         | List all users            |
| GET    | `/users/:id`     | Get specific user         |
| POST   | `/users`         | Create new user           |
| PUT    | `/users/:id`     | Update user               |
| DELETE | `/users/:id`     | Remove user               |

### 🪑 Tables

| Method | Endpoint         | Description               |
|--------|------------------|---------------------------|
| GET    | `/tables`        | List all tables           |
| GET    | `/tables/:id`    | Get specific table        |
| POST   | `/tables`        | Create new table          |
| PUT    | `/tables/:id`    | Update table              |
| DELETE | `/tables/:id`    | Remove table              |

### 📋 Orders

| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| GET    | `/orders`             | List all orders               |
| GET    | `/orders/:id`         | Get specific order            |
| POST   | `/orders`             | Create new order              |
| PUT    | `/orders/:id`         | Update order                  |
| DELETE | `/orders/:id`         | Cancel order                  |
| POST   | `/orders/:id/items`   | Add item to order             |
| DELETE | `/orders/:id/items/:itemId` | Remove item from order  |

### 🍔 Products

| Method | Endpoint          | Description                 |
|--------|-------------------|-----------------------------|
| GET    | `/products`       | List all products           |
| GET    | `/products/:id`   | Get specific product        |
| POST   | `/products`       | Create new product          |
| PUT    | `/products/:id`   | Update product              |
| DELETE | `/products/:id`   | Remove product              |

---

## 🗄️ Database

### SQLite Schema

This project uses **SQLite** as database, ideal for:
- ✅ Fast development
- ✅ No database server needed
- ✅ Total portability
- ✅ Zero configuration

### Main Tables

```sql
-- System users
users (
  id, name, email, password_hash, role, created_at, updated_at
)

-- Restaurant tables
tables (
  id, number, capacity, status, created_at, updated_at
)

-- Orders
orders (
  id, table_id, user_id, status, total, created_at, updated_at
)

-- Order items
order_items (
  id, order_id, product_id, quantity, unit_price, subtotal
)

-- Menu products
products (
  id, name, description, category, price, available, created_at, updated_at
)
```

---

## 🤝 Contributing

Contributions are always welcome! This project follows the Git Flow workflow.

### How to contribute:

1. **Fork** the project
2. Create a **branch** for your feature
   ```bash
   git checkout -b feature/MyNewFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: Add new feature X'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/MyNewFeature
   ```
5. Open a **Pull Request**

### Commit Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

---

## ✒️ Authors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/NikolasTesch">
        <img src="https://github.com/NikolasTesch.png" width="100px;" alt="Nikolas Tesch"/><br>
        <sub>
          <b>Nikolas Tesch</b>
        </sub>
      </a>
    </td>
  </tr>
</table>

See also the list of [contributors](https://github.com/NikolasTesch/DesafioRestaurante/contributors) who participated in this project.

---

## 📄 License

This project is licensed under the **ISC** license. See the [LICENSE](LICENSE) file for more details.

---

## 🎁 Acknowledgments

- 🎓 **Alpha EdTech** - For the training and proposed challenge
- 💡 Node.js and TypeScript community
- 📚 All project contributors

---

<div align="center">

**⭐ If this project helped you, consider giving it a star!**

Developed with 💙 by [Nikolas Tesch](https://github.com/NikolasTesch)

</div>