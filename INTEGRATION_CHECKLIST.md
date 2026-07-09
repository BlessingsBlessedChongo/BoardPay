# Frontend-Backend Integration Checklist

This checklist guides backend developers through implementing each feature to replace mock data in the BoardPay frontend.

---

## Phase 1: Authentication (CRITICAL - START HERE)

### 1.1 Implement JWT Token Endpoint
- [ ] Create `POST /api/auth/token/` endpoint
- [ ] Accept `username` and `password` in request body
- [ ] Validate credentials against user database
- [ ] Generate JWT token with embedded `role` claim
- [ ] Include role in JWT payload: `STUDENT`, `CARETAKER`, or `LANDLORD`
- [ ] Return both `access` and `refresh` tokens
- [ ] Set access token TTL to 1 hour
- [ ] Set refresh token TTL to 7 days

**Test Command:**
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"chanda.mwamba","password":"password123"}'
```

### 1.2 Implement Token Refresh Endpoint
- [ ] Create `POST /api/auth/refresh/` endpoint
- [ ] Accept `refresh_token` in request body
- [ ] Validate refresh token and issue new access token
- [ ] Return new `access` token

### 1.3 Test Login Flow
- [ ] Login with STUDENT role → verify redirect to `/student`
- [ ] Login with CARETAKER role → verify redirect to `/caretaker`
- [ ] Login with LANDLORD role → verify redirect to `/landlord`
- [ ] Verify tokens stored in localStorage
- [ ] Test token auto-refresh on expiration

---

## Phase 2: Student Dashboard

### 2.1 Implement Dashboard Endpoint
- [ ] Create `GET /api/student/dashboard/` endpoint (requires Bearer token)
- [ ] Query user's profile from database
- [ ] Calculate `payment_streak` from payment history
- [ ] Calculate `days_remaining` from `next_due_date`
- [ ] Get current month's `billing_cycle_status` (which step is active)
- [ ] Query active maintenance requests (status IN ["PENDING", "IN_PROGRESS"])
- [ ] Return complete dashboard data structure
- [ ] Add mock data first (use MOCK_VERIFICATIONS from frontend code)

**Test Command:**
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/student/dashboard/
```

### 2.2 Implement Receipt Upload
- [ ] Create `POST /api/student/payments/upload/` endpoint
- [ ] Accept multipart/form-data with `file` field
- [ ] Store uploaded file in media storage
- [ ] Call OCR service (Google Vision, Tesseract, or in-house service)
- [ ] Extract `amount`, `transaction_reference`, and `date`
- [ ] Calculate OCR confidence score
- [ ] Return bounding boxes for canvas highlighting
- [ ] Create payment record in database with status `PENDING`

**OCR Service Selection:**
- Google Cloud Vision API (recommended for production)
- Tesseract (open-source, self-hosted)
- AWS Textract
- Manual extraction for testing

**Response must include:**
```json
{
  "bounding_boxes": {
    "amount": [x1, y1, x2, y2],
    "reference": [x1, y1, x2, y2]
  }
}
```

### 2.3 Implement Payment Submission
- [ ] Create `POST /api/student/payments/{payment_id}/submit/` endpoint
- [ ] Accept editable `amount`, `transaction_reference`, `date`
- [ ] Validate amounts are positive
- [ ] Update payment record status to `CARETAKER_REVIEW`
- [ ] Create audit log entry
- [ ] Return confirmation

### 2.4 Implement AI Chat Endpoint
- [ ] Create `POST /api/ai/chat/` endpoint
- [ ] Accept `message` and optional `context`
- [ ] Set up Groq API integration:
  - Set `GROQ_API_KEY` environment variable
  - Use model `llama-3-70b-versatile` or `llama-3-8b-8192`
  - Implement 2-second max response time
- [ ] Create system prompt with student context
- [ ] Return AI-generated response
- [ ] Store conversation in database for audit trail
- [ ] Implement rate limiting (10 requests/min per user)

**Groq Integration Example (Python/Django):**
```python
from groq import Groq
import os

def chat(message, student_context):
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    
    system_prompt = f"""
    You are BoardPay Assistant for student housing payments.
    Student: {student_context.get('name', 'User')}
    Room: {student_context.get('room', 'Unknown')}
    Balance: ZMW {student_context.get('balance', 0)}
    
    Provide helpful responses about rent, lease, maintenance.
    Keep responses under 150 words.
    """
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ],
        model="llama-3-70b-versatile",
        max_tokens=150,
        temperature=0.7
    )
    
    return response.choices[0].message.content
```

---

## Phase 3: Caretaker Dashboard

### 3.1 Implement Pending Verifications List
- [ ] Create `GET /api/caretaker/pending-verifications/` endpoint (role=CARETAKER only)
- [ ] Query payments with status `PENDING`
- [ ] Include OCR extracted data and bounding boxes
- [ ] Support pagination with `limit` and `offset`
- [ ] Return all fields from mock MOCK_VERIFICATIONS

### 3.2 Implement Payment Verification Action
- [ ] Create `PATCH /api/caretaker/payments/{payment_id}/verify/` endpoint
- [ ] Accept `action` (approve/reject) and optional `reason`
- [ ] If `approve`:
  - [ ] Update payment status to `APPROVED`
  - [ ] Transition to `SECURED_ON_LEDGER` step
  - [ ] Create ledger entry
- [ ] If `reject`:
  - [ ] Require non-empty `reason`
  - [ ] Update payment status to `REJECTED`
  - [ ] Notify student via email
  - [ ] Store rejection reason in database
- [ ] Create audit log entry with caretaker ID and timestamp
- [ ] Return confirmation with updated status

**Test Commands:**
```bash
# Approve
curl -X PATCH http://localhost:8000/api/caretaker/payments/451/verify/ \
  -H "Authorization: Bearer {caretaker_token}" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'

# Reject
curl -X PATCH http://localhost:8000/api/caretaker/payments/451/verify/ \
  -H "Authorization: Bearer {caretaker_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"reject",
    "reason":"Receipt amount doesn'\''t match student claim"
  }'
```

---

## Phase 4: Landlord Dashboard

### 4.1 Implement Financial Flow Endpoint
- [ ] Create `GET /api/landlord/financial-flow/` endpoint (role=LANDLORD only)
- [ ] Query payments by period (month)
- [ ] Group by property (e.g., "Ndola Complex", "Kitwe House")
- [ ] Calculate revenue (sum of approved payments)
- [ ] Calculate caretaker commissions (e.g., 10% of revenue)
- [ ] Calculate maintenance outlay (sum of maintenance expenses)
- [ ] Calculate net profit (revenue - commissions - maintenance)
- [ ] Return Sankey-compatible node/link structure
- [ ] Support `month` query parameter (default: current month)

**Sample Data Transformation:**
```python
# Database query result
payments = [
    {"property": "Ndola Complex", "amount": 15000, "approved": True},
    {"property": "Kitwe House", "amount": 12000, "approved": True},
]

# Transform to Sankey nodes/links
nodes = [
    {"id": "property_ndola", "name": "Ndola Complex", "value": 15000},
    {"id": "property_kitwe", "name": "Kitwe House", "value": 12000},
    {"id": "revenue", "name": "Gross Revenue", "value": 27000},
    {"id": "commission", "name": "Caretaker Commissions", "value": 2700},
    {"id": "maintenance", "name": "Maintenance Outlay", "value": 1300},
    {"id": "profit", "name": "Net Profit", "value": 23000}
]

links = [
    {"source": "property_ndola", "target": "revenue", "value": 15000},
    {"source": "property_kitwe", "target": "revenue", "value": 12000},
    {"source": "revenue", "target": "commission", "value": 2700},
    {"source": "revenue", "target": "maintenance", "value": 1300},
    {"source": "revenue", "target": "profit", "value": 23000}
]
```

### 4.2 Implement Delinquent Payments List
- [ ] Create `GET /api/landlord/delinquent-payments/` endpoint (role=LANDLORD only)
- [ ] Query payments with status not in ["APPROVED"]
- [ ] Calculate `days_overdue` as `today - due_date`
- [ ] Filter by `days_overdue_min` parameter (default: 1)
- [ ] Include student contact info (email, phone)
- [ ] Support pagination

### 4.3 Implement AI Notice Generation
- [ ] Create `POST /api/landlord/ai-draft-notice/` endpoint
- [ ] Accept payment_id, student_name, room, amount_owed, days_overdue
- [ ] Use Groq to generate professional delinquency notice
- [ ] Return editable draft text
- [ ] Store draft in temporary cache or database

**Draft Notice Prompt:**
```
Generate a professional, firm but friendly delinquency notice for a student.
Context:
- Student: {name}
- Room: {room}
- Amount owed: ZMW {amount}
- Days overdue: {days}
- Tone: friendly (or formal/urgent)

Include: greeting, reminder, amount, date, call to action.
Keep under 200 words.
```

### 4.4 Implement Notice Sending
- [ ] Create `POST /api/landlord/send-notice/` endpoint
- [ ] Accept notice_id, payment_id, notice_text, delivery_method
- [ ] Send via email using Django mail backend or SendGrid
- [ ] Optionally send SMS via Twilio
- [ ] Store sent notice in audit trail
- [ ] Return delivery status

### 4.5 Implement Lease Template
- [ ] Create `GET /api/landlord/lease-template/` endpoint
- [ ] Accept `student_id` query parameter
- [ ] Query student and lease data
- [ ] Generate HTML lease agreement with proper formatting
- [ ] Include signature lines and terms
- [ ] Make HTML print-friendly (no sidebars, proper margins)
- [ ] Optional: generate PDF (backend) or rely on browser print (recommended)

**HTML Template Structure:**
```html
<html>
  <head>
    <title>Lease Agreement</title>
    <style>
      @media print {
        body { margin: 1cm; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <h1>RESIDENTIAL LEASE AGREEMENT</h1>
    <table>
      <tr><td>TENANT:</td><td>{student_name}</td></tr>
      <tr><td>ROOM:</td><td>{room}</td></tr>
      <tr><td>RENT:</td><td>ZMW {rent_amount}</td></tr>
      <tr><td>PERIOD:</td><td>{lease_start} to {lease_end}</td></tr>
    </table>
    <!-- Terms section -->
    <!-- Signature lines -->
  </body>
</html>
```

---

## Phase 5: Testing & Validation

### 5.1 Endpoint Testing
- [ ] Test all endpoints with valid JWT token
- [ ] Test all endpoints without token (should return 401)
- [ ] Test endpoints with wrong role (should return 403)
- [ ] Test with invalid payment_id (should return 404)
- [ ] Test with invalid input (should return 400 with error details)

### 5.2 Data Validation
- [ ] Payment amount must be positive
- [ ] Transaction reference must not be empty
- [ ] Room must exist in database
- [ ] Student must have active lease
- [ ] Caretaker must be assigned to student's property

### 5.3 Workflow Testing
- [ ] Complete student payment flow: upload → submit → caretaker review → approve
- [ ] Complete caretaker workflow: list → view → approve/reject
- [ ] Complete landlord workflow: view dashboard → draft notice → send → view financial flow
- [ ] Complete AI chat workflow: send message → get response within 2s

### 5.4 Performance Testing
- [ ] Dashboard loads in < 500ms
- [ ] AI chat responds in < 2s
- [ ] Receipt OCR completes in < 3s
- [ ] Large financial flows render smoothly (100+ nodes)

---

## Phase 6: Frontend Configuration

### 6.1 Update Frontend API Base URL
Edit `/frontend/src/api/axios.js`:
```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 6.2 Environment Variables
Create `.env.development.local`:
```
VITE_API_URL=http://127.0.0.1:8000
VITE_GROQ_API_KEY=(not needed on frontend, backend handles Groq)
```

### 6.3 CORS Configuration
Backend must allow frontend origin:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://yourdomain.com"
]
```

---

## Phase 7: Deployment

### 7.1 Production Checklist
- [ ] Update API base URL to production domain
- [ ] Generate new JWT_SECRET (strong random string)
- [ ] Enable HTTPS for all endpoints
- [ ] Set appropriate CORS_ALLOWED_ORIGINS
- [ ] Configure Groq API key as secure environment variable
- [ ] Implement rate limiting middleware
- [ ] Add request/response logging
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure database backups
- [ ] Enable CSRF protection

### 7.2 Security Checklist
- [ ] All passwords hashed with bcrypt/argon2
- [ ] JWTs signed with strong secret
- [ ] Sensitive data not logged
- [ ] SQL injection prevention (use ORM or parameterized queries)
- [ ] CORS configured properly (not `*`)
- [ ] Rate limiting on auth endpoints (3 attempts/minute)
- [ ] Audit logging for critical actions
- [ ] Data validation on all inputs

---

## Priority Order

Implement in this order for fastest integration:

1. **Authentication** (Phase 1) - MUST be done first
2. **Student Dashboard** (Phase 2.1-2.3) - Core feature
3. **Payment Upload & OCR** (Phase 2.2) - User-facing
4. **Caretaker Verification** (Phase 3) - Revenue-critical
5. **AI Chat** (Phase 2.4) - Nice-to-have, but adds great UX
6. **Landlord Dashboard** (Phase 4) - Management feature
7. **Testing & Deployment** (Phases 5-7)

---

## Quick Start Commands

### Run Tests
```bash
# Frontend tests
npm run test

# Backend tests (Django)
python manage.py test
```

### Start Services
```bash
# Backend
python manage.py runserver 0.0.0.0:8000

# Frontend
npm run dev    # Runs on http://localhost:5173
```

### Debug Tools
```bash
# Test endpoint with curl
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/student/dashboard/

# Check frontend network requests (open browser DevTools)
# Network tab → filter by "Fetch/XHR" → watch requests/responses
```

---

## Support Resources

- **Frontend Code:** `/frontend/src/pages/` and `/frontend/src/components/`
- **Mock Data:** Search for `MOCK_` in component files
- **API Specs:** `BACKEND_INTEGRATION_GUIDE.md`
- **Data Schemas:** `DATA_SCHEMAS.md`

Good luck with the integration! 🚀
