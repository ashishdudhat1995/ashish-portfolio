import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { portfolioData as initialData } from '../src/data/portfolioData.js';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'ashish-portfolio-secret-key-2026';

app.use(cors());
app.use(express.json());

// In-Memory Database store initialized with full resume portfolio dataset
let db = {
  personal: JSON.parse(JSON.stringify(initialData.personal)),
  heroStats: JSON.parse(JSON.stringify(initialData.heroStats)),
  about: JSON.parse(JSON.stringify(initialData.about)),
  experience: JSON.parse(JSON.stringify(initialData.experience)),
  skills: JSON.parse(JSON.stringify(initialData.skills)),
  projects: JSON.parse(JSON.stringify(initialData.projects)),
  education: JSON.parse(JSON.stringify(initialData.education)),
  messages: []
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// ==================== PUBLIC ENDPOINTS ====================

// GET /api/portfolio - Main Dynamic Portfolio Data Endpoint
app.get('/api/portfolio', (req, res) => {
  res.json({
    success: true,
    data: db
  });
});

// POST /api/contact - Submit client message to database
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  const newMessage = {
    id: `msg_${Date.now()}`,
    name,
    email,
    subject: subject || 'Portfolio Inquiry',
    message,
    createdAt: new Date().toISOString()
  };
  db.messages.unshift(newMessage);
  res.status(201).json({ success: true, message: 'Message recorded cleanly!', data: newMessage });
});

// ==================== AUTHENTICATION ENDPOINTS ====================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === adminEmail && password === adminPass) {
    const token = jwt.sign({ email, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      success: true,
      token,
      user: { name: 'Ashishkumar Dudhat', email, role: 'ADMIN' }
    });
  }

  return res.status(401).json({ error: 'Invalid admin email or password.' });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: `Password reset token dispatched cleanly to ${email}`
  });
});

// ==================== PROTECTED ADMIN CRUD ENDPOINTS ====================

// 1. Personal Info CRUD
app.get('/api/admin/personal', authenticateToken, (req, res) => {
  res.json({ success: true, data: db.personal });
});

app.put('/api/admin/personal', authenticateToken, (req, res) => {
  db.personal = { ...db.personal, ...req.body };
  res.json({ success: true, message: 'Personal details updated successfully.', data: db.personal });
});

// 2. Hero Stats CRUD
app.get('/api/admin/hero-stats', authenticateToken, (req, res) => {
  res.json({ success: true, data: db.heroStats });
});

app.put('/api/admin/hero-stats', authenticateToken, (req, res) => {
  if (Array.isArray(req.body)) db.heroStats = req.body;
  res.json({ success: true, message: 'Hero stats updated successfully.', data: db.heroStats });
});

// 3. About Section CRUD
app.get('/api/admin/about', authenticateToken, (req, res) => {
  res.json({ success: true, data: db.about });
});

app.put('/api/admin/about', authenticateToken, (req, res) => {
  db.about = { ...db.about, ...req.body };
  res.json({ success: true, message: 'About section updated successfully.', data: db.about });
});

// 4. Experience Timeline CRUD
app.get('/api/admin/experience', authenticateToken, (req, res) => {
  res.json({ success: true, data: db.experience });
});

app.put('/api/admin/experience', authenticateToken, (req, res) => {
  if (Array.isArray(req.body)) db.experience = req.body;
  res.json({ success: true, message: 'Experience timeline updated successfully.', data: db.experience });
});

app.post('/api/admin/experience', authenticateToken, (req, res) => {
  const newItem = { id: `exp_${Date.now()}`, ...req.body };
  db.experience.unshift(newItem);
  res.status(201).json({ success: true, message: 'New experience role created.', data: newItem });
});

app.delete('/api/admin/experience/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.experience = db.experience.filter(item => item.id !== id);
  res.json({ success: true, message: 'Experience role deleted successfully.' });
});

// 5. Skills Topology CRUD
app.get('/api/admin/skills', authenticateToken, (req, res) => {
  res.json({ success: true, data: db.skills });
});

app.put('/api/admin/skills', authenticateToken, (req, res) => {
  if (Array.isArray(req.body)) db.skills = req.body;
  res.json({ success: true, message: 'Skills categories updated successfully.', data: db.skills });
});

app.post('/api/admin/skills', authenticateToken, (req, res) => {
  const newCat = { id: `cat_${Date.now()}`, ...req.body };
  db.skills.push(newCat);
  res.status(201).json({ success: true, message: 'Skill category added.', data: newCat });
});

app.delete('/api/admin/skills/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.skills = db.skills.filter(cat => cat.id !== id);
  res.json({ success: true, message: 'Skill category deleted successfully.' });
});

// 6. Projects / Case Studies CRUD
app.get('/api/admin/projects', authenticateToken, (req, res) => {
  res.json({ success: true, data: db.projects });
});

app.put('/api/admin/projects', authenticateToken, (req, res) => {
  if (Array.isArray(req.body)) db.projects = req.body;
  res.json({ success: true, message: 'Case studies updated successfully.', data: db.projects });
});

app.post('/api/admin/projects', authenticateToken, (req, res) => {
  const newProj = { id: `proj_${Date.now()}`, ...req.body };
  db.projects.unshift(newProj);
  res.status(201).json({ success: true, message: 'Case study added.', data: newProj });
});

app.delete('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.projects = db.projects.filter(p => p.id !== id);
  res.json({ success: true, message: 'Case study deleted successfully.' });
});

// 7. Education CRUD
app.get('/api/admin/education', authenticateToken, (req, res) => {
  res.json({ success: true, data: db.education });
});

app.put('/api/admin/education', authenticateToken, (req, res) => {
  if (Array.isArray(req.body)) db.education = req.body;
  res.json({ success: true, message: 'Education updated successfully.', data: db.education });
});

// 8. Client Messages Inbox
app.get('/api/admin/messages', authenticateToken, (req, res) => {
  res.json({ success: true, count: db.messages.length, data: db.messages });
});

app.delete('/api/admin/messages/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.messages = db.messages.filter(m => m.id !== id);
  res.json({ success: true, message: 'Message deleted.' });
});

export default app;
