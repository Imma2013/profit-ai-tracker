# Profit AI - Trading Screenshot Analysis App Architecture

This document outlines the architecture and implementation plan for building a web application that analyzes trading chart screenshots using Gemini AI, matching the "Profit AI" design from the provided screenshots.

## User Review Required

> [!IMPORTANT]
> Please review the following points before we begin execution:
> 1. **Project Location**: We will initialize the Next.js project directly inside the `alu.pics 11` folder. Is this correct, or would you prefer a new subfolder?
> 2. **Tailwind CSS vs Vanilla CSS**: The design requires a dark theme with specific glassmorphic cards and colors. Next.js defaults to Tailwind CSS, which is great for this. Should we proceed with Tailwind CSS?
> 3. **API Keys**: You will need to provide a Gemini API Key and Firebase project credentials as environment variables once we start building.

## Proposed Architecture & Stack

### 1. Frontend & Backend (Next.js)
- **Framework**: Next.js (App Router) for both the React frontend and the backend API.
- **UI/UX Design**: 
  - A sleek, dark-mode mobile-first design mirroring the screenshots.
  - Black backgrounds, rounded cards with dark grey/glassmorphic styling, and distinct accent colors (e.g., green for bullish, yellow for medium risk).
- **Core Views**:
  - **Capture View**: An interface to either use the device camera to snap a picture of a chart or upload an existing screenshot.
  - **Analysis View**: A dashboard displaying the Gemini AI results, including "Key Insights" (Trend, Signal, Risk, Volume), "Support/Resistance" levels, and a collapsible "Game Plan".
- **Backend API (`/api/analyze`)**: A secure API route that receives the uploaded image, constructs a prompt for the Gemini Vision model, and returns structured JSON containing the analysis.

### 2. Authentication & Database (Firebase)
- **Firebase Authentication**: For user sign-up and login.
- **Firestore Database**: To securely store user data, preferences (like Trading Experience and Style), and past analysis results.
- **Firebase CLI**: We will install the Firebase CLI (`npm install -g firebase-tools`) to initialize and manage Firebase configurations directly from the terminal.

### 3. Source Control & Hosting (GitHub + Vercel)
- **GitHub CLI (`gh`)**: We will use the GitHub CLI to create a new remote repository for the `alu.pics 11` folder and push our initial code.
- **Vercel CLI**: We will connect and deploy the application using the Vercel CLI for seamless hosting and CI/CD.

## Execution Steps (Once Approved)

1. **Repository Setup**: Initialize Git in `alu.pics 11` and use `gh repo create` to make the GitHub repo.
2. **Scaffold Next.js**: Run the Next.js setup command in the directory.
3. **CLI Tools**: Install and log into the Firebase CLI and Vercel CLI.
4. **UI Development**: Build the dark-theme UI components (Upload Screen, Analysis Dashboard).
5. **Integration**: Connect Firebase for Auth/DB and implement the Gemini API route.
6. **Deployment**: Deploy the live app to Vercel.

## Verification Plan

- Run `npm run dev` to verify the local development server.
- Test the image upload and Gemini API integration locally.
- Verify Firebase Authentication works.
- Confirm the GitHub repo exists and the Vercel deployment is successful and accessible via the public URL.
