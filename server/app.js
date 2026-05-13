require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const session = require('express-session')
const { checkAuth } = require('./middleware/auth')

const app = express()

app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'letmecook-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}))

// Auth routes (no auth needed)
app.use('/api/auth', require('./routes/auth'))

// Protected API routes
app.use('/api/ingredients', checkAuth, require('./routes/ingredients'))
app.use('/api/recipes', checkAuth, require('./routes/recipes'))
app.use('/api/cook-log', checkAuth, require('./routes/cookLog'))
app.use('/api/dashboard', checkAuth, require('./routes/dashboard'))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })
}

module.exports = app
