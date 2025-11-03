# RewardHUB: Loyalty & Reward App

This project is a comprehensive loyalty and reward system, including a customer app, a cashier app, and an analytics dashboard, all organized within a monorepo structure.

## Table of Contents

1.  [System Architecture](#system-architecture)
2.  [Project Structure (Monorepo)](#project-structure-monorepo)
3.  [Backend Development (The Core Engine with Firebase)](#backend-development-the-core-engine-with-firebase)
    *   [Step 2.1: Create Your Firebase Project and Database](#step-21-create-your-firebase-project-and-database)
    *   [Step 2.2: Set Up the Backend Project](#step-22-set-up-the-backend-project)
4.  [Customer App (React Native)](#customer-app-react-native)
5.  [Cashier App (React Native)](#cashier-app-react-native)
6.  [Analytics App (Web & Desktop)](#analytics-app-web--desktop)
7.  [Deployment](#deployment)
8.  [Next Steps & Considerations](#next-steps--considerations)

---

## System Architecture

Our system consists of four main components:

*   **Customer App (iOS & Android):** For users to manage their points and rewards.
*   **Cashier App (iOS & Android):** For staff to award points and redeem rewards.
*   **Analytics App (Web & Desktop):** For business owners to track the program's performance.
*   **Backend Server & Firebase:** A central API to handle business logic, with Firebase for authentication and database services.

```
[Customer App] <--> [Backend API] <--> [Firebase]
[Cashier App]  <--> [Backend API] <--> [Firebase]
[Analytics App]<--> [Backend API] <--> [Firebase]
```

---

## Project Structure (Monorepo)

This project is organized as a **monorepo** for clear separation, easy code sharing, and simplified management using npm/yarn/pnpm workspaces.

```
/loyalty-reward-system/
|-- /packages/
|   |-- backend/              # Node.js/Express.js backend with Firebase Admin SDK
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

---

## Backend Development (The Core Engine with Firebase)

The backend is built with a **Node.js** server using the **Express.js** framework and **Firebase** for database and authentication.

### Step 2.1: Create Your Firebase Project and Database

(Summary of Firebase project setup, Firestore database creation, authentication enabling, and admin credentials retrieval.)

### Step 2.2: Set Up the Backend Project

The backend project has been initialized in `packages/backend`. Necessary packages (`express`, `firebase-admin`, `cors`, `dotenv`, `nodemon`) have been installed. The Firebase Admin SDK has been initialized in `packages/backend/src/index.js` using `serviceAccountKey.json`.

### API Documentation

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

*   **`POST /api/auth/login`**

    Logs in a user and returns an ID token.

    **Request Body:**

    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```

*   **`POST /api/auth/social-login`**

    Handles user login via social providers (Google, Apple).

    **Request Body:**

    ```json
    {
      "idToken": "{idToken}"
    }
    ```

#### Rewards

*   **`GET /api/rewards`**

    Retrieves a list of all available rewards.

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

*   **`POST /api/transactions/redeem`**

    Redeems a reward for a user.

    **Request Body:**

    ```json
    {
      "userId": "{userId}",
      "rewardId": "{rewardId}"
    }
    ```

#### Analytics

*   **`GET /api/analytics/summary`**

    Retrieves a summary of analytics data.

---

## Customer App (React Native)

(Details will be added here as development progresses.)

---

## Cashier App (React Native)

(Details will be added here as development progresses.)

---

## Analytics App (Web & Desktop)

(Details will be added here as development progresses.)

---

## Deployment

(Details will be added here as development progresses.)

---

## Next Steps & Considerations

(Details will be added here as development progresses.)