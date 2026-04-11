const fs = require('fs');
const path = require('path');

const dirs = [
  'api/controllers', 'api/models', 'api/routes', 'api/middleware',
  'src/components', 'src/pages/Auth', 'src/context', 'src/utils'
];

dirs.forEach(d => fs.mkdirSync(path.join(__dirname, d), { recursive: true }));

const files = {
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DreamConnect - Premium Goal Tracking</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)`,
  'src/App.jsx': `import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Explore from './pages/Explore';
import DreamWall from './pages/DreamWall';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Contact from './pages/Contact';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/wall" element={<DreamWall />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;`,
  'src/index.css': `/* CSS Variables */
:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --secondary: #ec4899;
  --background: #0f172a;
  --surface: rgba(30, 41, 59, 0.7);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glass-backdrop: blur(10px);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--background);
  color: var(--text-main);
  min-height: 100vh;
  background-image: 
    radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
    radial-gradient(at 50% 0%, hsla(225,39%,30%,0.2) 0, transparent 50%), 
    radial-gradient(at 100% 0%, hsla(339,49%,30%,0.2) 0, transparent 50%);
  background-attachment: fixed;
}
.app-container { display: flex; flex-direction: column; min-height: 100vh; }
.main-content { flex: 1; padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; margin-top: 80px; }
.glass {
  background: var(--surface); backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop); border: 1px solid var(--border);
  box-shadow: var(--glass-shadow); border-radius: 12px;
}
.btn {
  background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem;
  border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none;
}
.btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
.btn-secondary { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); box-shadow: none; }
h1, h2, h3, h4 { color: var(--text-main); margin-bottom: 1rem; }
p { color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem; }
input, textarea, select {
  width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border);
  color: var(--text-main); padding: 0.75rem 1rem; border-radius: 8px; outline: none; transition: border-color 0.3s ease;
  font-family: inherit; font-size: 1rem;
}
input:focus, textarea:focus { border-color: var(--primary); }
`,
  'src/components/Navbar.jsx': `import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar glass">
      <div className="nav-brand"><Link to="/">DreamConnect</Link></div>
      <div className="nav-links">
        <Link to="/explore">Explore</Link>
        <Link to="/community">Community</Link>
        <Link to="/contact">About</Link>
        {user ? (
          <>
            <Link to="/wall">My Wall</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={logout} className="btn btn-secondary nav-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary nav-btn">Login</Link>
            <Link to="/signup" className="btn nav-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}`,
  'src/components/Navbar.css': `.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 2rem; border-radius: 0; border-top: none; border-left: none; border-right: none;
}
.nav-brand a { font-size: 1.5rem; font-weight: 700; color: white; text-decoration: none; background: linear-gradient(to right, #ec4899, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 1.5rem; align-items: center; }
.nav-links a { color: var(--text-main); text-decoration: none; font-weight: 500; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary); }
.nav-btn { padding: 0.5rem 1rem; }`,
  'src/context/AuthContext.jsx': `import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/users/profile', { headers: { Authorization: \`Bearer \${token}\` } })
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};`,
  'api/index.js': `const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const dreamRoutes = require('./routes/dreams');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.send('API is running'));

// Only start server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dreamconnect')
    .then(() => console.log('MongoDB local connected'))
    .catch(err => console.error(err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
} else {
  // Wait for mongoose connection on Vercel
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Atlas connected'))
    .catch(err => console.error(err));
}

module.exports = app;`,
  'api/models/User.js': `const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);`,
  'api/routes/auth.js': `const express = require('express');
const router = express.Router();
router.post('/login', (req,res) => res.json({message: "Login placeholder"}));
router.post('/signup', (req,res) => res.json({message: "Signup placeholder"}));
module.exports = router;`,
  'api/routes/dreams.js': `const express = require('express');
const router = express.Router();
router.get('/', (req,res) => res.json([]));
module.exports = router;`,
  'api/routes/users.js': `const express = require('express');
const router = express.Router();
router.get('/profile', (req,res) => res.json({message: "Profile placeholder"}));
module.exports = router;`
};

['Home', 'Explore', 'DreamWall', 'Community', 'Profile', 'Contact'].forEach(page => {
  files[`src/pages/${page}.jsx`] = `export default function ${page}() { return <div className="glass" style={{padding: '2rem'}}><h1>${page}</h1><p>Welcome to ${page}</p></div>; }`;
});
['Login', 'Signup'].forEach(page => {
  files[`src/pages/Auth/${page}.jsx`] = `export default function ${page}() { return <div className="glass" style={{padding: '2rem', maxWidth: '400px', margin: '0 auto'}}><h1>${page}</h1><p>Auth page</p></div>; }`;
});

for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, file), content);
}
console.log('Boilerplate created successfully!');
