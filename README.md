<h1 align="center">👥 Achievers Hub</h1>

<p align="center">
  <strong>From strangers to structured connections — networking that works.
</p>

## The Problem (The "Why")

Professional events, workshops, and educational cohorts consistently fail in the first five minutes. They gather high-value individuals in a room and provide them with zero effective tools to answer three simple questions:

1.  **Who is in this room?**
2.  **Why should I talk to them?**
3.  **How can I find the right person *now*?**

The result is chaos, wasted time, broken promises of "networking," and a low ROI for both participants and organizers. This tool solves this problem.

**This project is NOT:**
*   A social network.
*   A learning management system (LMS).
*   An "all-in-one" event platform.

It is a surgical tool designed to solve the information asymmetry of "Day 1."

## The Solution (The MVP Scope)

Achievers Hub is a simple, mobile-responsive web application designed to be the official "first step" of any cohort-based event. It includes the following features:

*   **🔐 Access Code Requirement:** Signup requires a valid access code for event security.
*   **👤 Comprehensive Profile Creation:** Users create profiles with display name, title, superpower, kryptonite, LinkedIn, and profile image.
*   **📇 Searchable Member Directory:** A clean, scannable grid of all participant profiles (not filterable).
*   **❤️ My Circle:** Saved connections with personal notes for meaningful networking.
*   **🎯 Meet Opt-in Toggle:** Users can opt-in to be available for meetings.
*   **🔍 Real-time Search:** Instant search across all profile fields to find the right connections.

https://github.com/user-attachments/assets/09034405-b212-4ad0-9c3a-01485d0e9ab8

## Project Structure

The project is organized with a focus on the frontend application.

```
the-hub/
├── frontend/             # All Next.js frontend code and configuration
│   ├── .next/            # Next.js build output
│   ├── node_modules/     # Frontend dependencies
│   ├── public/           # Frontend public assets
│   ├── src/              # Next.js application source
│   ├── .eslintrc.json    # Frontend ESLint configuration
│   ├── next-env.d.ts     # Next.js environment types
│   ├── next.config.mjs   # Next.js configuration
│   ├── package.json      # Frontend dependencies and scripts
│   ├── package-lock.json # Frontend dependency lock file
│   ├── postcss.config.mjs # PostCSS configuration for frontend
│   └── tsconfig.json     # Frontend TypeScript configuration
│
├── .gitignore            # Monorepo-level ignore rules
├── README.md             # Project README
└── .env.local            # Environment variables (sensitive data)
```

## Tech Stack

This project utilizes a modern technology stack:

*   **Frontend:**
    *   **Framework:** [Next.js](https://nextjs.org/)
    *   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
    *   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Authentication & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)

## Getting Started

Follow these steps to set up and run The Hub application locally.

### 1. Prerequisites

*   Node.js (v18+) - for frontend development (can be managed by nvm or similar)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (optional - for running the backend locally)

### 2. Clone the Repository

```bash
git clone https://github.com/felipe-jimenez-ai/the-hub.git
cd the-hub
```

### 3. Environment Variables

The project is configured to use Supabase for authentication and database. The environment variables are set up in `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**⚠️ SECURITY WARNING:** Never commit your actual API keys to the repository. The `.env.local` file is already in `.gitignore` to prevent this.

### 4. Install Frontend Dependencies

Navigate into the `frontend/` directory and install its dependencies:

```bash
cd frontend
npm install
```

### 5. Run the Frontend Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The application is currently configured to use Supabase for authentication and data storage, so no additional backend setup is required for the frontend to function.

## Usage

Users interact with Achievers Hub through the following flow:

1. **Landing Page:** Visit the application to get an overview and enter an access code.
2. **Access Code Entry:** Provide a valid access code to proceed with signup.
3. **Authentication:** Sign up or log in using Supabase authentication.
4. **Profile Setup:** Create a comprehensive profile including display name, title, superpower, kryptonite, LinkedIn, and profile image.
5. **Browsing Members:** View the searchable member directory to explore participant profiles.
6. **Searching:** Use real-time search across all profile fields to find specific connections.
7. **Saving Connections:** Add members to "My Circle" with personal notes for future reference.
8. **Managing My Circle:** Organize and manage saved connections, including toggling meet availability.

## Current Deployment Status

The live application is currently deployed and accessible at: **https://achievers-az.vercel.app/**

## Deployment to Vercel (Frontend Only)

For Vercel deployment, remember to configure the **Root Directory** setting in your Vercel project dashboard to `frontend/`. This tells Vercel where to find your Next.js application.

The project is already configured for Vercel deployment with the correct build settings and environment variables.

## Roadmap (Post-Paid-Pilot ONLY)

The following features will only be considered after a successful, **paid** pilot project is completed.

*   **V2 - Admin Dashboard:** Analytics for the organizer showing connection metrics.
*   **V3 - AI Recommendations:** Basic matching between "Superpower" and "Kryptonite" fields.
*   **V4 - Persistence:** Allowing users to access their "dossier" from past events.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
