const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Not authorized, token missing");
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = "Not authorized, token invalid";
    next(error);
  }
};

module.exports = {
  protect
};
