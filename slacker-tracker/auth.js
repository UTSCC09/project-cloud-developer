const isAuthenticated = (req, res, next) => {
    if(!req.session.user) return res.status(401).json({message: "access denied"});
    next();
}

exports.isAuthenticated = isAuthenticated;