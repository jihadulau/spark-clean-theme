# Cleandigo - Professional Cleaning Services Platform

A comprehensive, production-ready cleaning services platform built with React, TypeScript, and Supabase. Features customer bookings, admin management, role-based access control, real-time updates, and automated workflows.

## 🌟 Key Features

### **Authentication & Security**
- **Simple Email/Password Auth**: No mandatory email verification or 2FA
- **Password Reset Flow**: Secure password recovery via email
- **Session Persistence**: Users stay logged in until explicit sign out
- **Role-Based Access**: Customer, Cleaner, and Admin roles with appropriate permissions
- **Comprehensive RLS**: Row Level Security on all tables with WITH CHECK constraints

### **Customer Experience (/account)**
- **Next Booking Card**: Prominent display of upcoming cleaning with status timeline
- **Tabbed Dashboard**: Upcoming | Past | Invoices | Reviews
- **Review System**: 5-star rating system for completed services
- **Phone-Only Changes**: Prominent "Call to reschedule" messaging (no online cancellation)
- **Real-time Updates**: Live booking status changes

### **Admin Dashboard (/admin)**
- **KPI Cards**: New bookings (7d), assigned, in-progress, completed (30d), cancellations
- **Bookings Management**: Full CRUD with filters, status updates, assignments
- **User Management**: View all users, change roles, deactivate accounts
- **Services CRUD**: Manage service catalog with pricing
- **CSV Export**: Filtered booking exports with pagination
- **Photo Management**: Before/after photos per booking via Supabase Storage

### **Data Integrity & Performance**
- **Booking Constraints**: Future dates only (admin override), valid status transitions
- **Payment System**: Unique invoice numbers per financial year, AUD currency
- **Performance Indexes**: Optimized queries on status, dates, foreign keys
- **Audit Logging**: Complete audit trail of all system changes
- **Real-time Subscriptions**: Live updates for bookings and assignments

### **Advanced Features**
- **Edge Functions**: Email notifications with retry/idempotency, stale booking cleanup
- **Storage Integration**: Secure photo uploads with 15-min signed URLs
- **Pagination & Filters**: Efficient data handling for large datasets
- **Error Boundaries**: Graceful error handling with recovery options
- **Loading States**: Skeleton loaders and empty states with friendly CTAs
- **Accessibility**: Proper ARIA labels, focus states, keyboard navigation

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type safety
- **Tailwind CSS** with custom design system and semantic tokens
- **shadcn/ui** components with customization
- **React Router** for client-side routing
- **TanStack Query** for server state management
- **Vite** for fast development and builds

### **Backend (Supabase)**
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time** subscriptions for live updates
- **Storage** for file uploads with access controls
- **Edge Functions** for serverless business logic
- **Auth** with JWT tokens and session management

### **Database Schema**
```
profiles (user data + roles)
├── bookings (main booking records)
│   ├── booking_items (services per booking)
│   ├── assignments (cleaner assignments)
│   ├── booking_status_history (audit trail)
│   └── payments (payment tracking)
├── services (cleaning service catalog)
├── reviews (customer feedback)
└── audit_log (system-wide audit trail)
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- Supabase account and project
- (Optional) SMTP service for email notifications

### **Installation**

1. **Clone and Install**
   ```bash
   git clone [repository-url]
   cd cleandigo
   npm install
   ```

2. **Environment Setup**
   The `.env` file is auto-managed by Lovable Cloud:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

3. **Database Setup**
   All SQL migrations are included and create:
   - Complete schema with RLS policies
   - Status transition validation
   - Performance indexes
   - Audit logging triggers
   - Storage bucket policies

4. **Start Development**
   ```bash
   npm run dev
   ```

### **First Admin Setup**
1. Sign up with email: `admin@cleandigo.com.au`
2. This automatically creates an admin account
3. Update company settings in database if needed

## 📊 Usage Workflows

### **Customer Journey**
1. **Registration**: Email/password signup (auto-role: customer)
2. **Booking**: Phone-only booking process (call-to-action)
3. **Tracking**: Real-time status updates in dashboard
4. **Reviews**: Rate completed services (1-5 stars)
5. **Changes**: Call-only reschedule/cancel policy

### **Admin Workflow**
1. **Dashboard**: Overview KPIs and recent activity
2. **Booking Management**: Create/update bookings, assign cleaners
3. **Status Updates**: Progress tracking with notes
4. **Photo Management**: Before/after cleaning documentation
5. **Reporting**: CSV exports with flexible filters
6. **User Management**: Role changes and account management

### **Real-time Features**
- Booking status changes update instantly across all connected clients
- Admin dashboard shows live booking updates
- Status history tracks all changes with timestamps

## 🔧 Configuration

### **Business Settings**
Update these constants for your business:
```sql
-- Company settings in database
UPDATE public.company_settings SET
  abn = 'your_abn',
  company_name = 'Your Company Name',
  phone = 'your_phone',
  email = 'your_email';
```

### **Email Notifications**
1. Set up SMTP service (Resend recommended)
2. Add API key to Supabase secrets: `RESEND_API_KEY`
3. Configure sender domain and templates

### **Time Zone & Currency**
- **Display**: Australia/Sydney timezone
- **Storage**: UTC in database
- **Currency**: AUD throughout system
- **Financial Year**: July 1 - June 30

## 🛡️ Security Features

### **Row Level Security (RLS)**
```sql
-- Example policy structure
CREATE POLICY "Customers own data" ON bookings
  FOR ALL USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());
```

### **Storage Security**
- **Customer**: Read-only access to own booking photos
- **Cleaner**: Read/write access to assigned booking photos  
- **Admin**: Full access to all photos
- **Signed URLs**: 15-minute expiry for secure access

### **Data Validation**
- Status transition validation (prevents invalid flows)
- Future date constraints (admin override available)
- Unique invoice numbering per financial year
- Comprehensive audit logging

## 📈 Performance Optimizations

### **Database Indexes**
```sql
-- Key performance indexes
idx_bookings_status_date (status, booking_date)
idx_bookings_customer_status (customer_id, status) 
idx_assignments_cleaner_date (cleaner_id, assigned_at)
```

### **Frontend Optimizations**
- **Pagination**: Efficient data loading for large datasets
- **Real-time**: Selective subscriptions to reduce bandwidth
- **Skeleton Loading**: Improve perceived performance
- **Error Boundaries**: Prevent cascading failures

### **Caching Strategy**
- Static assets cached by CDN
- API responses cached by TanStack Query
- Real-time updates invalidate relevant caches

## 🔄 Edge Functions

### **Email Notifications** (`enhanced-send-email`)
- Retry logic with exponential backoff
- Idempotency keys prevent duplicates
- Supports all booking lifecycle events

### **Stale Booking Cleanup** (`flag-stale-bookings`)
- Runs via cron job (daily at 9 AM)
- Flags pending bookings > 24 hours
- Sends admin notifications

### **CSV Export** (`enhanced-export-bookings`)
- Admin-only access with JWT verification
- Flexible filtering and pagination
- Audit logging of all exports

## 📱 Mobile Experience

### **Responsive Design**
- Mobile-first Tailwind CSS
- Touch-friendly interactions
- Optimized for various screen sizes

### **Click-to-Call Integration**
- Automatic phone number formatting
- One-tap calling on mobile devices
- Prominent call-to-action buttons

## 🚨 Error Handling

### **Error Boundaries**
- Graceful degradation for component errors
- User-friendly error messages
- Automatic error reporting
- Recovery options

### **Toast Notifications**
- Success confirmations
- Error alerts with actionable advice
- Loading states for async operations

## 🔍 Monitoring & Logging

### **Audit Logging**
- All database changes tracked
- User attribution for actions
- Timestamp and change details
- Export audit for compliance

### **Performance Monitoring**
- Real-time error tracking
- Performance metrics
- Database query optimization
- User experience analytics

## 🚀 Deployment

### **Lovable Cloud (Recommended)**
- Automatic deployment on code changes
- Integrated Supabase backend  
- SSL certificates and custom domains
- Built-in monitoring and logs

### **Manual Deployment**
1. **Build**: `npm run build`
2. **Deploy**: Upload `dist/` to hosting platform
3. **Environment**: Configure production variables
4. **Edge Functions**: Deploy separately to Supabase

## 🔐 Privacy & Compliance

### **Data Protection**
- Job photos stored securely in Supabase Storage
- Customer opt-out available for photo storage
- GDPR-compliant data handling
- Regular backup procedures

### **Privacy Policy Notes**
```
"Photos may be taken during cleaning services for quality assurance. 
Customers may opt out by calling [phone number]. Photos are stored 
securely and deleted after [retention period]."
```

## 📞 Support & Contact

### **Business Contact**
- **Phone**: 0420 331 350
- **Email**: info@cleandigo.com.au
- **ABN**: 12 345 678 901

### **Technical Support**
- Check error boundaries for detailed error information
- Review audit logs for data consistency issues
- Monitor Edge Function logs for integration problems

## 📄 License

[Add your license information here]

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Supabase**