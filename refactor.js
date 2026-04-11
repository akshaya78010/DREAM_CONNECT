const fs = require('fs');
const path = require('path');

const root = __dirname;
const frontend = path.join(root, 'frontend');
const backend = path.join(root, 'backend');

fs.mkdirSync(frontend, { recursive: true });
fs.mkdirSync(backend, { recursive: true });
fs.mkdirSync(path.join(backend, 'config'), { recursive: true });

const frontendFiles = ['src', 'index.html', 'vite.config.js'];
frontendFiles.forEach(f => {
  if (fs.existsSync(path.join(root, f))) {
    fs.renameSync(path.join(root, f), path.join(frontend, f));
  }
});

const backendFiles = {
  'api/index.js': 'app.js',
  'api/models': 'model',
  'api/controllers': 'controller',
  'api/routes': 'route',
  'api/middleware': 'middleware',
  '.env': '.env'
};

Object.entries(backendFiles).forEach(([src, dest]) => {
  const srcPath = path.join(root, src);
  if (fs.existsSync(srcPath)) {
    fs.renameSync(srcPath, path.join(backend, dest));
  }
});

if (fs.existsSync(path.join(root, 'api'))) {
  fs.rmSync(path.join(root, 'api'), { recursive: true, force: true });
}
if (fs.existsSync(path.join(root, 'vercel.json'))) {
  fs.rmSync(path.join(root, 'vercel.json'));
}

const replaceInFile = (file, replacer) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = replacer(content);
    fs.writeFileSync(file, content);
  }
};

const backendFolders = ['model', 'controller', 'route', 'middleware'];
backendFolders.forEach(folder => {
  const folderPath = path.join(backend, folder);
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath);
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    replaceInFile(filePath, (c) => {
      let next = c;
      next = next.replace(/\.\.\/models/g, '../model');
      next = next.replace(/\.\.\/controllers/g, '../controller');
      next = next.replace(/\.\.\/routes/g, '../route');
      return next;
    });
  });
});

const dbContent = `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dreamconnect');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;`;
fs.writeFileSync(path.join(backend, 'config', 'db.js'), dbContent);

const cleanAppJs = `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const authRoutes = require('./route/auth');
const dreamRoutes = require('./route/dreams');
const userRoutes = require('./route/users');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));

module.exports = app;`;
fs.writeFileSync(path.join(backend, 'app.js'), cleanAppJs);

const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const frontendPkg = {
  name: "dreamconnect-frontend",
  version: "1.0.0",
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview"
  },
  dependencies: {
    axios: rootPkg.dependencies.axios,
    react: rootPkg.dependencies.react,
    "react-dom": rootPkg.dependencies["react-dom"],
    "react-router-dom": rootPkg.dependencies["react-router-dom"]
  },
  devDependencies: rootPkg.devDependencies
};

const backendPkg = {
  name: "dreamconnect-backend",
  version: "1.0.0",
  main: "app.js",
  scripts: {
    start: "node app.js",
    dev: "node app.js"
  },
  dependencies: {
    bcryptjs: rootPkg.dependencies.bcryptjs,
    cors: rootPkg.dependencies.cors,
    dotenv: rootPkg.dependencies.dotenv,
    express: rootPkg.dependencies.express,
    jsonwebtoken: rootPkg.dependencies.jsonwebtoken,
    mongoose: rootPkg.dependencies.mongoose
  }
};

fs.writeFileSync(path.join(frontend, 'package.json'), JSON.stringify(frontendPkg, null, 2));
fs.writeFileSync(path.join(backend, 'package.json'), JSON.stringify(backendPkg, null, 2));

const orchestratorPkg = {
  name: "dreamconnect-root",
  scripts: {
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "install:all": "cd frontend && npm install && cd ../backend && npm install"
  }
};
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(orchestratorPkg, null, 2));

console.log("Refactoring complete");
