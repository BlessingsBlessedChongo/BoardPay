# BoardPay Data Schemas Reference

This document defines all TypeScript/JSON schemas used in the BoardPay frontend for type validation and backend integration.

---

## Authentication

### User Login Request
```typescript
interface LoginRequest {
  username: string;    // Email or username
  password: string;    // Plain text (HTTPS only)
}
```

### Token Response
```typescript
interface TokenResponse {
  access: string;      // JWT access token (Bearer)
  refresh: string;     // JWT refresh token (for renewal)
}
```

### JWT Payload (Decoded)
```typescript
interface JWTPayload {
  user_id: number;
  username: string;
  role: "STUDENT" | "CARETAKER" | "LANDLORD";
  email: string;
  exp: number;         // Expiration timestamp (seconds)
  iat: number;         // Issued-at timestamp
}
```

---

## Student Dashboard

### Student Profile
```typescript
interface StudentProfile {
  student_id: number;
  student_name: string;
  room_display: string;           // e.g., "Room 4B, Ndola Campus Housing"
  email: string;
  phone?: string;
  payment_streak: number;         // Consecutive on-time payments
  next_due_date: string;          // ISO 8601 date (YYYY-MM-DD)
  days_remaining: number;         // Days until due date
}
```

### Payment Billing Status
```typescript
interface BillingCycleStatus {
  current_step: "RECEIPT_UPLOADED" | "CARETAKER_REVIEW" | "SECURED_ON_LEDGER";
  steps_completed: string[];      // IDs of completed steps
  steps_pending: string[];        // IDs of pending steps
  extracted_amount: number;       // Amount from OCR (ZMW)
  payment_id: number;
  submitted_at?: string;          // ISO 8601 timestamp
}
```

### Maintenance Request
```typescript
interface MaintenanceRequest {
  id: number;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  description?: string;
  created_at: string;             // ISO 8601 timestamp
  created_at_relative: string;    // e.g., "2 days ago"
  updated_at?: string;
  assigned_to?: string;           // Caretaker name
}
```

### Full Dashboard Response
```typescript
interface StudentDashboardData {
  student_name: string;
  student_id: number;
  room_display: string;
  payment_streak: number;
  next_due_date: string;
  days_remaining: number;
  current_month_status: BillingCycleStatus;
  active_maintenance: MaintenanceRequest[];
}
```

---

## Payment Submission

### Receipt Upload Response
```typescript
interface ReceiptUploadResponse {
  payment_id: number;
  status: "PENDING" | "CARETAKER_REVIEW" | "APPROVED" | "REJECTED";
  receipt_image_url: string;      // URL to uploaded receipt
  extracted_data: {
    amount: number;               // Extracted via OCR
    transaction_reference: string;
    date: string;                 // YYYY-MM-DD format
  };
  ocr_match_flag: boolean;        // Whether extracted data matches user input
  ocr_confidence: number;         // 0.0 to 1.0 confidence score
  bounding_boxes: {
    amount: [number, number, number, number];        // [x1, y1, x2, y2]
    reference: [number, number, number, number];     // pixel coordinates
  };
}
```

### Payment Submit Request
```typescript
interface PaymentSubmitRequest {
  amount: number;                 // ZMW
  transaction_reference: string;  // Bank transaction ID
  date: string;                   // YYYY-MM-DD
}
```

### Payment Submit Response
```typescript
interface PaymentSubmitResponse {
  payment_id: number;
  status: "CARETAKER_REVIEW";
  message: string;
}
```

---

## OCR & Caretaker Verification

### Caretaker Verification Record
```typescript
interface VerificationRecord {
  payment_id: number;
  student_name: string;
  student_id: number;
  room: string;
  typed_amount: number;           // Amount student claimed
  typed_reference: string;        // Reference student entered
  receipt_image_url: string;      // Full image URL
  submitted_at: string;           // ISO 8601
  ocr_data: {
    extracted_amount: number;     // Amount from OCR
    extracted_reference: string;  // Reference from OCR
    match: boolean;               // Typed === Extracted
    confidence: number;           // 0.0 to 1.0
    bounding_boxes: {
      amount: [number, number, number, number];
      reference: [number, number, number, number];
    };
  };
}
```

### Verification Action Request
```typescript
interface VerificationActionRequest {
  action: "approve" | "reject";
  reason?: string;                // Required if action === "reject"
}
```

### Verification Response
```typescript
interface VerificationResponse {
  payment_id: number;
  status: "APPROVED" | "REJECTED";
  verified_by: string;            // Caretaker username/ID
  verified_at: string;            // ISO 8601 timestamp
  message: string;
}
```

---

## Landlord Dashboard

### Financial Flow Node
```typescript
interface FinancialNode {
  id: string;                     // Unique identifier
  name: string;                   // Display name
  value: number;                  // Amount in ZMW
}
```

### Financial Flow Link
```typescript
interface FinancialLink {
  source: string;                 // Source node ID
  target: string;                 // Target node ID
  value: number;                  // Amount flowing (ZMW)
}
```

### Financial Flow Response
```typescript
interface FinancialFlowData {
  period: string;                 // YYYY-MM format
  nodes: FinancialNode[];
  links: FinancialLink[];
}
```

### Delinquent Payment
```typescript
interface DelinquentPayment {
  payment_id: number;
  student_name: string;
  student_id: number;
  room: string;
  amount_owed: number;            // ZMW
  days_overdue: number;
  email: string;
  phone?: string;
  lease_end_date?: string;        // ISO 8601
}
```

### Delinquent Payments List Response
```typescript
interface DelinquentPaymentsResponse {
  count: number;                  // Total matching records
  results: DelinquentPayment[];
  next?: string;                  // URL for next page
  previous?: string;              // URL for previous page
}
```

---

## AI Chat

### Chat Message Request
```typescript
interface ChatMessageRequest {
  message: string;                // User's text input
  context?: {
    student_id?: number;
    student_name?: string;
    room?: string;
    current_balance?: number;
    lease_end_date?: string;
  };
}
```

### Chat Message Response
```typescript
interface ChatMessageResponse {
  reply: string;                  // AI-generated response
  message_id: string;             // Unique message identifier
  timestamp: string;              // ISO 8601
  context_used?: string[];        // Which context fields influenced response
}
```

### Chat History (Optional)
```typescript
interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;              // ISO 8601
}
```

---

## Lease Generation

### Lease Template Request
```typescript
interface LeaseTemplateRequest {
  student_id: number;
  format?: "html" | "pdf";        // Default: "html"
}
```

### Lease Template Response
```typescript
interface LeaseTemplateResponse {
  html: string;                   // HTML markup for printing
  student_name: string;
  room: string;
  rent_amount: number;
  lease_start: string;            // YYYY-MM-DD
  lease_end: string;              // YYYY-MM-DD
  printable: boolean;
  generated_at: string;           // ISO 8601
}
```

---

## AI Notices (Delinquent Management)

### Draft Notice Request
```typescript
interface DraftNoticeRequest {
  payment_id: number;
  student_name: string;
  room: string;
  amount_owed: number;
  days_overdue: number;
  tone?: "friendly" | "formal" | "urgent";  // Default: "friendly"
}
```

### Draft Notice Response
```typescript
interface DraftNoticeResponse {
  draft_notice: string;           // Plain text notice draft
  notice_id: string;              // Unique draft identifier
  tone_used: string;
  generated_at: string;           // ISO 8601
  editable: boolean;
}
```

### Send Notice Request
```typescript
interface SendNoticeRequest {
  notice_id: string;
  payment_id: number;
  notice_text: string;            // Final (possibly edited) text
  delivery_method: "email" | "sms" | "both";
  recipient_override?: string;    // Alternative email/phone
}
```

### Send Notice Response
```typescript
interface SendNoticeResponse {
  success: boolean;
  message_id: string;
  sent_at: string;                // ISO 8601
  recipient: string;              // Email or phone where sent
  delivery_status: "sent" | "queued" | "failed";
  error_message?: string;         // If delivery_status === "failed"
}
```

---

## Pagination

### List Response Wrapper (Optional)
```typescript
interface PaginatedResponse<T> {
  count: number;                  // Total count of all records
  next?: string;                  // URL for next page
  previous?: string;              // URL for previous page
  results: T[];                   // Array of records
}
```

---

## Error Responses

### Standard Error Response
```typescript
interface ErrorResponse {
  detail?: string;                // Human-readable error message
  error?: {
    code: string;                 // Machine-readable error code
    message: string;
    details?: Record<string, any>;
  };
  status?: number;                // HTTP status code
}
```

### Validation Error Details
```typescript
interface ValidationError {
  field: string;                  // Field name that failed
  constraint: string;             // e.g., "required", "must_be_positive"
  message: string;                // Human-readable constraint violation
}
```

---

## Frontend Component Props

### GroqChatWidget
```typescript
interface GroqChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    student_name?: string;
    room?: string;
    balance?: number;
  };
}
```

### CaretakerDashboard Mock Data
```typescript
interface MockVerificationData {
  payment_id: number;
  student_name: string;
  room: string;
  typed_amount: number;
  typed_reference: string;
  receipt_image_url: string;
  ocr_data: {
    extracted_amount: number;
    extracted_reference: string;
    match: boolean;
    bounding_boxes: {
      amount: [number, number, number, number];
      reference: [number, number, number, number];
    };
  };
}
```

---

## Date/Time Conventions

- **ISO 8601 Timestamps:** `2026-07-09T15:30:00Z` (UTC, with Z suffix)
- **Date-only format:** `2026-07-09` (YYYY-MM-DD)
- **Month format:** `2026-07` (YYYY-MM)
- **Relative dates:** "2 days ago", "3 hours ago", "Just now"

---

## Currency

- **All monetary values:** ZMW (Zambian Kwacha)
- **Decimal places:** 2 (e.g., 2500.00)
- **No currency symbol in JSON:** Use numbers only, frontend adds "ZMW" prefix in UI

---

## Required HTTP Headers

### Request Headers (Frontend → Backend)
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

### Response Headers (Backend → Frontend)
```
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

## Rate Limiting (Recommended)

- **Chat API:** 10 requests/minute per user
- **Payment Upload:** 5 requests/minute per user
- **Dashboard refresh:** No limit (encouraged frequent polling)
- **Response header:** `X-RateLimit-Remaining: 9` (optional but helpful for debugging)

---

## Notes for Backend Developers

1. **Always return consistent field names** - Use snake_case in JSON (e.g., `student_name`, not `studentName`)
2. **Null vs missing fields** - Omit optional fields rather than sending `null`
3. **Timestamps** - Always ISO 8601 with Z suffix (UTC)
4. **Relative dates** - Compute server-side for consistency
5. **Bounding boxes** - Use pixel coordinates from OCR engine, not percentages
6. **Status values** - Use exact string enums (no abbreviations)
7. **Errors** - Include `detail` or `error.message` (not both) for consistency

---

## Version History

- **v1.0** (2026-07-09) - Initial API specification
- All endpoints use `/api/` prefix
- All endpoints require JWT Bearer authentication (except `/api/auth/token/`)
