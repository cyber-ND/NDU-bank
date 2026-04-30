# NDU Bank — Digital Banking System

A backend banking system built with Node.js, Express, and MongoDB, integrated with the NIBSS by Phoenix API as part of the TS Academy Phoenix Cohort assignment.

---

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- NIBSS by Phoenix API

---

## Features

- Customer onboarding with BVN/NIN verification
- JWT-based authentication
- Bank account creation (one per customer)
- Account balance check
- Name enquiry
- Intra-bank and inter-bank fund transfers
- Transaction history (per customer, data isolated)
- Transaction status check
- Swagger API documentation

---

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB Atlas account
- NIBSS by Phoenix API credentials

### Installation

Clone the repo and install dependencies:

    git clone <your-repo-url>
    cd NDU-bank
    npm install

### Environment Variables

Create a `.env` file in the root directory:

    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
    NIBSS_API_KEY=your_api_key
    NIBSS_API_SECRET=your_api_secret
    BANK_CODE=your_bank_code
    BANK_NAME=your_bank_name

### Run the server

    # development
    npm run dev

    # production
    npm start

---

## API Documentation

Swagger UI available at:

    http://localhost:3000/api/docs

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/onboarding/register | No | Register a new customer |
| POST | /api/onboarding/create-account | Yes | Create bank account |
| POST | /api/auth/login | No | Login and get JWT token |
| GET | /api/accounts/me | Yes | Get account details |
| GET | /api/accounts/balance | Yes | Get account balance |
| GET | /api/accounts/name-enquiry/:accountNumber | Yes | Name enquiry |
| POST | /api/transfers | Yes | Send money |
| GET | /api/transfers/history | Yes | Transaction history |
| GET | /api/transfers/status/:transactionId | Yes | Transaction status |

---

## Project Structure

    src/
    ├── config/
    │   ├── db.js
    │   └── swagger.js
    ├── controllers/
    │   ├── authController.js
    │   ├── onboardingController.js
    │   ├── accountController.js
    │   └── transferController.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── Customer.js
    │   ├── Account.js
    │   └── Transaction.js
    ├── routes/
    │   ├── auth.js
    │   ├── onboarding.js
    │   ├── accounts.js
    │   └── transfers.js
    └── services/
        └── nibss.js

---

## Built By

Ndubuisi(brainycyber) — TS Academy Phoenix Cohort
