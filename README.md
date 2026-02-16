# SignalSafe - SOS Villages d'Enfants

**SignalSafe** is a comprehensive full-stack web application designed for the SOS Villages d'Enfants organization. It provides a secure, role-based platform for reporting, analyzing, and managing child protection signalisations across various villages (Gammarth, Akouda, Siliana, Mahres).

## 🌟 Key Features

### �️ Secure Reporting & Workflow
- **Role-Based Access Control (RBAC)**: Tailored dashboards and permissions for various roles:
  - **Mère SOS / Tante SOS / Educatrice**: Can submit initial signalisations.
  - **Psychologues / Responsable Sociale**: Dedicated analysis tools and report management.
  - **Directeur / Bureau National**: Strict oversight and analytical capabilities.
- **Village-Specific Logic**: Users are restricted to their assigned SOS Village, ensuring data privacy and relevance.
- **Secure Authentication**: Built with `bcryptjs` for password hashing and distinct login/signup flows.
- **Attachment Support**: Upload images, documents, and voice recordings securely.

### 💎 User Experience
- **Premium UI**: Crafted with a modern, responsive design featuring glassmorphism, smooth transitions, and distinct color codes for report statuses.
- **Real-time Feedback**: Interactive forms and modal views for seamless data entry and review.
- **Dynamic Dashboards**: Personalized views based on user roles (e.g., specific "My Signalisation" vs. "All Signalisation").

### � Data Integrity & Security
- **Restricted Deletion**: To maintain a complete audit trail, deletion of reports is strictly disabled for all users, including administrators.
- **Session bridging**: Synchronized user state between the React frontend and static HTML analysis pages.
- **SQLite Database**: Efficient, portable database solution for robust data management.

---

## 🛠️ Tech Stack

### Frontend
- **React**: For building dynamic, component-based user interfaces.
- **Vite**: Next-generation frontend tooling for fast builds and hot module replacement.
- **CSS**: Custom, premium styling (no reliance on heavy CSS frameworks).

### Backend
- **Node.js**: Asynchronous event-driven JavaScript runtime.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **SQLite3**: Self-contained, serverless, zero-configuration, transactional SQL database engine.
- **Multer**: Node.js middleware for handling `multipart/form-data` (file uploads).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/SignalSafe.git
    cd SignalSafe
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    # This installs: express, sqlite3, cors, bcryptjs, multer, nanoid, open
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../client
    npm install
    # This installs: react, react-dom, axios, vite
    ```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd server
    npm start
    ```
    *   The server will start on `http://localhost:5000`.
    *   It may automatically open the Admin Dashboard (`http://localhost:5000/admin.html`) in your browser.

2.  **Start the Frontend Development Server**
    Open a *new terminal window/tab* and run:
    ```bash
    cd client
    npm run dev
    ```
    *   The frontend will run on `http://localhost:5173`.
    *   Open this URL to access the main Login/Signup page.

---

## � Project Structure

```text
try2/
├── client/                 # React Frontend application
│   ├── src/                # UI Components, pages, and logic
│   │   ├── App.jsx         # Main application component & routing
│   │   ├── index.css       # Global styles & design system
│   │   └── main.jsx        # Entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── server/                 # Node.js Express Backend
│   ├── routes/             # API Route modules
│   │   ├── admin.js        # Admin endpoints
│   │   └── reports.js      # Signalisation & attachment logic
│   ├── public/             # Static HTML pages (Dashboards, Analysis)
│   │   ├── admin.html      # Admin User Management
│   │   ├── analyse.html    # Report Analysis Dashboard
│   │   ├── dashboard.html  # User Dashboard (Legacy/Static)
│   │   └── global_vue.html # Global Governance View
│   ├── uploads/            # Secure directory for uploaded files
│   ├── database.js         # SQLite connection & schema initialization
│   ├── index.js            # Main server entry & configuration
│   └── package.json        # Backend dependencies
│
├── requirements.txt        # Dependency summary
└── README.md               # Project documentation
```

---

## 📋 Role & Permission Mapping

The system enforces strict RBAC rules:

| Role | Access Level | Primary Dashboard |
| :--- | :--- | :--- |
| **Mère / Tante SOS** | **Submitter** | Main Dashboard (`/`) |
| **Educatrice** | **Submitter** | Main Dashboard (`/`) |
| **Psychologues** | **Analyst** | Analysis Dashboard (`/analyse.html`) |
| **Responsable Sociale** | **Analyst** | Analysis Dashboard (`/analyse.html`) |
| **Directeur** | **Reviewer** | Global View (Village Specific) |
| **Bureau National** | **Super Admin** | Global View (National Scope) |

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️*
