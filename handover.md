# Teacher PONGDEE PA Website - Handover Documentation

## Project Overview

This project is a complete migration of the Teacher PONGDEE PA Website from a Google Sheets/Apps Script backend to a **Firebase** backend. It is built with **Next.js 15**, **Tailwind CSS 4**, and **TypeScript**.

## Key Features

- **Firebase Authentication**: Secure login for administrators.
- **Firestore Database**: Stores all site data including Profile, Fiscal Years, and PA Tasks.
- **Firebase Storage**: Handles file uploads (Evidence images, Profile pictures).
- **Responsive Design**: Mobile-friendly UI with a Royal Blue & Gold theme.
- **PA Reporting**: Dynamic dashboard with charts, standard indicators, and printable reports.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Local Development

1. **Navigate to the project directory**:

    ```bash
    cd "TeacherPONGDEE-PA-Website"
    ```

2. **Install dependencies** (already run):

    ```bash
    npm install
    ```

3. **Run the development server**:

    ```bash
    npm run dev
    ```

4. **Open in browser**:
    Visit [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

This project is optimized for- **Deployment**: Vercel (Auto-deploy via Git push)

- **CMS**: Admin Dashboard with Firebase
- **Rich Text**: Tiptap Editor with `HtmlContent` component for rendering

## Status

- Core features implemented.
- Rich text rendering fixed for public pages and Home page.
- Admin Panel functional for PA Agreement and Reports.

1. **Push to GitHub**:
    Initialize a git repo (if not already done), add all files, and push to GitHub.

    ```bash
    git init
    git add .
    git commit -m "Initial commit of Firebase-migrated PA Website"
    git branch -M main
    # git remote add origin <your-repo-url>
    # git push -u origin main
    ```

2. **Deploy on Vercel**:
    - Import the repository in Vercel.
    - **Environment Variables**: Add the following variables (copy values from your `.env.local`):
        - `NEXT_PUBLIC_FIREBASE_API_KEY`
        - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
        - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
        - `NEXT_PUBLIC_FIREBASE_APP_ID`
    - Click **Deploy**.

## Security Rules

The project includes `firestore.rules` and `storage.rules` which should be deployed to your Firebase Console > Firestore > Rules and Firebase Console > Storage > Rules respectively.
These rules ensure that:

- **Everyone** can *read* the data (so the website works for visitors).
- **Only Admins** (authenticated users) can *write/edit* the data.

## Common Tasks

### Adding a New Fiscal Year

1. Login to `/admin/login`.
2. Go to the Dashboard (`/admin`).
3. Click "**+ เพิ่มปีงบประมาณ**".
4. Enter the year (e.g., 2568) and check "**ตั้งเป็นปีปัจจุบัน**".

### Editing Profile

1. Go to **Settings** (`/admin/settings`).
2. Update your bio, name, education, or career history.
3. Upload a new profile picture.

### Adding PA Evidence

1. Go to the Dashboard (`/admin`).
2. Select the Year and Category (e.g., Learning).
3. Click on the specific Indicator (e.g., 2.1.1).
4. Upload files under the "**หลักฐานร่องรอย**" section.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Backend Services**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF**: Feature Removed (2026-01-15)

## Recent Updates (2026-01-15)

- **About Page Overhaul**: Moved "About Pongdee" to a dedicated `/about` page. Redesigned with a spacious grid layout.
- **Workload Visuals**: Implemented subject tags and radial gauge charts for teaching hours. Added side-by-side semester comparison.
- **Bug Fixes**: Fixed correct indicator codes, HTML rendering issues, and broken links.
- **Cleanup**: Removed the PDF Export feature as requested.

## Future Development Suggestions

1. **Printable CSS Styling**: Since the PDF export button was removed, consider optimizing the CSS `@media print` styles. This would allow users to print pages directly from the browser (Cmd+P) with a clean, report-like look.
2. **Dark Mode Polish**: The site supports dark mode via Tailwind, but some custom colors (Royal Blue/Gold) might need adjustment for better contrast in dark environments.
3. **Image Optimization**: Implementing a blurred placeholder for large hero images would improve the perceived loading speed.
4. **Interactive Dashboard Filters**: Adding more granular filters (e.g., filter by completion status) to the Dashboard would help manage large sets of PA tasks.

---
*Last Updated: 2026-01-15*
