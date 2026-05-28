# Smart Mess Management System 🍽️📱

The **Smart Mess Management System** is a modern full-stack web application designed to streamline student mess operations, automate meal tracking, and digitize transactions. Featuring secure backend architectures, a digital wallet system, and dynamic QR code generation, this application eliminates manual record-keeping and enhances dining efficiency.

---

## 🚀 Core Features

* **QR Code Meal Verification:** Instant meal validation at the mess counter using dynamically generated QR codes scanned by mess staff.
* **Digital Student Wallet:** A localized digital currency management system for seamless tracking of mess dues, recharges, and meal deductions.
* **Dynamic Menu & Tracking:** Automated tracking of breakfast, lunch, snacks, and dinner schedules.
* **Role-Based Dashboards:** Distinct execution panels for Students (viewing history, generating codes) and Mess Staff/Administrators (scanning records, inventory check).
* **Two-Factor Authentication Setup:** Built-in support for secure authentications utilizing advanced token-generation mechanisms (`speakeasy`).

---

## 🛠️ Tech Stack

* **Backend Runtime:** Node.js
* **Backend Framework:** Express.js
* **Database:** MySQL 2 (`mysql2` relational module)
* **Cross-Origin Routing:** CORS Middleware
* **Security & Environment Variables:** Dotenv (`.env` configuration parsing)
* **Authentication Hooks:** Speakeasy TOTP engine

---

## 📂 Project Structure

```text
MESS_MANAGEMENT-MAIN/
├── backend/
│   └── ... (Backend core controllers and business logic)
├── config/
│   └── db.js            # MySQL Relational Connection setup
├── controllers/
│   └── walletController.js # Wallet balance & transactional logic
├── frontend/
│   └── ... (User client views, dashboard designs, and asset styling)
├── routes/
│   └── ... (Express.js endpoint routers mapping requests to controllers)
├── .gitignore           # Safeguards local database credentials from GitHub
├── LICENSE              # Repository distribution license
├── package-lock.json    # Explicit dependency trees tracking configurations
├── package.json         # Project manifests and dependency tracking
├── schema.sql           # Database blueprint layout definitions
└── server.js            # Main gateway runner execution hook
