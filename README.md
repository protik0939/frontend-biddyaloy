# Biddyaloy Frontend

Role-aware frontend application for the Biddyaloy educational management platform.

This app is built with Next.js App Router and serves multiple user experiences from a single codebase:

- Public landing and onboarding flow
- Super Admin control center
- Institution Admin workspace
- Faculty workspace
- Department/Program workspace
- Teacher portal
- Student portal

The frontend communicates with the backend API for authentication, academic workflows, notices, postings, admission/job applications, payments, and profile management.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Better Auth client integration
- Sonner (notifications)
- Radix UI utilities + reusable custom components

## Key Product Capabilities

### Public (Unauthenticated)

- Marketing home page and pricing page
- Sign up and login flows
- OTP verification flow for pending accounts
- Public student and teacher application entry points

### Role-Based Dashboards

- **Super Admin**: institution reviews, approvals/rejections, platform metrics, payment reporting
- **Admin**: institution application lifecycle, subscription payment initiation, faculty/department account provisioning, settings
- **Faculty**: faculty profile, department operations, department account workflows, academic workspace
- **Department/Program**: semesters/sessions, batches/classes, sections, courses, routines, registrations, applications, transfers, fees
- **Teacher**: profile, section-wise classroom operations, classworks, attendance, marks, notices
- **Student**: timeline, registered courses, submissions, results, fee payments, profile, notices

### Cross-Cutting Features

- Centralized notices workspace with unread indicators
- Role-sensitive navigation rendering
- Theme toggle support
- Image upload/cropping workflow (ImageBB)
- Subscription-expiry and access-state handling

## Repository Structure

```text
frontend-biddyaloy/
	src/
		app/
			@unauthenticated/
			@superadmin/
			@admin/
			@faculty/
			@department/
			@teacher/
			@student/
		Components/
		contexts/
		lib/
		services/
```

## Environment Variables

Create `.env` from `.env.example` and set the values for your environment.

```env
FRONTEND_PUBLIC_URL=https://your-frontend-domain.vercel.app
BACKEND_PUBLIC_URL=https://your-backend-domain.vercel.app
FRONTEND_PREVIEW_URL_PATTERN=
AUTH_SECRET=
NODE_ENV=production
NEXT_PUBLIC_IMAGEBB_API_KEY=
```

Notes:

- `AUTH_SECRET` must match the backend secret.
- `BACKEND_PUBLIC_URL` must point to the deployed backend API base.
- In local development, use local URLs for frontend/backend.

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then update `.env` values.

### 3. Start development server

```bash
npm run dev
```

Default app URL:

- `http://localhost:3000`

## NPM Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run start` - Run production server from built assets
- `npm run lint` - Run ESLint checks

## Authentication and Session Behavior

- Uses Better Auth session cookies and role-aware rendering
- Handles pending account verification and OTP paths
- Redirects authenticated users away from login/signup when appropriate
- Applies role-based route experience through App Router parallel route groups

## API Integration Areas

Frontend services under `src/services` cover:

- Authentication and OTP verification
- Institution applications and subscription/payment workflows
- Admin/faculty/department management operations
- Teacher and student portal workflows
- Notice center and postings
- Routine, attendance, marks, registration, transfer workflows

## Build and Deployment

This project is configured for Vercel and standard Next.js deployments.

Recommended production flow:

1. Configure all required environment variables in your hosting platform.
2. Ensure backend deployment is live and reachable from `BACKEND_PUBLIC_URL`.
3. Run `npm run build` during CI/CD.
4. Deploy the generated Next.js app.

## Operational Notes

- Keep frontend and backend environment contracts in sync (`AUTH_SECRET`, public URLs).
- For role features, ensure the backend sends normalized role and account status values.
- Notices, fees, routines, and profile operations depend on backend route availability and valid session cookies.

## License

This project is currently private/internal. Add or update licensing terms as needed.
