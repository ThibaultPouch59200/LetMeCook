const express = require('express')
const router = express.Router()

router.post('/login', (req, res) => {
  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Password required' })
  }

  if (password === process.env.SITE_PASSWORD) {
    req.session.authenticated = true
    res.json({ success: true })
  } else {
    res.status(401).json({ error: 'Invalid password' })
  }
})

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' })
    }
    res.json({ success: true })
  })
})

router.get('/status', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) })
})

module.exports = router
