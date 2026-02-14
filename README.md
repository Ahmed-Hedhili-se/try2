# Premium Admin Auth & Approval Web App

A sophisticated full-stack web application featuring a premium React frontend, a secure Node.js Express backend, and a complete administrative approval workflow.

## 🌟 Key Features

### 💎 User Experience
- **Premium UI**: Modern gradients, glassmorphism, and smooth transitions built with custom CSS.
- **Dynamic Auth**: Seamless switching between Login and Sign-up modes.
- **City Tracking**: Automatically captures and displays user city (`ville`).

### 🛠️ Administrative & Analysis Tools
- **Admin Dashboard**: Dedicated management interface at `/admin.html`.
- **Analyse Reports**: Premium visualization interface at `/analyse.html` for tracking all signalisations.
- **Approval Workflow**: New accounts are created as `Pending` and must be approved by an administrator before they can log in.
- **User Management**: Admins can approve, edit profile details (Name, Role, City), or delete users directly from the dashboard.

### 🔐 Security & Data
- **RBAC Logic**: Robust Role-Based Access Control filtering features and API access.
- **Session Bridge**: Built-in synchronization between React (port 5173) and static pages (port 5000).
- **Password Hashing**: Secure storage using `bcryptjs`.
- **SQLite Database**: Lightweight, portable, and efficient data management.

---

## 🏗️ Project Structure

```text
├── client/          # vite + React Frontend
│   ├── src/         # UI Components and state logic
│   └── index.css    # Premium CSS design system
├── server/          # Node.js Express Backend
│   ├── index.js     # API & Server Logic
│   ├── database.js  # SQLite Connection & Schema
│   ├── routes/      # API Route modules (admin.js, reports.js)
│   └── public/      # Static Assets (admin.html, analyse.html, dashboard.html)
└── .gitignore       # Git ignore rules
```

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies for both the server and client:

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Running Local Dev Servers
The application is designed to auto-open the admin interface on startup.

**Start the Backend:**
```bash
cd server
npm start
```
*The server runs on `http://localhost:5000` and will try to open `http://localhost:5000/admin.html` automatically.*

**Start the Frontend:**
```bash
cd client
npm run dev
```
*The React app runs on `http://localhost:5173`.*

---

## 🛠️ Troubleshooting

If you encounter "Cannot reach server" or other errors:

1.  **Check Backend**: Ensure the terminal running `npm start` in the `server` folder is still alive and showing no errors.
2.  **Verify Setup**: Ensure all dependencies are installed (`npm install`) and the database file (`database.sqlite`) exists.
3.  **Browser Console**: Press **F12** and check the **Console** tab for specific error messages (e.g., Connection Refused).

---

1.  **Sign Up**: Go to `http://localhost:5173`, choose a role (Mère SOS, etc.), and register.
2.  **Verify Pending**: Try to log in immediately—the app will inform you that your account is pending approval.
3.  **Approve Account**: Open the Admin Dashboard at `http://localhost:5000/admin.html`. Find your new user and click **Approve**.
4.  **Success**: Log in again from the main app. You should now be granted access to your home dashboard!

---

## 📋 Role & Permission Mapping

The system automatically handles permissions based on the chosen role:
- **Mère/Tante/Educatrice**: Assigned to `signalisation_other`.
- **Psychologues/Responsable Sociale**: Assigned to `signalisation_psy`.
- **Directeur/Bureau National**: Assigned to `see_all` (Managed manually).

---
*Built with ❤️ by Antigravity*
