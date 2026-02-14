# Premium Auth Web Application

A full-stack web application featuring a premium Login/Sign-up interface with a Node.js Express backend and SQLite database.

## 🚀 Features

- **Premium UI**: Modern gradients, glassmorphism, and smooth animations using Styled-like CSS.
- **Dynamic Auth**: Toggle between Login and Sign-up modes.
- **Secure Backend**: Password hashing via `bcryptjs`.
- **Lightweight DB**: User data stored in a portable SQLite database.
- **RBAC Ready**: Supports `fullname`, `email`, `password`, and `role` fields.

## 🛠️ Project Structure

```text
├── client/          # Vite + React Frontend
│   └── src/         # UI Components and Logic
├── server/          # Node.js Express Backend
│   ├── index.js     # API Endpoints
│   └── database.js  # SQLite Setup
└── .gitignore       # Git ignore rules
```

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Setup Backend
```bash
cd server
npm install
```

### 3. Setup Frontend
```bash
cd ../client
npm install
```

## 🏃 Running the Application

### Start the Backend
Navigate to the `server` directory and run:
```bash
npm start
```
The server will start on `http://localhost:5000`.

### Start the Frontend
Navigate to the `client` directory and run:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🧪 Testing

1. Go to `http://localhost:5173`.
2. Click **Sign Up** to create a user.
3. Choose a role (User, Admin, etc.).
4. Log in with your new credentials to view the **Home** dashboard.
