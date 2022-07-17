module.exports = {
  isAuthenticated: (req, res, next) => {
    console.log('isAuthenticated', req.session)
    if (!req.session.user) return res.status(401).json({ message: 'access denied' })
    next()
  }
}
