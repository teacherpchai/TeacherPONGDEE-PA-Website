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

This project is optimized for deployment on Vercel.

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
- **PDF**: jsPDF

---
*Created by Antigravity - 2026-01-14*
