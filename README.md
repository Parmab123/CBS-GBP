# 🏦 SecureBank - Core Banking System (CBS)

A modern Core Banking System (CBS) built using **Spring Boot**, **React.js**, **PostgreSQL**, and **JWT Authentication** with secure OTP-based login flow.

---

# 🚀 Features

## 🔐 Authentication & Security
- JWT Authentication
- Secure Login System
- OTP Verification via SMS
- Resend OTP Functionality
- Session-Based OTP Validation
- Role-Based Authorization
- Failed Login Attempt Tracking
- Secure API Protection using Spring Security

---

## 👤 Customer Management
- Create Customer CIF
- Update Customer Details
- Customer Search
- Customer Modification Requests
- KYC Verification
- Risk Profiling
- Address Management
- Nominee Management

---

## 🏦 CASA Account Operations
- Open CASA Account
- Account Status Management
- Account Facilities Management
- Follow-up Tracking

---

## 🤖 AI Assistant Integration
- Google Gemini AI Integration
- Banking Query Support
- Customer Insight Assistance

---

# 🛠️ Tech Stack

## Backend
- Java 21
- Spring Boot
- Spring Security
- JWT
- Hibernate / JPA
- PostgreSQL
- Maven

## Frontend
- React.js
- React Router
- Axios
- CSS3

## External Services
- Twilio SMS API
- Google Gemini API

---

# 🔑 Authentication Flow

```text
Login with Username & Password
            ↓
Generate OTP
            ↓
Send OTP to Registered Mobile
            ↓
Verify OTP
            ↓
Generate JWT Access Token
            ↓
Access Dashboard
```

---

# 📁 Project Structure

```text
CBS/
│
├── CBS/                    # Spring Boot Backend
│   ├── controller/
│   ├── service/
│   ├── dto/
│   ├── jwt/
│   └── config/
│
├── banking-ui/             # React Frontend
│   ├── pages/
│   ├── component/
│   ├── services/
│   └── App.jsx
│
└── SQL/
    ├── otp.sql
    └── database scripts
```

---

# ⚙️ Backend Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Parmab123/CBS-GBP.git
```

---

## 2️⃣ Configure Database

Update:

```properties
CBS/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cbs
spring.datasource.username=postgres
spring.datasource.password=your_password
```

---

## 3️⃣ Configure Twilio

```properties
twilio.account.sid=YOUR_TWILIO_SID
twilio.auth.token=YOUR_TWILIO_TOKEN
twilio.phone.number=YOUR_TWILIO_NUMBER
```

---

## 4️⃣ Configure Gemini API

```properties
gemini.api.key=YOUR_GEMINI_API_KEY
```

---

## 5️⃣ Run Backend

```bash
cd CBS
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

# 💻 Frontend Setup

## Install Dependencies

```bash
cd banking-ui
npm install
```

---

## Run React App

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔐 API Endpoints

## Authentication APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/login` | Login & Send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/refresh` | Refresh JWT Token |

---

# 📸 OTP Features

- Modern Banking UI
- Real-Time Countdown Timer
- OTP Expiry Validation
- Resend OTP Support
- Session-Based Verification
- Mobile Number Masking

---

# 🧪 Testing

## Backend Testing
- Postman

## Frontend Testing
- React UI Testing

---

# 🔒 Security Features

- Password Encryption
- JWT Token Validation
- OTP Expiration
- Secure Session Handling
- Protected Routes
- CORS Configuration

---

# 📌 Future Enhancements

- Account Statement Module
- Fund Transfer
- Transaction History
- Email Notifications
- Admin Dashboard
- Audit Logging
- AI Chat Improvements

---

# 👨‍💻 Developer

**Parmeshwar Bodake**

- Java Backend Developer
- Spring Boot Developer
- React Developer

---

# 📄 License

This project is developed for learning and educational purposes.
````
