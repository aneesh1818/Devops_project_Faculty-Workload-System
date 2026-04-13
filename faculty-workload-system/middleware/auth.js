// Middleware: Check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Middleware: Check if user is admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Access denied. Admin only.' });
}

// Middleware: Check if admin or HOD
function isAdminOrHOD(req, res, next) {
  if (req.session && req.session.user &&
      ['admin', 'hod'].includes(req.session.user.role)) {
    return next();
  }
  res.status(403).json({ error: 'Access denied. Admin or HOD only.' });
}

// Middleware: Attach user to res.locals for templates
function attachUser(req, res, next) {
  res.locals.user = req.session.user || null;
  next();
}

module.exports = { isAuthenticated, isAdmin, isAdminOrHOD, attachUser };
