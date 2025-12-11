[README.md](https://github.com/user-attachments/files/24104985/README.md)
# Vanguard CRM

A modern, full-stack Customer Relationship Management system built specifically for roofing contractors. Vanguard CRM streamlines the entire sales pipeline from lead generation to material ordering, with specialized features for insurance claims, proposal generation, and team management.

![Vanguard Systems](https://yqcmzujqdouoarmvkynh.supabase.co/storage/v1/object/public/Proposal_Bucket/vanguard-logo.png)

## 🚀 Features

### 📊 Sales Pipeline Management
- **Lead Tracking**: Capture and manage leads with automatic assignment to sales reps
- **Pipeline Stages**: Track jobs through customizable stages (Lead → Prospect → Appointment → Approved → Production)
- **Smart Validation**: Enforce data requirements at each pipeline stage
- **Activity Logging**: Automatic tracking of all job interactions and status changes

### 💰 Proposal & Pricing System
- **Dynamic Pricing Calculator**: Real-time pricing with margin-based approval workflows
- **Three-Tier Approval System**:
  - **Green Zone** (≥$500/sq): Instant approval
  - **Yellow Zone** ($450-$499/sq): Owner approval required
  - **Red Zone** (<$450/sq): Blocked
- **Negotiation Workflow**: Built-in counter-offer system between reps and owners
- **Multi-Deal Types**: Support for Insurance, Cash, and Financed deals

### 📄 Document Generation
- **PDF Contract Generation**: Automated contract creation with deal-type specific templates
- **Digital Signatures**: In-app signature capture with embedded signature in PDFs
- **Insurance Documents**: Specialized Letter of Authorization (LOA) and Contingency Agreements
- **Document Management**: Centralized storage and retrieval of all job documents

### 🏗️ Production Management
- **Roof Measurement**: Manual entry and satellite-based measurement integration
- **Material Ordering**: Automated material calculations with Beacon formulas
- **Production Reports**: Track job progress and completion status
- **Photo Management**: Upload and organize job site photos with EXIF data extraction

### 👥 Team Collaboration
- **Role-Based Access Control**: Owner, Team Lead, Sales Rep, and Office Staff roles
- **Team Management**: Organize reps under team leads with hierarchical visibility
- **Row-Level Security**: Supabase RLS ensures data isolation between teams
- **Activity Feeds**: Real-time updates on job activities

### 🗺️ Mapping & Location
- **Google Maps Integration**: Interactive job location mapping
- **Address Autocomplete**: Smart address entry with Google Places API
- **Territory Management**: Visual representation of job locations

### 📱 Communication
- **SMS Integration**: Twilio-powered text messaging
- **Email Notifications**: Automated email updates and material orders
- **In-App Messaging**: Job-specific message threads

### 📈 Analytics & Reporting
- **Dashboard Metrics**: Real-time sales performance tracking
- **Pipeline Reports**: Visual pipeline analysis with conversion rates
- **Team Performance**: Individual and team-level analytics
- **Revenue Tracking**: Monitor pricing trends and margins

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **Maps**: Google Maps JavaScript API
- **PDF Generation**: jsPDF, React-PDF

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **API**: tRPC for end-to-end type safety
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage (AWS S3)
- **PDF Generation**: PDFKit

### Infrastructure
- **Database**: Supabase (PostgreSQL + Storage + Auth)
- **Deployment**: Vercel (Frontend) / Render (Backend)
- **Package Manager**: pnpm
- **Build Tool**: Vite 7
- **Type Checking**: TypeScript 5.9

### Third-Party Services
- **Google Maps API**: Geocoding, Places, Maps JavaScript API
- **Twilio**: SMS messaging
- **Stripe**: Payment processing (optional)
- **Google Generative AI**: AI-powered features (optional)

## 📦 Installation

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.0.0
- PostgreSQL database (or Supabase account)
- Google Maps API key
- Supabase project

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vanguard-crm.git
cd vanguard-crm
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps (for server-side geocoding)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional Services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_AI_API_KEY=your_google_ai_key
```

Create `client/.env` for frontend:

```env
# Google Maps (client-side)
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

### 4. Database Setup

Run the database migrations:

```bash
pnpm db:push
```

Or manually run the SQL migrations in the `drizzle/` folder and `QUICK_START_SQL.sql`.

### 5. Start Development Servers

```bash
# Start both client and server
pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- **[Setup Guide](docs/SETUP.md)**: Complete environment setup instructions
- **[Field Test Guide](docs/FIELD_TEST_GUIDE.md)**: Comprehensive testing workflow
- **[Google Maps Setup](docs/GOOGLE_MAPS_SETUP.md)**: Maps API configuration
- **[Supabase Setup](SUPABASE_SETUP_GUIDE.md)**: Database and storage setup
- **[Lien Rights Automation](docs/LIEN_RIGHTS_AUTOMATION.md)**: Automated lien notice system

## 🎨 Brand Identity

**Vanguard Systems (VIS)** uses a modern, professional design system:

- **Primary Color**: Electric Cyan (`#00D4FF`)
- **Secondary Color**: Deep Navy (`#001F3F`)
- **Design Philosophy**: "Security & Innovation" - Dark mode interface with cyan accents

See [REBRANDING_SUMMARY.md](REBRANDING_SUMMARY.md) for complete brand guidelines.

## 🏗️ Project Structure

```
vanguard-crm/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and constants
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
├── server/                # Backend Express application
│   ├── _core/            # Core server setup
│   ├── api/              # API route handlers
│   ├── lib/              # Server utilities
│   └── types/            # Server type definitions
├── shared/               # Shared types between client/server
├── drizzle/              # Database migrations
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## 🔐 Security

- **Row-Level Security (RLS)**: Supabase RLS policies enforce data isolation
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permissions by user role
- **API Key Protection**: Environment variables for all sensitive keys
- **HTTPS Only**: Enforced secure connections in production

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

For comprehensive feature testing, follow the [Field Test Guide](docs/FIELD_TEST_GUIDE.md).

## 📦 Building for Production

### Build the application:
```bash
pnpm build
```

This will:
1. Type-check the entire codebase
2. Build the server bundle (`dist/index.js`)
3. Build the client static files (`dist/client/`)

### Start production server:
```bash
pnpm start
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Create a new Web Service
2. Set environment variables
3. Deploy from GitHub
4. Set build command: `pnpm build`
5. Set start command: `pnpm start`

See [SETUP.md](docs/SETUP.md) for detailed deployment instructions.

## 🤝 Contributing

This is a private repository for Vanguard Systems. If you've been invited to contribute:

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Test thoroughly using the Field Test Guide
4. Submit a pull request for review

## 📝 Scripts

- `pnpm dev` - Start development servers (client + server)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm check` - Type-check without building
- `pnpm test` - Run test suite
- `pnpm format` - Format code with Prettier
- `pnpm db:push` - Run database migrations

## 🐛 Known Issues

See [CLEANUP_PASS_COMPLETE.md](CLEANUP_PASS_COMPLETE.md) for recent fixes and improvements.

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For questions or issues:
1. Check the documentation in the `docs/` folder
2. Review the [Field Test Guide](docs/FIELD_TEST_GUIDE.md) for common workflows
3. Check existing issues in the repository
4. Contact the development team

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered lead scoring
- [ ] Automated follow-up sequences
- [ ] Integration with accounting software
- [ ] Customer portal for job tracking

---

**Built with ❤️ by the Vanguard Systems team**
