# BoardPay API Examples

Complete request/response examples for all endpoints with real data.

---

## Authentication

### Example 1: Student Login

**Request:**
```bash
POST /api/auth/token/
Content-Type: application/json

{
  "username": "chanda.mwamba",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0NTEsInVzZXJuYW1lIjoiY2hhbmRhLm13YW1iYSIsInJvbGUiOiJTVFVERU5UIiwiZW1haWwiOiJjaGFuZGFAZXhhbXBsZS5jb20iLCJleHAiOjE3NDEwMDAwMDB9.xyz123abc",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0NTEsImV4cCI6MTc0MjAwMDAwMH0.abc123xyz"
}
```

**JWT Decoded (access token):**
```json
{
  "user_id": 451,
  "username": "chanda.mwamba",
  "role": "STUDENT",
  "email": "chanda@example.com",
  "exp": 1741000000,
  "iat": 1740996400
}
```

---

### Example 2: Caretaker Login

**Request:**
```bash
POST /api/auth/token/
Content-Type: application/json

{
  "username": "caretaker.ndola",
  "password": "CaretakerPass456!"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2NzIsInVzZXJuYW1lIjoiY2FyZXRha2VyLm5kb2xhIiwicm9sZSI6IkNBUkVUQUtFUiIsImVtYWlsIjoiY2FyZXRha2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNzQxMDAwMDAwfQ.xyz456def",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2NzIsImV4cCI6MTc0MjAwMDAwMH0.def456xyz"
}
```

---

## Student Dashboard

### Example 3: Get Student Dashboard

**Request:**
```bash
GET /api/student/dashboard/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "student_id": 451,
  "student_name": "Chanda Mwamba",
  "room_display": "Room 4B, Ndola Complex Building A",
  "email": "chanda@example.com",
  "phone": "+260978123456",
  "payment_streak": 4,
  "next_due_date": "2026-07-25",
  "days_remaining": 16,
  "current_month_status": {
    "current_step": "CARETAKER_REVIEW",
    "steps_completed": ["RECEIPT_UPLOADED"],
    "steps_pending": ["CARETAKER_REVIEW", "SECURED_ON_LEDGER"],
    "extracted_amount": 2500.00,
    "payment_id": 451,
    "submitted_at": "2026-07-09T10:15:00Z"
  },
  "active_maintenance": [
    {
      "id": 102,
      "title": "Leaking Tap in Bathroom",
      "status": "IN_PROGRESS",
      "description": "Water dripping from tap, needs washer replacement",
      "created_at": "2026-07-07T14:23:00Z",
      "created_at_relative": "2 days ago",
      "updated_at": "2026-07-08T09:15:00Z",
      "assigned_to": "John Banda (Caretaker)"
    },
    {
      "id": 103,
      "title": "Broken Light Fixture - Common Area",
      "status": "PENDING",
      "description": "Ceiling light in hallway not working",
      "created_at": "2026-07-08T09:15:00Z",
      "created_at_relative": "1 day ago",
      "assigned_to": null
    }
  ]
}
```

---

### Example 4: Upload Receipt

**Request:**
```bash
POST /api/student/payments/upload/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: multipart/form-data

Form Data:
- file: [receipt_image.jpg - 2.5MB]
- amount: 2500
- transaction_reference: TXN987654321
```

**Response (200 OK):**
```json
{
  "payment_id": 451,
  "status": "PENDING",
  "receipt_image_url": "https://api.example.com/media/receipts/2026/07/receipt_451_abcd1234.jpg",
  "extracted_data": {
    "amount": 2500.00,
    "transaction_reference": "TXN987654321",
    "date": "2026-07-09"
  },
  "ocr_match_flag": true,
  "ocr_confidence": 0.98,
  "bounding_boxes": {
    "amount": [710, 450, 750, 600],
    "reference": [220, 150, 260, 400]
  }
}
```

---

### Example 5: Submit Payment

**Request:**
```bash
POST /api/student/payments/451/submit/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

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
  "message": "Payment submitted successfully. Your payment is now awaiting caretaker verification. This usually takes 2-4 hours."
}
```

---

### Example 6: AI Chat - Rent Question

**Request:**
```bash
POST /api/ai/chat/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "message": "What about my june rent?",
  "context": {
    "student_id": 451,
    "student_name": "Chanda Mwamba",
    "room": "Room 4B",
    "current_balance": 2500.00,
    "lease_end_date": "2026-12-31"
  }
}
```

**Response (200 OK):**
```json
{
  "reply": "Your June rent of ZMW 2,500 is currently in Caretaker Review. Once verified, it will be secured on the ledger within 24-48 hours. Your next payment is due on July 25th.",
  "message_id": "msg_451_20260709_1530",
  "timestamp": "2026-07-09T15:30:00Z",
  "context_used": ["student_name", "current_balance", "current_step"]
}
```

---

### Example 7: AI Chat - Maintenance Question

**Request:**
```bash
POST /api/ai/chat/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "message": "The light in my room is broken, can someone fix it?",
  "context": {
    "student_id": 451,
    "student_name": "Chanda Mwamba",
    "room": "Room 4B"
  }
}
```

**Response (200 OK):**
```json
{
  "reply": "To request maintenance, please use the Maintenance Request feature in your dashboard. You can describe the issue in detail, and the caretaker will be notified immediately. For urgent issues that need same-day attention, you can also contact the caretaker directly at +260978654321.",
  "message_id": "msg_451_20260709_1531",
  "timestamp": "2026-07-09T15:31:00Z"
}
```

---

## Caretaker Dashboard

### Example 8: Get Pending Verifications

**Request:**
```bash
GET /api/caretaker/pending-verifications/?status=PENDING&limit=20&offset=0
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "count": 3,
  "next": "http://localhost:8000/api/caretaker/pending-verifications/?limit=20&offset=20",
  "previous": null,
  "results": [
    {
      "payment_id": 451,
      "student_name": "Chanda Mwamba",
      "student_id": 451,
      "room": "Room 4B",
      "typed_amount": 2500.00,
      "typed_reference": "TXN987654321",
      "receipt_image_url": "https://api.example.com/media/receipts/2026/07/receipt_451_abcd1234.jpg",
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
    },
    {
      "payment_id": 452,
      "student_name": "Mwila Phiri",
      "student_id": 452,
      "room": "Room 2A",
      "typed_amount": 1800.00,
      "typed_reference": "TXN987654322",
      "receipt_image_url": "https://api.example.com/media/receipts/2026/07/receipt_452_wxyz5678.jpg",
      "submitted_at": "2026-07-09T11:30:00Z",
      "ocr_data": {
        "extracted_amount": 1800.00,
        "extracted_reference": "TXN987654322",
        "match": true,
        "confidence": 0.95,
        "bounding_boxes": {
          "amount": [680, 420, 720, 580],
          "reference": [200, 140, 250, 380]
        }
      }
    }
  ]
}
```

---

### Example 9: Approve Payment

**Request:**
```bash
PATCH /api/caretaker/payments/451/verify/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "action": "approve"
}
```

**Response (200 OK):**
```json
{
  "payment_id": 451,
  "status": "APPROVED",
  "verified_by": "caretaker_user_672",
  "verified_at": "2026-07-09T11:45:00Z",
  "message": "Payment approved and secured on ledger. Student will be notified."
}
```

---

### Example 10: Reject Payment

**Request:**
```bash
PATCH /api/caretaker/payments/451/verify/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "action": "reject",
  "reason": "Receipt amount (ZMW 2000) does not match student claim (ZMW 2500). Student was asked to provide corrected receipt."
}
```

**Response (200 OK):**
```json
{
  "payment_id": 451,
  "status": "REJECTED",
  "verified_by": "caretaker_user_672",
  "verified_at": "2026-07-09T11:47:00Z",
  "message": "Payment rejected. Student notified via email with rejection reason."
}
```

---

## Landlord Dashboard

### Example 11: Get Financial Flow

**Request:**
```bash
GET /api/landlord/financial-flow/?month=2026-07
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "period": "2026-07",
  "nodes": [
    {
      "id": "property_ndola",
      "name": "Ndola Complex",
      "value": 15000
    },
    {
      "id": "property_kitwe",
      "name": "Kitwe House",
      "value": 12000
    },
    {
      "id": "revenue",
      "name": "Gross Revenue",
      "value": 27000
    },
    {
      "id": "commission",
      "name": "Caretaker Commissions",
      "value": 2700
    },
    {
      "id": "maintenance",
      "name": "Maintenance Outlay",
      "value": 1300
    },
    {
      "id": "profit",
      "name": "Net Profit",
      "value": 23000
    }
  ],
  "links": [
    {
      "source": "property_ndola",
      "target": "revenue",
      "value": 15000
    },
    {
      "source": "property_kitwe",
      "target": "revenue",
      "value": 12000
    },
    {
      "source": "revenue",
      "target": "commission",
      "value": 2700
    },
    {
      "source": "revenue",
      "target": "maintenance",
      "value": 1300
    },
    {
      "source": "revenue",
      "target": "profit",
      "value": 23000
    }
  ]
}
```

---

### Example 12: Get Delinquent Payments

**Request:**
```bash
GET /api/landlord/delinquent-payments/?days_overdue_min=7&limit=50
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

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
      "phone": "+260978123456",
      "lease_end_date": "2026-12-31"
    },
    {
      "payment_id": 452,
      "student_name": "Mwila Phiri",
      "student_id": 452,
      "room": "Room 2A",
      "amount_owed": 1800.00,
      "days_overdue": 12,
      "email": "mwila@example.com",
      "phone": "+260979654321",
      "lease_end_date": "2026-11-30"
    },
    {
      "payment_id": 453,
      "student_name": "Nkandu Simwaka",
      "student_id": 453,
      "room": "Room 5C",
      "amount_owed": 3200.00,
      "days_overdue": 25,
      "email": "nkandu@example.com",
      "phone": "+260977654321",
      "lease_end_date": "2026-10-15"
    }
  ]
}
```

---

### Example 13: Draft Delinquent Notice

**Request:**
```bash
POST /api/landlord/ai-draft-notice/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "payment_id": 451,
  "student_name": "Chanda Mwamba",
  "room": "Room 4B",
  "amount_owed": 2500.00,
  "days_overdue": 18,
  "tone": "friendly"
}
```

**Response (200 OK):**
```json
{
  "draft_notice": "Dear Chanda Mwamba,\n\nWe hope you're doing well! We're writing to remind you that your rent payment for Room 4B is currently outstanding.\n\nAs of today, your payment is 18 days overdue. We understand that sometimes circumstances arise, but we kindly request that you settle your outstanding balance of ZMW 2,500.00 at your earliest convenience.\n\nPayment can be made through:\n- Mobile money: +260 XXX XXX XXX\n- Bank transfer: Details available at the reception\n- In-person at the office\n\nPlease arrange payment within the next 7 days to avoid further action. If you're experiencing financial difficulties, we encourage you to reach out to discuss payment arrangements.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nBoardPay Management Team",
  "notice_id": "notice_451_draft_20260709",
  "tone_used": "friendly",
  "generated_at": "2026-07-09T15:30:00Z",
  "editable": true
}
```

---

### Example 14: Send Notice

**Request:**
```bash
POST /api/landlord/send-notice/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "notice_id": "notice_451_draft_20260709",
  "payment_id": 451,
  "notice_text": "Dear Chanda Mwamba,\n\n[edited notice text...]",
  "delivery_method": "email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message_id": "msg_notice_451_20260709",
  "sent_at": "2026-07-09T15:32:00Z",
  "recipient": "chanda@example.com",
  "delivery_status": "sent"
}
```

---

### Example 15: Get Lease Template

**Request:**
```bash
GET /api/landlord/lease-template/?student_id=451&format=html
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "html": "<!DOCTYPE html><html><head><style>@media print{body{margin:1cm}}</style></head><body><h1>RESIDENTIAL LEASE AGREEMENT</h1><table><tr><td>TENANT:</td><td>Chanda Mwamba</td></tr><tr><td>ROOM:</td><td>Room 4B</td></tr><tr><td>MONTHLY RENT:</td><td>ZMW 2,500.00</td></tr><tr><td>LEASE PERIOD:</td><td>January 15, 2024 to December 31, 2024</td></tr></table>...[full HTML lease document]...</body></html>",
  "student_name": "Chanda Mwamba",
  "room": "Room 4B",
  "rent_amount": 2500.00,
  "lease_start": "2024-01-15",
  "lease_end": "2024-12-31",
  "printable": true,
  "generated_at": "2026-07-09T15:33:00Z"
}
```

---

## Error Examples

### Example 16: Invalid Credentials

**Request:**
```bash
POST /api/auth/token/
Content-Type: application/json

{
  "username": "chanda.mwamba",
  "password": "WrongPassword"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

---

### Example 17: Missing Authorization Header

**Request:**
```bash
GET /api/student/dashboard/
# No Authorization header
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided"
}
```

---

### Example 18: Insufficient Permissions

**Request:**
```bash
GET /api/landlord/financial-flow/
Authorization: Bearer [student_token_with_role_STUDENT]
```

**Response (403 Forbidden):**
```json
{
  "detail": "Permission denied. Only LANDLORD users can access this resource"
}
```

---

### Example 19: Validation Error

**Request:**
```bash
POST /api/student/payments/451/submit/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "amount": -500.00,
  "transaction_reference": "",
  "date": "invalid-date"
}
```

**Response (400 Bad Request):**
```json
{
  "errors": [
    {
      "field": "amount",
      "constraint": "must_be_positive",
      "message": "Amount must be greater than 0"
    },
    {
      "field": "transaction_reference",
      "constraint": "required",
      "message": "Transaction reference is required"
    },
    {
      "field": "date",
      "constraint": "invalid_format",
      "message": "Date must be in YYYY-MM-DD format"
    }
  ]
}
```

---

### Example 20: Not Found

**Request:**
```bash
GET /api/caretaker/pending-verifications/999/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (404 Not Found):**
```json
{
  "detail": "Payment not found"
}
```

---

## Rate Limiting Example

### Example 21: Rate Limit Exceeded

**Request (11th chat message within 60 seconds):**
```bash
POST /api/ai/chat/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "message": "Another question..."
}
```

**Response (429 Too Many Requests):**
```json
{
  "detail": "Rate limit exceeded. You can send 10 messages per minute. Please wait 45 seconds."
}
```

**Response Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-07-09T15:32:45Z
```

---

## Testing with cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"chanda.mwamba","password":"password123"}' \
  | jq -r '.access')

# 2. Get dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/student/dashboard/

# 3. Upload receipt
curl -X POST http://localhost:8000/api/student/payments/upload/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@receipt.jpg" \
  -F "amount=2500"

# 4. Send chat message
curl -X POST http://localhost:8000/api/ai/chat/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What about my rent?",
    "context": {"room": "Room 4B"}
  }' | jq '.reply'
```

---

## WebSocket (Optional Enhancement)

For real-time payment status updates, consider implementing WebSocket:

```javascript
// Frontend
const ws = new WebSocket('ws://localhost:8000/ws/student/451/');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'payment_status_changed') {
    console.log('Payment updated:', data.status);
    // Update UI
  }
};
```

```python
# Backend (Django Channels)
@database_sync_to_async
def connect(self):
    self.room_id = self.scope['url_route']['kwargs']['student_id']
    await self.channel_layer.group_add(f'student_{self.room_id}', self.channel_name)

async def payment_update(self, event):
    await self.send(text_data=json.dumps({
        'type': 'payment_status_changed',
        'status': event['status']
    }))
```

---

End of examples. All endpoints are ready for implementation!
