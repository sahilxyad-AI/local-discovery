# LocalConnect — AI-Powered Local Business Discovery Chatbot Platform

**LocalConnect** is an intelligent, full-stack, local discovery platform that connects customers with verified local businesses, shops, and service providers (electricians, plumbers, restaurants, dentists, salons, supermarkets, and electronics repair labs) through conversational AI recommendations, verified credentials, genuine customer reviews, and interactive OpenStreetMap navigation.

---

## 🌟 Key Platform Highlights

1. **Intelligent Conversational Chatbot**:
   - Understands natural queries like *"Find the best electrician near me"*, *"Suggest affordable restaurants nearby"*, *"Find a salon offering services under ₹500"*, and *"Which grocery store has the highest rating?"*
   - Context-aware slot filling: Prompts for area or PIN code if location is unspecified.
   - Dynamic recommendation rationale: Explains why each business is recommended based on verification credentials, rating volume, pricing budget, and distance.
   - Clickable business recommendation cards with instant modal details, calling, directions, and comparison.
   - Voice dictation / speech recognition support.

2. **Location-Based Discovery & Interactive Map**:
   - Geolocation support (browser GPS auto-detect or manual area / 6-digit PIN code selection).
   - Interactive Leaflet OpenStreetMap with custom rating pins, popups, and radius filtering (1 km – 30 km).
   - Distance calculation powered by the Haversine formula.

3. **Authentic Verification & Trust Transparency**:
   - Distinct verified badges with verification dates and official registration numbers (Trade License, GSTIN, FSSAI, Medical Establishment ID).
   - Clear distinction between verified and unverified profiles. Zero fake or hallucinated badges.

4. **Customer Ratings & Moderated Reviews**:
   - 1 to 5 star ratings with verified transaction receipt badges.
   - Sorting by Newest, Highest Rating, and Lowest Rating.
   - Abuse reporting workflow with automated moderation flags.
   - Official business owner replies displayed under reviews.

5. **Multi-Role Perspectives**:
   - **Customer**: Natural language chatbot, search & filter directory, side-by-side comparison matrix, write reviews, bookmark favorites, request callbacks.
   - **Business Owner**: Register new business, manage products & services catalog, submit verification evidence, reply to customer reviews, and view inquiries.
   - **Administrator**: Audit verification queue (approve/reject with reasons), moderate reported reviews, and monitor platform KPIs.
   - **Quick Role Switcher**: Instant 1-click switcher pill on top navigation for seamless demonstration and evaluation.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React, Leaflet (OpenStreetMap) |
| **Backend** | Node.js, Express, CORS, Dotenv, CommonJS |
| **AI / NLU Engine** | Entity extraction, category mapping, distance weighting & recommendation ranker |
| **Database** | Embedded relational data store (`backend/db/data.json`) + PostgreSQL schema (`backend/db/schema.sql`) |
| **Geolocation** | Haversine formula, OpenStreetMap tiles, GPS Navigator API |

---

## 📁 Project Directory Structure

```text
c:\Users\ramaf\Documents\ak\
├── index.html                   # Root entry launcher
├── README.md                    # Platform documentation & setup guide
├── backend/
│   ├── server.js                # Express app, static serving, API mounting
│   ├── .env.example             # Environment variable configuration template
│   ├── test_suite.js            # Automated verification test suite (11 tests)
│   ├── db/
│   │   ├── schema.sql           # Production PostgreSQL database schema
│   │   ├── database.js          # Relational manager with seed data & mutations
│   │   └── data.json            # Active database state file
│   ├── services/
│   │   ├── aiChatbotService.js  # NLU parsing, entity extraction, recommendation reasoning
│   │   └── geoService.js        # Haversine distance & business hours analyzer
│   └── routes/
│       ├── auth.js              # Authentication and role switcher endpoints
│       ├── businesses.js        # Search, filter, registration, inquiries
│       ├── reviews.js           # Reviews, verified transactions, replies, reporting
│       ├── verification.js      # Document submission & admin review
│       ├── chat.js              # Chatbot conversation endpoint
│       └── admin.js             # Platform stats & review moderation
└── frontend/
    ├── package.json
    ├── vite.config.js           # Proxy configuration to port 5000
    ├── tailwind.config.js       # Brand color palette & dark mode
    ├── index.html               # Head tags, Inter font, Leaflet CSS
    ├── dist/                    # Compiled production bundle
    └── src/
        ├── App.jsx              # Main view router & global modals
        ├── main.jsx             # React DOM root
        ├── index.css            # Tailwind base & custom animations
        ├── context/
        │   └── AppContext.jsx   # Global state (user, location, compare, favorites)
        ├── services/
        │   └── api.js           # REST API client
        └── components/
            ├── Navbar.jsx       # Header with location picker & role switcher
            ├── Chat/
            │   └── ChatView.jsx # Conversational chatbot interface
            ├── Explore/
            │   └── ExploreView.jsx # Leaflet map & directory search
            ├── Business/
            │   ├── BusinessCard.jsx        # Recommendation card
            │   ├── BusinessDetailsModal.jsx# Full profile & reviews modal
            │   └── CompareModal.jsx        # Side-by-side comparison matrix
            ├── Owner/
            │   └── OwnerPortal.jsx         # Merchant dashboard & verification
            ├── Admin/
            │   └── AdminPortal.jsx         # Verification queue & moderation
            └── Modals/
                ├── AuthModal.jsx           # Sign in & demo account switcher
                └── InquiryModal.jsx        # Callback request modal
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18, v20, or v22)
- npm (v9 or higher)

### 1. Start the Backend Server
```bash
cd backend
npm install
node server.js
```
The server will start at `http://localhost:5000`. It serves both the backend REST API (`/api/...`) and the compiled production frontend!

### 2. (Optional) Run the Frontend in Vite Dev Mode
```bash
cd frontend
npm install
npm run dev
```
The dev server will be accessible at `http://localhost:5173` with instant Hot Module Replacement (HMR).

### 3. Open in Browser
Visit **`http://localhost:5000`** in your browser.

---

## 🧪 Automated Testing

LocalConnect includes an automated test suite verifying all 11 core functional workflows:
```bash
cd backend
node test_suite.js
```

### Verified Test Cases:
1. `Backend Health Check Endpoint`: Verifies server status and business count.
2. `AI Chatbot Intent & Slot Filling`: Verifies location prompting when querying "near me".
3. `AI Chatbot Indiranagar Recommendation`: Verifies structured business cards & rationale.
4. `AI Chatbot Restaurant Budget Query`: Verifies budget and rating ranking.
5. `AI Chatbot Dentist Availability`: Verifies open today filter logic.
6. `AI Chatbot Salon Budget Filter`: Verifies under ₹500 service matching.
7. `Location & Radius Search`: Verifies distance calculation and verification filter.
8. `Customer Review Lifecycle`: Tests submission, verified transaction flag, report review, and owner reply.
9. `Business Verification Workflow`: Tests document submission and admin approval.
10. `Admin Dashboard & Moderation`: Verifies platform KPIs and review moderation.
11. `Customer Callback / Inquiry Submission`: Tests direct merchant inquiry submission.

---

## 📡 API Documentation

### 1. Chatbot
- `POST /api/chat`: Send conversational message.
  - Request body: `{ "message": "Find electrician in Indiranagar", "userLocation": { "lat": 12.9784, "lng": 77.6408, "area": "Indiranagar" } }`
  - Response: `{ "message": "...", "businessCards": [...], "suggestedFollowUps": [...] }`
- `GET /api/chat/quick-prompts`: Returns default suggestion buttons and sample prompts.

### 2. Businesses
- `GET /api/businesses`: Search businesses with filters:
  - Query params: `q`, `category`, `area`, `lat`, `lng`, `radius`, `minRating`, `priceTier`, `maxBudget`, `verifiedOnly`, `openNow`, `sort`
- `GET /api/businesses/:id`: Get full business profile with services and live hours status.
- `POST /api/businesses`: Register a new business (Owner role).
- `POST /api/businesses/:id/inquiries`: Submit customer callback request.

### 3. Reviews
- `GET /api/reviews/:businessId`: List reviews for a business (`sort=newest|highest|lowest`).
- `POST /api/reviews`: Submit review with star rating and verified transaction tag.
- `POST /api/reviews/:id/reply`: Post business owner reply.
- `POST /api/reviews/:id/report`: Report suspicious or abusive review.

### 4. Verification & Admin
- `GET /api/verification`: List verification requests (`status=pending|approved|rejected`).
- `POST /api/verification`: Submit verification documents (Owner role).
- `POST /api/verification/:id/review`: Approve or reject verification request (Admin role).
- `GET /api/admin/stats`: Get platform KPIs (total shops, % verified, pending audits, flagged reviews).
- `POST /api/admin/reviews/:id/action`: Moderate flagged review (`action=approve|remove`).

---

## 🚢 Production Deployment Guide

### Deploying with Docker / Cloud Containers
1. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@db-host:5432/localconnect
   ```
2. Run database migration in PostgreSQL:
   ```bash
   psql -d localconnect -f backend/db/schema.sql
   ```
3. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```
4. Start the application:
   ```bash
   cd backend && node server.js
   ```

---

## 🔒 Security & Quality Standards
- **Zero Inventions**: All recommendations, ratings, and opening hours reflect actual database records.
- **Verification Integrity**: Badges require statutory license numbers and administrative review.
- **Safe Moderation**: Automated abuse flags protect local merchants from harassment and fake reviews.
- **Privacy First**: Browser location is strictly opt-in and coordinates are never stored without consent.
