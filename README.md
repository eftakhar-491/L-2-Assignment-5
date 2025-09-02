# 🚕 Ride-Sharing Service API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

---

## 📝 Summary

A robust backend API for a modern ride-sharing platform. Built with Node.js, Express, and TypeScript, it provides a complete solution for managing users, drivers, and the entire ride lifecycle. Key features include role-based access control, secure authentication with JWT and Google OAuth, real-time status updates, and comprehensive ride management functionalities.

## ✨ Key Features

- **User Management**: User registration, login (credentials & Google), and profile management.
- **Role-Based Access Control (RBAC)**: Differentiates between `RIDER`, `DRIVER`, and `ADMIN` roles with specific permissions.
- **Ride Lifecycle Management**: Requesting rides, price calculation, ride acceptance/cancellation, and detailed ride history.
- **Driver Operations**: Drivers can manage their availability, view nearby ride requests, and track their earnings.
- **Enhanced Security**: JWT-based authentication, refresh tokens, OTP verification, and secure password management (change, set, forgot, reset).

---

## 🚀 Project Setup

Follow these steps to get the project up and running on your local machine.

#### Prerequisites

- Node.js (v18 or higher recommended)
- NPM
- MongoDB instance (local or cloud)

#### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/eftakhar-491/L-2-Assignment-5.git
    cd l-2-assignment-5
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file.

    ```bash
    cp .env.example .env
    ```

    > **Note:** Open the newly created `.env` file and fill in all the required values as shown in the section below.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The server will start on the port specified in your `.env` file (default is `5000`).

---

## 🔑 Environment Variables

Create a `.env` file in the project root and add the following variables:

```env
PORT=5000
DB_URL=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
NODE_ENV=development

# BCRYPT
BCRYPT_SALT_ROUND=12

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES=7d

# SUPER ADMIN
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=supersecretpassword

# FRONTEND
FRONTEND_URL=http://localhost:3000

# GOOGLE OAUTH
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# EXPRESS SESSION
EXPRESS_SESSION_SECRET=your-session-secret

# SMTP (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_FROM=your-email@gmail.com

# GEOCODING API
GEO_API_KEY=your-geo-api-key

# REDIS
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
```

---

```
#Api Testing : https://github.com/eftakhar-491/L-2-Assignment-5/blob/main/Rido%20Service%20API.postman_collection.json

```

## Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication (`/auth`)

| Method | Endpoint           | Description                                            | Access Control             |
| :----- | :----------------- | :----------------------------------------------------- | :------------------------- |
| `POST` | `/login`           | Logs in a user with credentials.                       | Public                     |
| `GET`  | `/refresh-token`   | Generates a new access token via refresh token.        | Public (Cookie)            |
| `POST` | `/logout`          | Logs out the user by clearing cookies.                 | Authenticated              |
| `POST` | `/change-password` | Allows an authenticated user to change their password. | Authenticated              |
| `POST` | `/set-password`    | Allows a user to set their password.                   | Authenticated              |
| `POST` | `/forgot-password` | Initiates the password reset process via email.        | Public                     |
| `POST` | `/reset-password`  | Resets password using a token from the email.          | Authenticated (Temp Token) |
| `GET`  | `/google`          | Initiates Google OAuth2 login.                         | Public                     |
| `GET`  | `/google/callback` | Callback URL for Google OAuth.                         | Public                     |

### User (`/user`)

| Method  | Endpoint     | Description                                       | Access Control |
| :------ | :----------- | :------------------------------------------------ | :------------- |
| `POST`  | `/register`  | Creates a new user (typically a `RIDER`).         | Public         |
| `GET`   | `/all-users` | Retrieves a list of all users.                    | `ADMIN`        |
| `GET`   | `/me`        | Gets the profile of the currently logged-in user. | Authenticated  |
| `GET`   | `/:id`       | Retrieves a single user by their ID.              | `ADMIN`        |
| `PATCH` | `/:id`       | Updates a user's profile information.             | Authenticated  |

### OTP (`/otp`)

| Method | Endpoint            | Description                                    | Access Control |
| :----- | :------------------ | :--------------------------------------------- | :------------- |
| `POST` | `/email-otp-send`   | Sends a One-Time Password to the user's email. | Public         |
| `POST` | `/email-otp-verify` | Verifies the OTP sent to the user's email.     | Public         |

### Ride (`/ride`)

| Method  | Endpoint                           | Description                                         | Access Control             |
| :------ | :--------------------------------- | :-------------------------------------------------- | :------------------------- |
| `POST`  | `/price-and-details`               | Calculates estimated price and distance for a ride. | `RIDER`, `ADMIN`           |
| `POST`  | `/request-ride`                    | A rider requests a new ride.                        | `RIDER`, `ADMIN`           |
| `PATCH` | `/ride-accept/:rideId`             | A driver accepts a ride request.                    | `DRIVER`, `ADMIN`          |
| `PATCH` | `/ride-cancel/:rideId`             | Cancels a ride.                                     | `RIDER`, `DRIVER`, `ADMIN` |
| `PATCH` | `/ride-picked-up-otp-send/:rideId` | Driver confirms pickup and sends OTP to rider.      | `DRIVER`, `ADMIN`          |
| `PATCH` | `/ride-otp-verify/:rideId`         | Rider verifies OTP to confirm ride start.           | `RIDER`, `ADMIN`           |
| `PATCH` | `/ride-complete/:rideId`           | Driver marks the ride as complete.                  | `DRIVER`, `ADMIN`          |
| `GET`   | `/ride-history/:rideId`            | Retrieves the history of a specific ride.           | `RIDER`, `DRIVER`, `ADMIN` |
| `GET`   | `/all-rides`                       | Retrieves all rides in the system.                  | `ADMIN`                    |
| `GET`   | `/rider-past-ride`                 | Gets past rides for the logged-in rider.            | `RIDER`                    |

### Driver (`/driver`)

| Method | Endpoint                    | Description                                             | Access Control    |
| :----- | :-------------------------- | :------------------------------------------------------ | :---------------- |
| `GET`  | `/total-earnings/:driverId` | Gets earnings history for a specific driver.            | `DRIVER`, `ADMIN` |
| `GET`  | `/my-rides`                 | Gets ride history for the logged-in driver.             | `DRIVER`          |
| `POST` | `/availability-status`      | Updates the driver's availability (`ONLINE`/`OFFLINE`). | `DRIVER`          |
| `POST` | `/get-driver-nearest-rides` | Fetches ride requests nearest to the driver.            | `DRIVER`          |

# Finaly

This Ride-Sharing Service API is designed to be a scalable and secure foundation for modern ride-sharing applications.
With robust role-based access control, real-time ride lifecycle management, and secure authentication mechanisms, it ensures that riders, drivers, and admins can interact seamlessly within the platform.
