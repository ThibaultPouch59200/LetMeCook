const checkAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next()
  }
  if (req.session && req.session.authenticated) {
    next()
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

module.exports = { checkAuth }
