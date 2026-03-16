<div align="center">

# 🏥 TeleHealth — AI-Powered Rural Healthcare Platform

**A full-stack MERN telemedicine platform built for rural communities**  
Connecting patients, doctors, and pharmacies through one unified digital healthcare system.

![Platform](https://img.shields.io/badge/Platform-MERN%20Stack-green?style=flat-square)
![AI](https://img.shields.io/badge/AI-Groq%20%7C%20Llama%203.3-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Modules](#modules)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## 🌍 Overview

TeleHealth is a telemedicine web application designed specifically for **rural and underserved communities** where access to quality healthcare is limited. The platform enables:

- **Patients** to check symptoms using AI, consult doctors remotely, and find medicines nearby
- **Doctors** to receive consultation requests, view patient health records, and provide remote care
- **Pharmacies** to manage medicine inventory so patients can find available stock before travelling

Built during a **24-hour hackathon**, the platform addresses the critical gap in rural healthcare accessibility by combining AI-powered diagnostics with real-time telemedicine capabilities.

---

## ✨ Features

### 🔍 AI Symptom Checker
- Powered by **Groq API (Llama 3.3 70B)** — free and fast
- Patients select or type symptoms and receive instant AI analysis
- Returns possible conditions, urgency level (Low/Medium/High), and health advice
- Includes medical disclaimer and "Consult a Doctor" CTA for urgent cases
- Results saved to patient history in MongoDB

### 💬 Telemedicine Consultation System
- Patients request consultations with doctors via **text, audio, or video**
- Real-time chat powered by **Socket.io**
- Full **WebRTC video/audio calls** with peer-to-peer connection
- Doctors can view patient health records during consultation
- Prescription management — doctors add prescriptions to consultations

### 📋 Patient Health Records
- Comprehensive health profile: age, gender, blood group, height, weight
- Tag-based inputs for allergies, chronic diseases, and current medications
- Medical history free-text field
- One record per patient, always accessible to their treating doctor

### 💊 Medicine Availability Search
- Patients search for medicines by name across all registered pharmacies
- Results show pharmacy name, location, stock quantity, and price
- Filters: in-stock only, by location
- Results cached in localStorage for offline access

### 🆘 Emergency Mode
- Fully **offline-capable** — works without internet
- Emergency helpline numbers (one-tap calling)
- Step-by-step first aid for 8+ emergency conditions
- Accessible to all users without login

### 🌐 Rural Accessibility (Module 6)
- Text consultation mode for **low-bandwidth / 2G networks**
- Offline symptom checker with bundled rule-based fallback
- Medicine search results cached for offline viewing
- Gzip compression on all API responses (~70% size reduction)
- Lazy-loaded React components to minimize initial bundle size

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB** | Primary database |
| **Mongoose** | ODM for MongoDB |
| **Socket.io** | Real-time messaging & WebRTC signaling |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Groq SDK** | AI symptom analysis (Llama 3.3 70B) |
| **compression** | Gzip API responses |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite** | Build tool |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP requests |
| **Socket.io-client** | Real-time communication |
| **WebRTC** | Peer-to-peer video/audio calls |

---

## 📁 Project Structure

```
telehealth/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Login, register, JWT
│   │   ├── healthRecordController.js
│   │   ├── consultationController.js
│   │   ├── symptomController.js     # AI symptom analysis
│   │   ├── medicineController.js
│   │   └── ruralController.js       # Emergency info, lightweight APIs
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification, role guards
│   ├── models/
│   │   ├── User.js
│   │   ├── HealthRecord.js
│   │   ├── Consultation.js
│   │   ├── SymptomCheck.js
│   │   └── Medicine.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── healthRecordRoutes.js
│   │   ├── consultationRoutes.js
│   │   ├── symptomRoutes.js
│   │   ├── medicineRoutes.js
│   │   └── ruralRoutes.js
│   ├── services/
│   │   └── aiService.js             # Groq API integration
│   ├── socket/
│   │   └── socketHandler.js         # Socket.io + WebRTC signaling
│   ├── .env                         # Environment variables
│   └── server.js                    # Entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── HealthRecordForm.jsx
        │   ├── ConsultationRequest.jsx
        │   ├── ConsultationCard.jsx
        │   ├── ChatBox.jsx
        │   ├── PatientInfo.jsx
        │   ├── VideoCall.jsx            # Full WebRTC implementation
        │   ├── MedicineCard.jsx
        │   ├── MedicineItem.jsx
        │   ├── MedicineInventory.jsx
        │   ├── AddMedicineForm.jsx
        │   ├── EmergencyMode.jsx        # Offline emergency guide
        │   ├── OfflineSymptomChecker.jsx
        │   └── TextConsultation.jsx     # Low-bandwidth chat
        ├── pages/
        │   ├── Home.jsx                 # Landing page
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── PatientDashboard.jsx
        │   ├── DoctorDashboard.jsx
        │   ├── PharmacyDashboard.jsx
        │   ├── SymptomChecker.jsx
        │   ├── MedicineSearch.jsx
        │   └── ConsultationRoom.jsx     # Video/audio/chat room
        ├── services/
        │   └── api.js                   # Axios + all API calls
        └── App.jsx                      # Router + all routes
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Groq API key (free at https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/telehealth.git
cd telehealth
```

### 2. Set up the Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
npm run dev
```

### 3. Set up the Frontend
```bash
cd frontend
npm install
# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev
```

### 4. Open the app
- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000**

---

## 🔐 Environment Variables

Create `backend/.env` with the following:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/telehealth

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# AI - Groq (FREE at https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Health Records
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/records` | Create health record | Patient |
| GET | `/api/records/:patientId` | Get patient record | Patient/Doctor |
| PUT | `/api/records/:recordId` | Update health record | Patient |
| DELETE | `/api/records/:recordId` | Delete health record | Patient |

### Consultations
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/consultations/request` | Request consultation | Patient |
| GET | `/api/consultations/pending` | Get pending requests | Doctor |
| GET | `/api/consultations/patient/:id` | Get patient's consultations | Patient/Doctor |
| GET | `/api/consultations/doctor/:id` | Get doctor's consultations | Doctor |
| PUT | `/api/consultations/accept/:id` | Accept consultation | Doctor |
| PUT | `/api/consultations/complete/:id` | Mark as complete | Doctor |
| PUT | `/api/consultations/prescription/:id` | Add prescription | Doctor |
| POST | `/api/consultations/message/:id` | Send message | Patient/Doctor |

### Symptom Checker (AI)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/symptoms/check` | AI symptom analysis | Patient |
| GET | `/api/symptoms/history/:patientId` | Get symptom history | Patient/Doctor |

### Medicines
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/medicines/add` | Add medicine | Pharmacy |
| PUT | `/api/medicines/update/:id` | Update stock | Pharmacy |
| GET | `/api/medicines/search?name=` | Search medicines | Any |
| GET | `/api/medicines/pharmacy/:id` | Get pharmacy inventory | Any |
| DELETE | `/api/medicines/:id` | Remove medicine | Pharmacy |

### Emergency & Rural
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/emergency/info` | Emergency numbers + first aid | Public |
| GET | `/api/rural/medicines/search` | Lightweight medicine search | Private |
| GET | `/api/rural/health-check` | Connectivity ping | Public |

---

## 👥 User Roles

### 🩺 Patient
- Register and create health profile
- Run AI symptom checker
- Request doctor consultations (text/audio/video)
- Search medicine availability at nearby pharmacies
- Access emergency help (offline capable)

### 👨‍⚕️ Doctor
- View and accept pending consultation requests
- Access patient health records during consultation
- Conduct real-time chat, audio, and video consultations
- Add prescriptions to completed consultations
- Mark consultations as complete

### 💊 Pharmacy
- Add medicines to inventory with details (name, price, stock, location)
- Update medicine stock quantities
- View and manage full inventory
- Medicines visible to patients searching for availability

---

## 📦 Modules

| Module | Description | Status |
|---|---|---|
| **Module 1** | Authentication & Role-Based Access Control | ✅ Complete |
| **Module 2** | Patient Health Records | ✅ Complete |
| **Module 3** | Telemedicine Consultation System (chat/audio/video) | ✅ Complete |
| **Module 4** | AI Symptom Checker (Groq / Llama 3.3) | ✅ Complete |
| **Module 5** | Medicine Availability System | ✅ Complete |
| **Module 6** | Rural Accessibility & Low-Bandwidth Optimization | ✅ Complete |

---

## 🔌 Real-Time Features

### Socket.io Events
| Event | Direction | Description |
|---|---|---|
| `join_consultation` | Client → Server | Join consultation room |
| `send_message` | Client → Server | Send chat message |
| `receive_message` | Server → Client | Receive chat message |
| `webrtc_offer` | Client → Server → Client | WebRTC offer SDP |
| `webrtc_answer` | Client → Server → Client | WebRTC answer SDP |
| `webrtc_ice_candidate` | Client → Server → Client | ICE candidate |
| `webrtc_end_call` | Client → Server → Client | End call signal |

---

## 🌐 Deployment

### Backend (Render / Railway)
```bash
# Set environment variables in dashboard, then:
npm start
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the dist/ folder
# Set VITE_API_URL to your deployed backend URL
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- **Groq** for providing free, fast AI inference
- **Google** for Gemini AI API
- **Socket.io** for real-time communication
- Built with ❤️ for rural healthcare accessibility

---

<div align="center">
  <strong>Built for UAI Hackathon 2026</strong><br/>
  Making healthcare accessible for every community
<<<<<<< HEAD
</div>
=======
</div>
>>>>>>> 83142315d5dfd577819b364ad47f2db9f9a5fa66
