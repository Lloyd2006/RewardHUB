# Loyalty & Reward App: A Step-by-Step Guide

This guide outlines the process of building a comprehensive loyalty and reward system, including a customer app, a cashier app, and an analytics dashboard.

## Table of Contents

1.  [System Architecture](#1-system-architecture)
2.  [Project Structure (Monorepo)](#15-project-structure-monorepo)
3.  [Backend Development (The Core Engine with Firebase)](#2-backend-development-the-core-engine-with-firebase)
    1.  [Step 2.1: Create Your Firebase Project and Database](#step-21-create-your-firebase-project-and-database)
    2.  [Step 2.2: Set Up the Backend Project](#step-22-set-up-the-backend-project)
    3.  [Step 2.3: Design the Firestore Data Model](#step-23-design-the-firestore-data-model)
    4.  [Step 2.4: How Collections are Created](#step-24-how-collections-are-created)
    5.  [Step 2.5: Build the API Endpoints with Firebase](#step-25-build-the-api-endpoints-with-firebase)
    6.  [Backend Application Structure (Code Organization)](#backend-application-structure-code-organization)
4.  [Customer App (React Native)](#3-customer-app-react-native)
5.  [Cashier App (React Native)](#4-cashier-app-react-native)
6.  [Analytics App (Web & Desktop)](#5-analytics-app-web--desktop)
7.  [Deployment](#6-deployment)
8.  [Next Steps & Considerations](#7-next-steps--considerations)

---

## 1. System Architecture

Our system will consist of four main components:

*   **Customer App (iOS & Android):** For users to manage their points and rewards.
*   **Cashier App (iOS & Android):** For staff to award points and redeem rewards.
*   **Analytics App (Web & Desktop):** For business owners to track the program's performance.
*   **Backend Server & Firebase:** A central API to handle business logic, with Firebase for authentication and database services.

Here's a high-level look at how they interact:

```
[Customer App] <--> [Backend API] <--> [Firebase]
[Cashier App]  <--> [Backend API] <--> [Firebase]
[Analytics App]<--> [Backend API] <--> [Firebase]
```

---

## 1.5. Project Structure (Monorepo)

For a project with multiple related applications like this one, it is highly recommended to organize them in a **monorepo**. A monorepo is a single repository that contains all your distinct-but-connected projects.

### Recommended Monorepo Structure

Here is the ideal folder structure for your entire loyalty and reward system:

```
/loyalty-reward-system/
|
|-- /packages/
|   |
|   |-- backend/
|   |   ├── src/
|   |   └── package.json
|   |
|   |-- customer-app/         # React Native App
|   |   ├── android/
|   |   ├── ios/
|   |   ├── src/
|   |   └── package.json
|   |
|   |-- cashier-app/          # React Native App
|   |   ├── android/
|   |   ├── ios/
|   |   ├── src/
|   |   └── package.json
|   |
|   |-- analytics-dashboard/  # React Web App
|   |   ├── src/
|   |   └── package.json
|   |
|   └── shared-types/         # Optional: For sharing TypeScript types
|       ├── index.ts
|       └── package.json
|
|-- .gitignore
|-- package.json              # The root package.json to manage workspaces
└── README.md
```

### Key Benefits

*   **Clear Separation:** Each application is a self-contained project, preventing them from interfering with each other.
*   **Easy Code Sharing:** The `shared-types` directory is a great example. You can define common data structures (like `User` or `Reward`) here and use them across your backend and frontend apps to ensure consistency.
*   **Simplified Management:** Using **npm/yarn/pnpm workspaces**, you can install dependencies for all projects with a single command from the root directory.

---

## 2. Backend Development (The Core Engine with Firebase)

The backend is the heart of your application. We'll use a **Node.js** server with the **Express.js** framework and **Firebase** for our database and authentication.

### Step 2.1: Create Your Firebase Project and Database

1.  **Go to the Firebase Console** at [console.firebase.google.com](https://console.firebase.google.com/).
2.  **Add a new project** or select an existing one.
3.  **Create the Firestore Database:**
    *   In the left menu (under "Build"), click **Firestore Database**.
    *   Click **Create database**.
    *   Select **Start in production mode**. This is crucial for security.
    *   Choose a **location** for your database (pick one close to your users). This cannot be changed later.
    *   Click **Enable**.
4.  **Enable Authentication:**
    *   In the left menu (under "Build"), click **Authentication**.
    *   Go to the **Sign-in method** tab.
    *   Click on **Email/Password** and enable it.
5.  **Get Your Admin Credentials:**
    *   Click the gear icon next to "Project Overview" in the top-left and select **Project settings**.
    *   Go to the **Service Accounts** tab.
    *   Click **Generate new private key**. A JSON file will be downloaded. Keep this file secure and private!

### Step 2.2: Set Up the Backend Project

1.  In your `backend` directory from the monorepo, initialize a Node.js project: `npm init -y`
2.  Install necessary packages:
    ```bash
    npm install express firebase-admin cors dotenv
    npm install -D nodemon
    ```
3.  Move the downloaded service account JSON file into this directory (e.g., as `serviceAccountKey.json`).
4.  Initialize the Firebase Admin SDK in your main server file (e.g., `index.js`):
    ```javascript
    const admin = require("firebase-admin");
    const serviceAccount = require("./serviceAccountKey.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();
    ```

### Step 2.3: Design the Firestore Data Model

This is the blueprint for the data your code will create.

*   **`users` collection:** Stores user-specific data.
    *   **Document ID:** `firebase_auth_uid`
    *   **Fields:** `email` (String), `points` (Number), `qr_code` (String), `createdAt` (Timestamp).
*   **`rewards` collection:** Stores available rewards.
    *   **Document ID:** Auto-generated.
    *   **Fields:** `name` (String), `description` (String), `points_cost` (Number), `is_active` (Boolean).
*   **`transactions` collection:** A log of all points activity.
    *   **Document ID:** Auto-generated.
    *   **Fields:** `userId` (String), `type` (String: "EARNED" or "REDEEMED"), `points` (Number), `createdAt` (Timestamp).

### Step 2.4: How Collections are Created

In Firestore, you don't pre-define your database structure. Collections are created automatically when you first add a document to them. This will happen programmatically through your API.

*   **`users` Collection:** A new document is added to this collection by your backend code every time a new user registers through your customer app.
*   **`rewards` Collection:** You can populate this collection initially by manually adding documents in the Firebase Console. For long-term use, you should build a secure admin endpoint in your API to add/edit rewards.
*   **`transactions` Collection:** A new document is added to this collection by your backend code every time a cashier awards or redeems points.

### Step 2.5: Build the API Endpoints with Firebase

You'll still use Express.js to create the API routes, but the logic inside them will use the Firebase Admin SDK to interact with Firestore.

*   **Authentication:** Leverage Firebase Authentication on the client-side (your mobile apps) to handle sign-up and login. The client then sends a Firebase ID Token to your backend with each request.
*   **Middleware:** Create a middleware for your Express app that verifies this ID token on incoming requests to protect your endpoints.
*   **API Logic:** Your endpoint controllers will use `db.collection('...')...` to perform actions on the database.

### Backend Application Structure (Code Organization)

It's crucial to organize your backend code effectively. Here's a recommended structure:

```
loyalty-backend/
├── src/
│   ├── api/                 # Route definitions
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth and error handling
│   └── services/            # Firebase initialization
└── index.js                 # Main Express server file
```

### API Reference

Here is a summary of the available API endpoints:

#### Authentication

*   **`POST /api/auth/register`**

    Creates a new user.

    **Request Body:**

    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```

    **Example `curl` command:**

    ```bash
    curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "password123"}'
    ```

*   **`POST /api/auth/login`**

    Logs in a user and returns an ID token.

    **Request Body:**

    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```

    **Example `curl` command:**

    ```bash
    # Make sure to set the FIREBASE_WEB_API_KEY environment variable first
    curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "password123"}'
    ```

*   **`POST /api/auth/social-login`**

    Handles user login via social providers (Google, Apple). It receives an ID token from the client, verifies it, and creates a new user in Firestore if one doesn't already exist.

    **Request Body:**

    ```json
    {
      "idToken": "{idToken}"
    }
    ```

    **Example `curl` command:**

    ```bash
    # Replace {idToken} with the actual ID token from Google or Apple
    curl -X POST http://localhost:3000/api/auth/social-login -H "Content-Type: application/json" -d '{"idToken": "{idToken}"}'
    ```

#### Rewards

*   **`GET /api/rewards`**

    Retrieves a list of all available rewards.

    **Example `curl` command:**

    ```bash
    curl http://localhost:3000/api/rewards
    ```

*   **`POST /api/rewards` (Admin only)**

    Creates a new reward. Requires admin privileges.

    **Request Body:**

    ```json
    {
      "name": "Free Coffee",
      "description": "A free coffee of your choice",
      "points_cost": 100,
      "is_active": true
    }
    ```

*   **`PUT /api/rewards/:rewardId` (Admin only)**

    Updates an existing reward. Requires admin privileges.

    **Request Body:**

    ```json
    {
      "name": "Free Large Coffee",
      "points_cost": 120
    }
    ```

*   **`DELETE /api/rewards/:rewardId` (Admin only)**

    Deletes a reward. Requires admin privileges.

#### Transactions

*   **`POST /api/transactions/earn`**

    Awards a specified number of points to a user.

    **Request Body:**

    ```json
    {
      "userId": "{userId}",
      "points": 100
    }
    ```

    **Example `curl` command:**

    ```bash
    # Replace {userId} with an actual user ID
    curl -X POST http://localhost:3000/api/transactions/earn -H "Content-Type: application/json" -d '{"userId": "{userId}", "points": 100}'
    ```

*   **`POST /api/transactions/redeem`**

    Redeems a reward for a user.

    **Request Body:**

    ```json
    {
      "userId": "{userId}",
      "rewardId": "{rewardId}"
    }
    ```

    **Example `curl` command:**

    ```bash
    # Replace {userId} and {rewardId} with actual IDs
    curl -X POST http://localhost:3000/api/transactions/redeem -H "Content-Type: application/json" -d '{"userId": "{userId}", "rewardId": "{rewardId}"}'
    ```

#### Analytics

*   **`GET /api/analytics/summary`**

    Retrieves a summary of analytics data.

    **Example `curl` command:**

    ```bash
    curl http://localhost:3000/api/analytics/summary
    ```

**Key Principles:**

*   **Single Unified Backend:** All your frontend applications will interact with this one backend API.
*   **Role-Based Access Control (RBAC):** Use your auth middleware to check user roles (e.g., `customer`, `cashier`) from their token and protect endpoints accordingly.
*   **Clean Separation of Concerns:** This structure keeps your code organized and easy to maintain.

This app is for your customers.

### Step 3.1: Set Up the React Native Project

1.  **Set up your environment for React Native CLI.** Follow the official React Native documentation.
2.  Create a new project: `npx react-native init CustomerApp`
3.  Install necessary packages:
    ```bash
    npm install axios react-native-qrcode-svg @react-navigation/native @react-navigation/stack
    ```

### Step 3.2: Implement Core Features

*   **Authentication:**
    *   Create screens for Login and Sign Up.
    *   Use `axios` to call your backend's `/api/auth/register` and `/api/auth/login` endpoints.
    *   Store the returned JWT token securely on the device (e.g., using `react-native-keychain`).

*   **Home Screen:**
    *   After login, fetch the user's data from `/api/users/me`.
    *   Display the user's current `points` balance.
    *   Use the `react-native-qrcode-svg` library to display the QR code based on the `qr_code` data from the user profile.

*   **Rewards Screen:**
    *   Fetch the list of available rewards from `/api/rewards`.
    *   Display them in a list, showing the name, description, and points cost.

---

## 4. Cashier App (React Native)

This app is for your staff.

### Step 4.1: Set Up the React Native Project

1.  Create a new project: `npx react-native init CashierApp`
2.  Install necessary packages:
    ```bash
    npm install axios react-native-camera @react-navigation/native @react-navigation/stack
    ```

### Step 4.2: Implement Core Features

*   **Authentication:**
    *   Create a Login screen for cashiers. You might have a separate user role or login endpoint for them.

*   **QR Code Scanner:**
    *   Use `react-native-camera` to create a full-screen camera view.
    *   When a QR code is scanned, the library will return the data (the user's unique `qr_code` string).

*   **Transaction Flow:**
    1.  After scanning, use the QR code to fetch user data from `/api/users/qr/:qr_code`.
    2.  Display the user's name and point balance to the cashier.
    3.  Provide two main actions for the cashier:
        *   **Award Points:** An input field to enter the purchase amount and a button to call the `/api/transactions/earn` endpoint.
        *   **Redeem Reward:** A list of rewards the user can afford. Tapping a reward calls the `/api/transactions/redeem` endpoint.
    4.  Show a success or failure message after each transaction.

---

## 5. Analytics App (Web & Desktop)

This dashboard is for monitoring the loyalty program. We can build a single web application and then wrap it in **Electron** for desktop compatibility.

### Step 5.1: Set Up the Web App (React)

1.  Create a new React project: `npx create-react-app analytics-dashboard`
2.  Install necessary packages:
    ```bash
    npm install axios recharts
    ```
    *   **Recharts** is a great library for creating charts and graphs.

### Step 5.2: Build the Dashboard UI

*   Create a login page for business owners/admins.
*   The main dashboard page should fetch data from your `/api/analytics/summary` endpoint.
*   Use components from a UI library like **Material-UI** or **Ant Design** to create a professional-looking dashboard.
*   Display key metrics using **Recharts**:
    *   A line chart showing points earned over time.
    *   A bar chart showing the most redeemed rewards.
    *   Key performance indicators (KPIs) like "Total Users," "Total Points in Circulation," etc.

### Step 5.3: Package as a Desktop App (Electron)

1.  **Add Electron** to your web app project:
    ```bash
    npm install --save-dev electron electron-builder
    ```
2.  **Configure Electron** to load your React app. You'll need to create a main `electron.js` file.
3.  **Add scripts** to your `package.json` to build and package the desktop application for Windows and macOS.

---

## 6. Deployment

*   **Backend:**
    *   **Google Cloud Run (Recommended):** Ideal for your Node.js/Express app. Package your application in a Docker container and deploy it. It offers serverless scalability while letting you keep your existing Express server structure.
    *   **Google Cloud Functions:** If you prefer a more granular, function-per-endpoint approach, you can deploy your API logic as individual Cloud Functions, which integrate tightly with Firebase.
    *   **Vercel or Heroku:** Excellent choices for ease of deployment. You can deploy your Node.js application directly from your Git repository. While not as tightly integrated with Google Cloud as the above, they offer a great developer experience.
*   **Web App:** Host your React-based analytics dashboard on a static hosting service like **Netlify** or **Vercel**.
*   **Mobile Apps:** Follow the official guides for building and publishing your React Native apps to the **Apple App Store** and **Google Play Store**.

---

## 7. Key Concepts for a Production-Ready App

This section covers crucial concepts for taking your app from a prototype to a secure, engaging, and robust application.

### A. Deeper Dive into Security

Security is a layered process. You need to protect both your database directly and the API that sits in front of it.

**1. Firestore Security Rules: Your Database's Bodyguard**

These rules live on Google's servers and are the ultimate authority on who can access what. They are evaluated before any data is read or written. Your primary goal is to enforce the logic that users can only affect their own data.

Here is a practical example of what your `firestore.rules` file might look like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // The 'users' collection
    match /users/{userId} {
      // A user can READ their own document, but no one else's.
      allow read: if request.auth.uid == userId;

      // A user can CREATE their own user document when they sign up.
      allow create: if request.auth.uid == userId;

      // A user can NEVER update their own points. Only your backend can.
      allow update: if false;
    }

    // The 'rewards' collection
    match /rewards/{rewardId} {
      // Anyone who is logged in can read the list of rewards.
      allow read: if request.auth != null;

      // No one can write to the rewards list directly.
      allow write: if false;
    }

    // The 'transactions' collection
    match /transactions/{transactionId} {
      // A user can read the transactions that belong to them.
      allow read: if request.auth.uid == resource.data.userId;

      // No one can create new transaction records directly.
      allow create, update, delete: if false;
    }
  }
}
```

**2. API Input Validation: Your API's Gatekeeper**

Before you process any request in your backend, you must validate that the data is in the correct format. Using a library like `express-validator` in your Node.js backend is highly recommended.

```javascript
// In your cashier.routes.js file
const { body, validationResult } = require('express-validator');

router.post(
  '/earn',
  // Validation middleware
  body('userId').isString().notEmpty(),
  body('amount').isFloat({ gt: 0, lt: 1000 }), // Must be a number > 0 and < 1000

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, reject the request.
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, proceed with awarding points...
    awardPoints(req.body.userId, req.body.amount);
    res.status(200).send('Points awarded');
  }
);
```

### B. Deeper Dive into User Experience (Making it "Lovable")

**1. Real-time Updates with `onSnapshot`**

This is how you make your app feel alive and responsive. Instead of fetching data once, you open a listener that updates your app's UI instantly when data changes in the database.

Here’s how you would implement this in a React Native customer app:

```javascript
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase-config'; // Your Firebase setup

function UserPoints() {
  const [points, setPoints] = useState(0);
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const userDocRef = doc(db, 'users', userId);

    // Attach the real-time listener
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setPoints(doc.data().points);
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [userId]);

  return <Text>Your Points: {points}</Text>;
}
```

**2. Push Notifications with Firebase Cloud Messaging (FCM)**

The best way to handle this is with **Cloud Functions**. A Cloud Function can trigger automatically when an event happens, like a new transaction being created.

**Workflow:**
1.  **Trigger:** A new document is created in the `transactions` collection.
2.  **Cloud Function Runs:** It reads the transaction data.
3.  **Logic:** It gets the user's push notification token from their profile.
4.  **Send:** It uses the FCM API to send a notification (e.g., "You just earned 50 points!") to that user's device.

### C. Deeper Dive into Analytics

**1. From Data to Decisions**

*   **Funnel Analysis:** Track how many users view rewards vs. how many actually redeem them. A large drop-off might indicate the process is too confusing.
*   **A/B Testing:** Use Firebase A/B Testing to experiment. For example, test two different point costs for the same reward to see which one performs better.

**2. Logging Custom Events**

To enable this kind of analysis, you need to log meaningful events from your app.

```javascript
import analytics from '@react-native-firebase/analytics';

// When a user successfully redeems a reward
async function onRedeem(reward) {
  // ... your redemption logic ...

  // Log a custom event to Firebase Analytics
  await analytics().logEvent('reward_redeemed', {
    reward_id: reward.id,
    reward_name: reward.name,
  });
}
```

### D. Deeper Dive into QR Codes

The QR code is just a secure key. The process should be simple and safe.

*   **Content:** The QR code should contain **only** the user's unique Firebase Authentication ID (`uid`). It is anonymous and stable.
*   **Process:**
    1.  **Customer App:** Renders the `uid` string as a QR code image.
    2.  **Cashier App:** Scans the QR code, which decodes back to the `uid` string.
    3.  **Backend:** The cashier app sends this `uid` to your backend API.
    4.  **Security:** The backend receives the `uid` and performs the action (e.g., adds points to that user's document). All important information (like the point balance) is fetched securely from your database by the backend, never from the QR code itself.
