# My Proxy

My Proxy is a local task marketplace and community-based service app where users can post small jobs, receive bids from nearby helpers, communicate in-app, and complete tasks with secure payments and reputation tracking.

The application is built with React, Vite, Firebase, and Zustand, and it includes PWA support for installable mobile-like behavior.

## Overview

This project is designed for a simple workflow:

1. A user posts a task with a budget, category, and location.
2. Nearby users can browse and bid on tasks.
3. The task poster reviews bids and chooses the right helper.
4. The task is completed, payment is released, and both users are rated.

The app includes pages for authentication, task management, chat, notifications, wallet, referrals, and analytics.

## Key Features

- Task posting and discovery
- Local matching and bidding system
- Real-time task feed and category browsing
- User authentication with Firebase Auth
- Firestore-powered data storage
- In-app messaging and notifications
- Wallet and payment flow screens
- Referral tracking
- Analytics dashboard
- Dark mode and multilingual-ready UI
- PWA installability and background notification support

## Tech Stack

- React 19
- Vite 8
- Firebase (Authentication, Firestore, Storage, Messaging)
- React Router DOM
- Zustand for state management
- Tailwind CSS
- Lucide React icons
- date-fns for date formatting
- Vite PWA plugin

## Project Structure

```text
my-proxy/
├── firebase.json
├── firestore.rules
├── index.html
├── package.json
├── README.md
├── vite.config.js
├── public/
│   ├── firebase-messaging-sw.js
│   ├── manifest.json
│   └── icons/
├── scripts/
│   ├── addDemoTasks.js
│   ├── generate-icons.mjs
│   └── seedCategories.js
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── ChatBot.jsx
│   │   ├── Layout.jsx
│   │   ├── PaymentModal.jsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── useFCM.js
│   │   └── useFirestore.js
│   ├── lib/
│   │   ├── autoSeed.js
│   │   ├── firebase.js
│   │   ├── taskMatching.js
│   │   └── translations.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── LandingPage.jsx
│   │   ├── Notifications.jsx
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── messages/
│   │   ├── profile/
│   │   ├── referrals/
│   │   ├── tasks/
│   │   └── wallet/
│   └── store/
│       ├── authStore.js
│       ├── darkModeStore.js
│       └── languageStore.js
└── .gitignore
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+
- npm or yarn
- A Firebase project
- A configured Firestore database
- Firebase Authentication enabled
- Firebase Cloud Messaging enabled if using push notifications

## Environment Setup

Create a `.env` file in the project root and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

These values are used in `src/lib/firebase.js` when initializing Firebase.

## Installation

```bash
npm install
```

## Running the App

### Development

```bash
npm run dev
```

The app will run on the Vite default port, usually:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Firebase Setup Notes

This project expects Firebase services to be configured, including:

- Authentication
- Firestore
- Cloud Storage
- Cloud Messaging

The project also contains `firebase.json` and `firestore.rules`, which are used for Firebase hosting and Firestore access rules.

## Available App Flows

- Landing page with marketing content and CTA
- Login / signup flow
- Feed with task listings and category filtering
- Post task form
- Task detail page
- My tasks and my bids pages
- Messaging / chat pages
- Profile and wallet management
- Notifications center
- Referrals and analytics screens

## PWA Support

The app has a PWA configuration in `vite.config.js`, enabling:

- installable app behavior
- service worker setup
- offline-friendly asset caching
- Firebase storage cache handling

## Scripts

The project includes these scripts from `package.json`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- The app uses Firestore real-time queries with custom hooks.
- Some features rely on seeded demo data and category data.
- FCM notifications are only enabled when browser permission is granted.
- The app is intended for a local task marketplace use case, similar to gig or errands platforms.

## License

This project does not include a license file yet. If you plan to share or distribute it publicly, add a license before production release.

## Future Improvements

Possible enhancements include:

- stricter payment validation flow
- real escrow logic
- richer user reviews and trust scoring
- admin dashboard
- geolocation and map integration
- improved notification and chat system reliability

## Contributing

To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## Contact

Project name: My Proxy

This application is intended as a local service marketplace prototype or MVP for task-based community work.

