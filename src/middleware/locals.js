module.exports = function locals(req, res, next) {
  res.locals.isAdmin = Boolean(req.session.isAdmin);
  res.locals.cartCount = Object.values(req.session.cart || {})
    .reduce((count, quantity) => count + Number(quantity || 0), 0);
  res.locals.currentPath = req.path;
  next();
};
