# BoardPay Frontend-Backend Integration Guide

## Overview

This document specifies all API endpoints required to replace the mock data in the BoardPay frontend with real backend services. The frontend is built with React + Vite and uses JWT-based authentication.

**API Base URL:** `http://127.0.0.1:8000` (configurable in frontend)

**Authentication:** JWT Bearer token stored in `localStorage['access_token']`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Student Dashboard](#student-dashboard)
3. [Caretaker Dashboard](#caretaker-dashboard)
4. [Landlord Dashboard](#landlord-dashboard)
5. [AI Chat Service](#ai-chat-service)
6. [Common Response Formats](#common-response-formats)
7. [Error Handling](#error-handling)

---

## Authentication

### Login Endpoint

**Endpoint:** `POST /api/auth/token/`

**Description:** Authenticate user and return JWT tokens with role information embedded in the JWT payload.

**Request Body:**
```json
{
  "username": "string (email or username)",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiU1RVREVOVS...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NjM4NzA..."
}
```

**JWT Payload Structure (access token):**
```json
{
  "user_id": 123,
  "username": "chanda.mwamba",
  "role": "STUDENT",
  "email": "chanda@example.com",
  "exp": 1234567890,
  "iat": 1234567800
}
```

**Possible Roles:** `STUDENT`, `CARETAKER`, `LANDLORD`

**Error Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

**Frontend Implementation:**
- Decodes JWT to extract `role` field: `const role = JSON.parse(atob(token.split('.')[1])).role`
- Routes user to `/student`, `/caretaker`, or `/landlord` based on role
- Stores both `access_token` and `refresh_token` in localStorage

---

## Student Dashboard

### 1. Get Student Dashboard Data

**Endpoint:** `GET /api/student/dashboard/`

**Authentication:** Required (Bearer token)

**Description:** Fetch complete student dashboard including profile, payment streak, current month billing status, and active maintenance requests.

**Response (200 OK):**
```json
{
  "student_name": "Chanda Mwamba",
  "student_id": 451,
  "room_display": "Room 4B, Ndola Campus Housing",
  "payment_streak": 4,
  "next_due_date": "2026-07-25",
  "days_remaining": 14,
  "current_month_status": {
    "current_step": "CARETAKER_REVIEW",
    "steps_completed": ["RECEIPT_UPLOADED"],
    "steps_pending": ["CARETAKER_REVIEW", "SECURED_ON_LEDGER"],
    "extracted_amount": 2500.00,
    "payment_id": 451
  },
  "active_maintenance": [
    {
      "id": 102,
      "title": "Leaking Tap in Bathroom",
      "status": "IN_PROGRESS",
      "created_at": "2026-07-07T14:23:00Z",
      "created_at_relative": "2 days ago"
    },
    {
      "id": 103,
      "title": "Broken Light Fixture - Common Area",
      "status": "PENDING",
      "created_at": "2026-07-08T09:15:00Z",
      "created_at_relative": "1 day ago"
    }
  ]
}
```

**Field Definitions:**
- `payment_streak`: Integer count of consecutive months with on-time payment
- `current_step`: One of `RECEIPT_UPLOADED`, `CARETAKER_REVIEW`, `SECURED_ON_LEDGER`
- `steps_completed`: Array of completed step IDs
- `steps_pending`: Array of pending step IDs
- `created_at_relative`: Human-readable duration (e.g., "2 days ago")

**Error Response (401/403):**
```json
{
  "detail": "Not authenticated" / "Permission denied"
}
```

---

### 2. Upload Payment Receipt

**Endpoint:** `POST /api/student/payments/upload/`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data`

**Description:** Upload receipt image and trigger OCR extraction. Returns extracted data and allows edits before submission.

**Request:**
```
Form Data:
- file: File (JPEG/PNG, max 5MB)
- amount: number (optional, pre-filled if user enters it)
- transaction_reference: string (optional)
```

**Response (200 OK):**
```json
{
  "payment_id": 451,
  "status": "PENDING",
  "receipt_image_url": "/media/receipts/2026/07/receipt_451.jpg",
  "extracted_data": {
    "amount": 2500.00,
    "transaction_reference": "TXN987654321",
    "date": "2026-07-09"
  },
  "ocr_match_flag": true,
  "ocr_confidence": 0.95,
  "bounding_boxes": {
    "amount": [710, 450, 750, 600],
    "reference": [220, 150, 260, 400]
  }
}
```

**Field Definitions:**
- `payment_id`: Unique payment record ID
- `ocr_match_flag`: Boolean - whether extracted data matches user-typed values
- `ocr_confidence`: Float 0.0-1.0 - OCR extraction confidence score
- `bounding_boxes`: Pixel coordinates of extracted fields (for canvas highlighting)

**Error Response (400):**
```json
{
  "detail": "Invalid file format or file too large"
}
```

---

### 3. Submit Payment (Finalize)

**Endpoint:** `POST /api/student/payments/{payment_id}/submit/`

**Authentication:** Required (Bearer token)

**Description:** Finalize payment submission after optional edits. Transitions to CARETAKER_REVIEW.

**Request Body:**
```json
{
  "amount": 2500.00,
  "transaction_reference": "TXN987654321",
  "date": "2026-07-09"
}
```

**Response (200 OK):**
```json
{
  "payment_id": 451,
  "status": "CARETAKER_REVIEW",
  "message": "Payment submitted successfully. Awaiting caretaker verification."
}
```

---

### 4. AI Chat Endpoint

**Endpoint:** `POST /api/ai/chat/`

**Authentication:** Required (Bearer token)

**Description:** Send message to AI assistant powered by Groq API (Llama 3). Returns contextual responses about rent, lease, and maintenance.

**Request Body:**
```json
{
  "message": "What about my june rent?",
  "context": {
    "student_id": 451,
    "room": "Room 4B",
    "current_balance": 2500.00
  }
}
```

**Response (200 OK):**
```json
{
  "reply": "Your June rent of ZMW 2,500 is currently in Caretaker Review. Once verified, it will be secured on the ledger within 24-48 hours.",
  "message_id": "msg_12345",
  "timestamp": "2026-07-09T15:30:00Z"
}
```

**Implementation Notes:**
- Backend should integrate with Groq API (`https://api.groq.com/`) using Llama 3 model
- Pass student context for personalized responses
- Implement 2-second max response time SLA (frontend shows typing indicator)
- Store conversation history in database for audit trail

**Error Response (429):**
```json
{
  "detail": "Rate limit exceeded. Please wait before sending another message."
}
```

---

## Caretaker Dashboard

### 1. Get Pending Verifications

**Endpoint:** `GET /api/caretaker/pending-verifications/`

**Authentication:** Required (Bearer token with role=CARETAKER)

**Description:** Fetch list of payments pending caretaker review with extracted OCR data.

**Query Parameters:**
- `status`: Optional filter (PENDING, APPROVED, REJECTED)
- `limit`: Optional pagination limit (default: 20)
- `offset`: Optional pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "count": 15,
  "results": [
    {
      "payment_id": 451,
      "student_name": "Chanda Mwamba",
      "room": "Room 4B",
      "typed_amount": 2500.00,
      "typed_reference": "TXN987654321",
      "receipt_image_url": "/media/receipts/2026/07/receipt_451.jpg",
      "submitted_at": "2026-07-09T10:15:00Z",
      "ocr_data": {
        "extracted_amount": 2500.00,
        "extracted_reference": "TXN987654321",
        "match": true,
        "confidence": 0.98,
        "bounding_boxes": {
          "amount": [710, 450, 750, 600],
          "reference": [220, 150, 260, 400]
        }
      }
    }
  ]
}
```

---

### 2. Approve/Reject Payment

**Endpoint:** `PATCH /api/caretaker/payments/{payment_id}/verify/`

**Authentication:** Required (Bearer token with role=CARETAKER)

**Description:** Approve or reject a pending payment verification with optional rejection reason.

**Request Body:**
```json
{
  "action": "approve",
  "reason": null
}
```

OR (for rejection):
```json
{
  "action": "reject",
  "reason": "Receipt amount doesn't match student claim. Requested 2500, receipt shows 2000."
}
```

**Response (200 OK):**
```json
{
  "payment_id": 451,
  "status": "APPROVED",
  "verified_by": "caretaker_user_123",
  "verified_at": "2026-07-09T11:45:00Z",
  "message": "Payment approved and secured on ledger"
}
```

---

## Landlord Dashboard

### 1. Get Financial Flow Data

**Endpoint:** `GET /api/landlord/financial-flow/`

**Authentication:** Required (Bearer token with role=LANDLORD)

**Query Parameters:**
- `month`: Optional (format: YYYY-MM, default: current month)

**Description:** Get financial flow data for Sankey diagram showing revenue distribution across properties, commissions, maintenance, and net profit.

**Response (200 OK):**
```json
{
  "period": "2026-07",
  "nodes": [
    { "id": "property_ndola", "name": "Ndola Complex", "value": 15000 },
    { "id": "property_kitwe", "name": "Kitwe House", "value": 12000 },
    { "id": "revenue", "name": "Gross Revenue", "value": 27000 },
    { "id": "commission", "name": "Caretaker Commissions", "value": 2700 },
    { "id": "maintenance", "name": "Maintenance Outlay", "value": 1300 },
    { "id": "profit", "name": "Net Profit", "value": 23000 }
  ],
  "links": [
    { "source": "property_ndola", "target": "revenue", "value": 15000 },
    { "source": "property_kitwe", "target": "revenue", "value": 12000 },
    { "source": "revenue", "target": "commission", "value": 2700 },
    { "source": "revenue", "target": "maintenance", "value": 1300 },
    { "source": "revenue", "target": "profit", "value": 23000 }
  ]
}
```

**Canvas Rendering Notes:**
- Frontend receives bounding_boxes in normalized pixel coordinates
- Original image dimensions: 600x600 pixels
- Canvas display size: 400x600 (will scale automatically)
- Frontend scales coordinates: `(x / 600) * 400` for width, `(y / 600) * 600` for height

---

### 2. Get Delinquent Payments

**Endpoint:** `GET /api/landlord/delinquent-payments/`

**Authentication:** Required (Bearer token with role=LANDLORD)

**Query Parameters:**
- `days_overdue_min`: Minimum days overdue (default: 1)
- `limit`: Pagination limit (default: 50)

**Description:** Fetch list of delinquent student payments for AI Comms Copilot.

**Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "payment_id": 451,
      "student_name": "Chanda Mwamba",
      "student_id": 451,
      "room": "Room 4B",
      "amount_owed": 2500.00,
      "days_overdue": 18,
      "email": "chanda@example.com",
      "phone": "+260978123456"
    },
    {
      "payment_id": 452,
      "student_name": "Mwila Phiri",
      "student_id": 452,
      "room": "Room 2A",
      "amount_owed": 1800.00,
      "days_overdue": 12,
      "email": "mwila@example.com",
      "phone": "+260979654321"
    }
  ]
}
```

---

### 3. Generate AI Delinquent Notice

**Endpoint:** `POST /api/landlord/ai-draft-notice/`

**Authentication:** Required (Bearer token with role=LANDLORD)

**Description:** Generate AI-powered draft notice for delinquent payment using natural language processing. Landlord can edit and send.

**Request Body:**
```json
{
  "payment_id": 451,
  "student_name": "Chanda Mwamba",
  "room": "Room 4B",
  "amount_owed": 2500.00,
  "days_overdue": 18
}
```

**Response (200 OK):**
```json
{
  "draft_notice": "Dear Chanda Mwamba,\n\nThis is a friendly reminder that your rent for Room 4B is currently outstanding. As of today, your payment is 18 days overdue.\n\nAmount owed: ZMW 2,500.00\n\nPlease arrange payment at your earliest convenience to avoid further action.\n\nBest regards,\nBoardPay Management",
  "notice_id": "notice_451_draft"
}
```

---

### 4. Send Delinquent Notice

**Endpoint:** `POST /api/landlord/send-notice/`

**Authentication:** Required (Bearer token with role=LANDLORD)

**Description:** Send finalized notice to student via email/SMS. Stores in audit trail.

**Request Body:**
```json
{
  "notice_id": "notice_451_draft",
  "payment_id": 451,
  "notice_text": "Dear Chanda Mwamba,\n\nThis is a friendly reminder...",
  "delivery_method": "email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message_id": "msg_notice_451",
  "sent_at": "2026-07-09T15:30:00Z",
  "recipient": "chanda@example.com",
  "delivery_status": "sent"
}
```

---

### 5. Get Lease Template

**Endpoint:** `GET /api/landlord/lease-template/`

**Authentication:** Required (Bearer token with role=LANDLORD)

**Description:** Get formatted HTML lease agreement for printing/PDF export.

**Query Parameters:**
- `student_id`: Student ID for personalization
- `format`: Optional (html, pdf) - default: html

**Response (200 OK):**
```json
{
  "html": "<html>...</html>",
  "student_name": "Chanda Mwamba",
  "room": "Room 4B",
  "rent_amount": 2500.00,
  "lease_start": "2024-01-15",
  "lease_end": "2024-12-31",
  "printable": true
}
```

**Implementation Notes:**
- Frontend uses `@media print` CSS to render HTML cleanly
- `window.print()` triggers native browser print/PDF export
- No separate PDF endpoint needed - browser handles PDF generation

---

## AI Chat Service

### LLM Integration Requirements

The frontend expects the backend to integrate with **Groq API** for real-time AI responses.

**Groq API Details:**
- **Base URL:** `https://api.groq.com/openai/v1/`
- **Model:** `llama-3-70b-versatile` or `llama-3-8b-8192`
- **Auth:** Bearer token via `GROQ_API_KEY` env variable

**Backend Implementation Example (pseudo-code):**
```python
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def chat_with_groq(user_message: str, student_context: dict) -> str:
    system_prompt = f"""
    You are BoardPay Assistant, helping students with rent, lease, and maintenance inquiries.
    Current student context:
    - Name: {student_context['name']}
    - Room: {student_context['room']}
    - Current balance: ZMW {student_context['balance']}
    
    Provide helpful, concise responses about rent payments, lease terms, and maintenance requests.
    """
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        model="llama-3-70b-versatile",
        max_tokens=150,
        temperature=0.7
    )
    
    return response.choices[0].message.content
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payment amount",
    "details": {
      "field": "amount",
      "constraint": "must_be_positive"
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Response |
|--------|---------|----------|
| 200 | Success | Data payload |
| 201 | Created | New resource data |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | User lacks permission for this resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource state conflict (e.g., duplicate) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Backend error |

### Token Refresh Flow

When access token expires (JWT `exp` claim):
1. Frontend detects 401 response
2. Uses `refresh_token` to request new access token: `POST /api/auth/refresh/`
3. Retries original request with new token
4. Falls back to login page if refresh also fails

---

## Testing Checklist for Backend Team

- [ ] Login endpoint returns JWT with `role` claim
- [ ] All endpoints verify JWT token validity and role permissions
- [ ] Student dashboard shows correct payment streak and billing timeline
- [ ] Receipt upload triggers OCR and returns bounding boxes
- [ ] Caretaker approval/rejection updates payment status
- [ ] Financial flow data calculates correctly from payment records
- [ ] Delinquent notices generate via Groq API
- [ ] AI chat responds with context-aware answers within 2 seconds
- [ ] All error responses include `detail` or `error` field
- [ ] Rate limiting prevents spam (e.g., chat requests > 10/min)
- [ ] Pagination works correctly on list endpoints

---

## Environment Configuration

**Frontend will use:**
```javascript
const API_BASE = process.env.VITE_API_URL || 'http://127.0.0.1:8000';
```

**Backend should expose:**
- `CORS_ALLOWED_ORIGINS`: Include frontend domain (http://localhost:5173 for dev)
- `GROQ_API_KEY`: Environment variable for Groq integration
- `JWT_SECRET`: Signing key for JWT tokens
- `JWT_EXPIRATION`: Access token TTL (recommended: 1 hour)

---

## Contact & Support

For integration questions, refer to the frontend component code comments:
- `/frontend/src/components/GroqChatWidget.jsx` - AI chat details
- `/frontend/src/pages/CaretakerDashboard.jsx` - OCR canvas rendering
- `/frontend/src/pages/LandlordDashboard.jsx` - Sankey data structure
