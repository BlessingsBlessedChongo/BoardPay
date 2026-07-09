# BoardPay Backend Integration Documentation

Complete documentation for integrating the BoardPay frontend with backend APIs.

---

## Quick Start

This repository contains the **BoardPay Frontend** - a fintech student housing payment management system. The frontend is fully built with React + Vite and currently uses mock data. Your task is to implement backend APIs to replace the mock data with real database operations.

### Files in This Directory

1. **BACKEND_INTEGRATION_GUIDE.md** - Complete API specifications with endpoint details
2. **DATA_SCHEMAS.md** - TypeScript/JSON schemas for all data structures
3. **INTEGRATION_CHECKLIST.md** - Step-by-step implementation guide with priority order
4. **API_EXAMPLES.md** - Real-world request/response examples with cURL commands
5. **This file (BACKEND_README.md)** - Overview and quick reference

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  - Student Dashboard (payments, maintenance)                │
│  - Caretaker Dashboard (verify receipts)                    │
│  - Landlord Dashboard (analytics, notices)                  │
│  - AI Chat (Groq powered)                                   │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/JWT
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend (Django/FastAPI/Other)               │
│  - JWT Authentication                                       │
│  - Payment Management                                       │
│  - OCR Integration (Google Vision/Tesseract)               │
│  - Database (PostgreSQL/MySQL)                             │
│  - Groq AI API Integration                                 │
│  - Email/SMS Services                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features Requiring Backend APIs

### Student Features
- ✅ User authentication with JWT
- ✅ Payment receipt upload & OCR extraction
- ✅ Real-time billing timeline status
- ✅ AI-powered chat assistant (rent, lease, maintenance questions)
- ✅ Maintenance request tracking

### Caretaker Features
- ✅ List pending payment verifications
- ✅ Review receipts with OCR highlights (canvas rendering)
- ✅ Approve/reject payments with reasons
- ✅ Keyboard shortcuts (A: approve, R: reject, ?: help)

### Landlord Features
- ✅ Financial flow visualization (Sankey diagram)
- ✅ Delinquent payment tracking
- ✅ AI-generated delinquency notices
- ✅ Lease document generation & printing
- ✅ Property analytics

---

## Technology Stack Requirements

### Backend Recommendations
- **Framework:** Django (with DRF) or FastAPI
- **Database:** PostgreSQL (recommended)
- **Authentication:** JWT (Python: PyJWT, Node: jsonwebtoken)
- **OCR:** Google Cloud Vision API or Tesseract
- **AI Integration:** Groq API (https://api.groq.com/)
- **Email:** Django Mail or SendGrid
- **File Storage:** Django media files or AWS S3

### Python Stack (Recommended)
```
Django==4.2
djangorestframework==3.14
djangorestframework-simplejwt==5.2
Pillow==10.0
google-cloud-vision==3.4
groq==0.4
celery==5.3  (for async OCR)
psycopg2-binary==2.9
```

### Node.js Stack (Alternative)
```
Express
jsonwebtoken
prisma
groq-sdk
multer (file upload)
nodemailer
```

---

## Implementation Priority

### Phase 1: Authentication (Do this first!)
1. Implement `POST /api/auth/token/` with JWT generation
2. Embed `role` (STUDENT/CARETAKER/LANDLORD) in JWT payload
3. Implement token refresh endpoint

**Why first:** Frontend cannot load any dashboard without valid token

### Phase 2: Student Core Features
1. Get dashboard data endpoint
2. Receipt upload & OCR integration
3. Payment submission
4. AI chat endpoint

**Why next:** Main revenue-generating feature

### Phase 3: Caretaker Verification
1. List pending verifications
2. Approve/reject endpoint
3. Rejection notifications

**Why:** Critical for payment flow completion

### Phase 4: Landlord & AI Features
1. Financial flow analytics
2. Delinquent payment list
3. AI notice generation
4. Lease templates

**Why:** Nice-to-have but enhances product

---

## Database Schema (Recommended)

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(150) UNIQUE NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'CARETAKER', 'LANDLORD')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id),
  room_id INT NOT NULL REFERENCES rooms(id),
  payment_streak INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_reference VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  receipt_image_url VARCHAR(500),
  ocr_data JSONB,  -- Stores extracted data, bounding boxes, confidence
  current_step VARCHAR(50),  -- RECEIPT_UPLOADED, CARETAKER_REVIEW, SECURED_ON_LEDGER
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Verification (Caretaker Review)
CREATE TABLE payment_verifications (
  id SERIAL PRIMARY KEY,
  payment_id INT NOT NULL REFERENCES payments(id),
  caretaker_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject')),
  reason TEXT,
  verified_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  assigned_to INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties (for landlord)
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  landlord_id INT NOT NULL REFERENCES users(id),
  address TEXT,
  total_units INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(id),
  room_number VARCHAR(50) NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leases
CREATE TABLE leases (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id),
  room_id INT NOT NULL REFERENCES rooms(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat History (optional)
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id),
  sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'assistant')),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Groq API Setup

The AI chat feature uses Groq API (free tier available):

1. Sign up at https://console.groq.com
2. Create API key
3. Set environment variable:
   ```bash
   export GROQ_API_KEY="gsk_your_key_here"
   ```

4. Example Python integration:
   ```python
   from groq import Groq
   client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
   
   response = client.chat.completions.create(
       model="llama-3-70b-versatile",
       messages=[{"role": "user", "content": "Hello"}],
       max_tokens=150
   )
   ```

---

## CORS Configuration

The backend must allow the frontend origin:

### Django
```python
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware'] + MIDDLEWARE

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Development
    "https://yourdomain.com"  # Production
]

CORS_ALLOW_CREDENTIALS = True
```

### FastAPI
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Local Development Setup

### Backend (Django Example)

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
export GROQ_API_KEY="your_key"
export JWT_SECRET="your_secret_key"

# 4. Run migrations
python manage.py migrate

# 5. Create superuser (optional)
python manage.py createsuperuser

# 6. Start server
python manage.py runserver 0.0.0.0:8000
```

### Frontend (Already set up)

```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### Test Integration

```bash
# Terminal 1: Backend
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Test endpoints
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

---

## Testing Endpoints

### 1. Authentication
```bash
# Login
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"chanda.mwamba","password":"password"}'

# Response should have "access" and "refresh" tokens
```

### 2. Student Dashboard
```bash
TOKEN="your_access_token_here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/student/dashboard/
```

### 3. AI Chat
```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:8000/api/ai/chat/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What about my rent?",
    "context": {"room": "Room 4B"}
  }'
```

### 4. Receipt Upload
```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:8000/api/student/payments/upload/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@receipt.jpg" \
  -F "amount=2500"
```

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** 
1. Check `CORS_ALLOWED_ORIGINS` includes frontend URL
2. Ensure backend returns proper CORS headers
3. Browser DevTools → Network tab → Check response headers

### Issue: JWT Token Invalid
**Solution:**
1. Verify JWT_SECRET matches between token generation and validation
2. Check token hasn't expired
3. Verify Bearer token format in Authorization header

### Issue: OCR Not Working
**Solution:**
1. Test OCR service separately (Google Vision API, Tesseract)
2. Check file is valid JPEG/PNG
3. Review OCR service API limits and quotas

### Issue: AI Chat Not Responding
**Solution:**
1. Verify GROQ_API_KEY is set correctly
2. Check Groq API account has remaining quota
3. Ensure request is under 2-second timeout
4. Review rate limiting (10 requests/minute)

---

## Deployment Checklist

### Before Going to Production
- [ ] All endpoints tested and working
- [ ] Database backups configured
- [ ] HTTPS enabled on all endpoints
- [ ] JWT_SECRET changed to strong random value
- [ ] CORS restricted to production domain only
- [ ] Rate limiting enabled on auth endpoints
- [ ] Error logging configured (Sentry, LogRocket)
- [ ] Database indexes on frequently-queried columns
- [ ] Environment variables properly set on server
- [ ] GROQ_API_KEY and other secrets in env vars (not in code)

---

## Support & Questions

### Frontend Issues
- Check `/frontend/src/components/` for component-specific comments
- Search for "mockAPI" or "MOCK_" to find mock data locations
- Components have inline comments about API integration points

### Detailed API Reference
- See **BACKEND_INTEGRATION_GUIDE.md** for complete endpoint specs
- See **DATA_SCHEMAS.md** for all data types and validations
- See **API_EXAMPLES.md** for real request/response examples

### Implementation Help
- Start with **INTEGRATION_CHECKLIST.md** Phase 1
- Follow the priority order (authentication first!)
- Test each endpoint as you build using provided cURL commands

---

## Summary

The BoardPay frontend is **production-ready** and waiting for backend integration. The frontend uses:

- **JWT authentication** with role-based access
- **React hooks** for state management
- **Responsive design** (mobile-first)
- **Real-time updates** with polling
- **Glassmorphic UI** with premium fintech styling
- **OCR canvas rendering** for receipt highlights
- **AI-powered chat** with Groq integration

Your job is to:

1. ✅ Implement all API endpoints (detailed specs provided)
2. ✅ Connect to database (schema provided)
3. ✅ Integrate Groq API for chat (examples provided)
4. ✅ Handle authentication with JWT (specs provided)
5. ✅ Add error handling and validation

**You have everything you need.** Follow the checklist, refer to examples, and implement endpoints in priority order. Good luck! 🚀
