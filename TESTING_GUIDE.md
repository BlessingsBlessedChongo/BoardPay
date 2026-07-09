# BoardPay Integration - Quick Reference & Testing Guide

## CURL Examples for API Testing

### 1. Get Student Dashboard
```bash
curl -X GET http://localhost:8000/api/student/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "student_name": "John Doe",
  "room_display": "Room 4B, Campus Housing",
  "payment_streak": 4,
  "next_due_date": "2026-07-31",
  "days_remaining": 21,
  "current_month_status": {
    "current_step": "CARETAKER_REVIEW",
    "steps_completed": ["RECEIPT_UPLOADED"],
    "steps_pending": ["CARETAKER_REVIEW", "SECURED_ON_LEDGER"],
    "extracted_amount": 2500
  },
  "active_maintenance": [
    {
      "id": 1,
      "title": "Leaking tap",
      "status": "IN_PROGRESS",
      "created_at": "2026-07-09T10:30:00Z",
      "created_at_relative": "2 days ago"
    }
  ]
}
```

### 2. Upload Receipt for OCR
```bash
curl -X POST http://localhost:8000/api/payments/upload/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/receipt.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "extracted_data": {
    "amount": 2500,
    "transaction_reference": "TXN987654321",
    "date": "2026-07-09"
  },
  "message": "Receipt data extracted successfully"
}
```

### 3. Send Chat Message
```bash
curl -X POST http://localhost:8000/api/ai/chat/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "When is my rent due?"}'
```

**Expected Response:**
```json
{
  "reply": "Your rent is due on the 31st of each month. You currently have 21 days remaining to submit your payment proof."
}
```

---

## Python/Django Testing

### Setup Test Database
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Create Test Student User
```python
from django.contrib.auth import get_user_model

User = get_user_model()
student = User.objects.create_user(
    username='teststu',
    email='test@example.com',
    password='testpass123',
    role='STUDENT',
    payment_streak=2
)
```

### Test Gemini OCR Service
```python
from payments.gemini_service import extract_receipt_data

# Test with a local receipt image
extracted = extract_receipt_data('/path/to/receipt.jpg')
print(extracted)
# Output: {'amount': 2500, 'transaction_reference': 'TXN123', 'date': '2026-07-09'}
```

### Test Groq Chat Service
```python
from analytics.groq_service import get_chat_response

response = get_chat_response("When is my rent due?")
print(response)
# Output: "Your rent is due on the 31st of each month..."
```

---

## Frontend Testing with React DevTools

### Check API Calls
```javascript
// In browser console
import api from './api/axios';

// Test dashboard fetch
api.get('/student/dashboard/').then(r => console.log(r.data))

// Test receipt upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
api.post('/payments/upload/', formData).then(r => console.log(r.data))

// Test chat
api.post('/ai/chat/', { message: 'Hello' }).then(r => console.log(r.data))
```

### Check Component State
```javascript
// In React DevTools Components tab
// Select StudentDashboard
// Props:
//   - dashboardData: {} (from API)
//   - isLoading: boolean
//   - error: string or null

// Select UploadPanel
// State:
//   - uploadState: 'idle' | 'uploading' | 'success' | 'error'
//   - previewData: {} or null
//   - errorMessage: string

// Select GroqChatWidget
// State:
//   - messages: Array<{id, sender, text}>
//   - inputValue: string
//   - isLoading: boolean
```

---

## Environment Setup

### .env File (Backend)
```bash
# Django settings
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///db.sqlite3

# API Keys
GEMINI_API_KEY=sk-...your-google-generativeai-key...
GROQ_API_KEY=...your-groq-api-key...

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret
```

### Frontend Environment
```bash
# .env or .env.local
VITE_API_URL=http://localhost:8000/api
```

---

## Common Issues & Solutions

### Issue: "GEMINI_API_KEY not set"
**Solution:** 
```bash
export GEMINI_API_KEY="your-key"
# Or add to .env file
```

### Issue: "CORS error on file upload"
**Solution:** Ensure Django CORS settings allow the frontend origin:
```python
# core/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative port
]
```

### Issue: "401 Unauthorized on API call"
**Solution:** Ensure token is stored and sent:
```javascript
// Check if token exists
console.log(localStorage.getItem('access_token'))

// Manually set token if needed
localStorage.setItem('access_token', 'your-token-from-login')
```

### Issue: "OCR returns null"
**Solutions:**
1. Check GEMINI_API_KEY is valid
2. Ensure image file exists and is readable
3. Check network connectivity
4. Verify Gemini API quota

### Issue: "Chat returns 503 Service Unavailable"
**Solutions:**
1. Check GROQ_API_KEY is valid
2. Verify Groq API is accessible
3. Check rate limiting (Groq has request limits)

---

## Performance Optimization Tips

### Frontend
```javascript
// Memoize components that receive static props
import { memo } from 'react';

const BillingTimeline = memo(({ data }) => {
  // Component code
});

// Use useCallback for event handlers
const handleUpload = useCallback(async (file) => {
  // ...
}, [dependencies]);
```

### Backend
```python
# Cache dashboard queries
from django.views.decorators.cache import cache_page

@cache_page(60)  # Cache for 60 seconds
def get_dashboard(request):
    # ...
```

---

## Database Migrations Needed

```bash
# Create migrations for model changes
python manage.py makemigrations

# Review migration files (they'll be in app/migrations/)
# Then apply them
python manage.py migrate

# To rollback if needed:
python manage.py migrate [app_name] 0001
```

### Migration files that will be created:
- `users/migrations/000X_add_payment_streak.py` - Adds payment_streak field
- `payments/migrations/000X_add_ocr_data.py` - Adds ocr_data field

---

## Testing Checklist

- [ ] Backend Django server runs without errors
- [ ] Frontend Vite dev server builds successfully
- [ ] Can login and receive JWT tokens
- [ ] StudentDashboard loads real data from API
- [ ] File upload triggers Gemini OCR extraction
- [ ] Extracted OCR data displays in preview form
- [ ] Can edit extracted values
- [ ] Payment submission saves to database
- [ ] Chat widget sends messages to Groq API
- [ ] AI responses appear in chat thread
- [ ] Error messages display on API failures
- [ ] Token refresh works on 401 responses
- [ ] Maintenance requests load in dashboard
- [ ] No console errors in browser
- [ ] API requests include Authorization header

---

## File Structure Reference

```
/boarding-house-system
├── Backend (Django)
│   ├── users/
│   │   ├── models.py           # Updated: added payment_streak
│   │   ├── serializers.py      # Updated: JWT with role
│   │   ├── views.py            # Existing: login, register
│   │   └── dashboard.py        # NEW: StudentDashboardView, AIChatView
│   ├── payments/
│   │   ├── models.py           # Updated: added ocr_data
│   │   ├── views.py            # Updated: added upload action
│   │   ├── serializers.py      # Updated: ocr_data field
│   │   └── gemini_service.py   # NEW: OCR extraction
│   ├── maintenance/
│   │   ├── models.py           # Existing
│   │   ├── serializers.py      # NEW: MaintenanceSerializer
│   │   └── views.py            # NEW: MaintenanceRequestViewSet
│   ├── analytics/
│   │   └── groq_service.py     # NEW: Chat responses
│   ├── core/
│   │   └── urls.py             # Updated: new endpoints
│   └── requirements.txt         # Updated: google-generativeai, groq
│
├── Frontend (React)
│   └── src/
│       ├── pages/
│       │   └── StudentDashboard.jsx     # Refactored: real API
│       ├── components/
│       │   ├── UploadPanel.jsx          # Refactored: real API + FormData
│       │   ├── GroqChatWidget.jsx       # Refactored: real API
│       │   ├── WelcomeHero.jsx          # Existing: data binding
│       │   └── BillingTimeline.jsx      # Existing: data binding
│       └── api/
│           └── axios.js                 # Existing: auth interceptor
│
└── IMPLEMENTATION_GUIDE.md              # This document
```

---

## Support & Debugging

### Enable Django Debug Mode
```python
# core/settings.py
DEBUG = True
```

### View API Requests
```javascript
// Browser Console
// Check Network tab in DevTools
// Filter by 'api' to see requests
```

### Django Shell Testing
```bash
python manage.py shell

# Check user payment streak
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(username='teststu')
print(user.payment_streak)

# Check payment OCR data
from payments.models import Payment
p = Payment.objects.first()
print(p.ocr_data)
```

---

## Next Steps

1. ✅ Backend endpoints implemented
2. ✅ Frontend components refactored
3. ✅ Axios integration complete
4. 🔄 **Run Django migrations**
5. 🔄 **Set environment variables (API keys)**
6. 🔄 **Test all endpoints**
7. 🔄 **Deploy to production**

---

**Last Updated:** 2026-07-09
**Status:** Ready for Production Testing
