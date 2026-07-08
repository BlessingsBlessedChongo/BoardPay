# BoardPay - Hybrid Boarding House Ledger

A modern React frontend for a boarding house payment management system with role-based dashboards for students, caretakers, and landlords.

## Features

### 🔐 Authentication
- JWT-based authentication with token storage in localStorage
- Automatic role-based redirection after login
- Protected routes that redirect to login if no token exists

### 👨‍🎓 Student Dashboard
- Submit rent payments with lease ID, amount, and transaction reference
- Upload receipt images for payment verification
- Real-time feedback on submission success/failure
- Form validation and error handling

### 👤 Caretaker Dashboard
- Full-screen split-panel layout for payment verification
- Left sidebar with list of pending payments
- Payment details display with OCR match status
- Receipt image viewer with fit-contain display
- Approve/Reject payments with optional rejection reasons
- Keyboard shortcuts (A for approve, R for reject)
- Real-time refetch after action completion

### 🏢 Landlord Dashboard
- Monthly revenue bar chart visualization
- Occupancy rate pie chart (occupied vs vacant units)
- Pending verifications counter
- Individual stats cards for occupied and vacant units
- Responsive grid layout that adapts to screen size

## Tech Stack

- **React 19.2.7** - UI framework
- **React Router 7.18.1** - Client-side routing
- **Axios 1.18.1** - HTTP client with JWT interceptor
- **Recharts 3.9.2** - Chart library
- **React Resizable Panels 4.12.1** - Resizable split panels
- **Tailwind CSS 4.3.2** - Utility-first CSS framework

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Login.js              # Login page
│   │   ├── StudentDashboard.js   # Payment submission form
│   │   ├── CaretakerDashboard.js # Payment verification interface
│   │   └── LandlordDashboard.js  # Analytics and statistics
│   ├── api/
│   │   └── axios.js              # Axios instance with JWT interceptor
│   ├── App.js                    # Main routing component
│   ├── App.css                   # Component styles
│   ├── index.js                  # React entry point
│   └── index.css                 # Global styles with Tailwind
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure environment:**
   - The API base URL is set to `http://127.0.0.1:8000/api` in `src/api/axios.js`
   - Update if your backend is hosted elsewhere

3. **Start development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

## API Integration

### Authentication Endpoint
- **POST** `/api/auth/token/`
  - Request: `{ username, password }`
  - Response: `{ access, refresh }`

### Student Payment Submission
- **POST** `/api/payments/`
  - Content-Type: `multipart/form-data`
  - Fields: `lease`, `amount`, `transaction_ref`, `receipt_image`

### Caretaker - Pending Payments
- **GET** `/api/payments/?status=PENDING`
  - Returns: Array of pending payment objects

### Caretaker - Verify Payment
- **PATCH** `/api/payments/{id}/verify/`
  - Request: `{ action: 'approve' | 'reject', reason?: string }`

### Landlord - Statistics
- **GET** `/api/analytics/landlord-stats/`
  - Returns: `{ monthly_revenue: [...], occupancy: { occupied, vacant }, pending_count }`

## Authentication Flow

1. User enters credentials on login page
2. Frontend sends POST request to `/api/auth/token/`
3. Backend returns JWT tokens (access & refresh)
4. Tokens stored in localStorage
5. JWT is decoded (base64) to extract user `role`
6. User is redirected based on role:
   - `STUDENT` → `/student`
   - `CARETAKER` → `/caretaker`
   - `LANDLORD` → `/landlord`
7. All subsequent API requests include JWT in Authorization header

## Styling

- **Design System:**
  - Dark mode only (bg: #030712)
  - Glass-morphism cards with cyan accents (#00f0ff)
  - Responsive Tailwind CSS utilities
  
- **Key Classes:**
  - `.glass-card` - Glassmorphic container
  - `.glass-input` - Styled form inputs
  - `.btn-cyan` - Primary cyan button
  - `.btn-red-outline` - Reject button style
  - `.status-badge` - Status indicator

## Keyboard Shortcuts (Caretaker)

- **A** - Approve selected payment
- **R** - Reject selected payment (requires reason)

## Error Handling

- Failed login attempts show error messages
- Form validation prevents invalid submissions
- API errors are displayed to users
- Network errors are handled gracefully

## State Management

Uses React hooks (useState, useEffect) for local component state. No Redux or global state needed for current functionality.

## Browser Support

Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)

## Development Notes

- All components use plain JavaScript (no TypeScript)
- CSS classes are Tailwind-based with custom `@layer components` utilities
- JWT tokens are stored in localStorage (consider using httpOnly cookies for production)
- Image URLs are prefixed with backend base URL for receipt display
- Charts use ResponsiveContainer for automatic width calculation

## Future Enhancements

- Implement token refresh logic
- Add student payment history
- Implement sorting/filtering on payment lists
- Add export functionality for reports
- Implement real-time updates with WebSockets
- Add mobile-optimized views
- Implement search functionality
