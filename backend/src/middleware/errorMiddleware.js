const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500;

  if (statusCode === 200) {
    res.status(500);
  } else {
    res.status(statusCode);
  }

  res.json({
    success: false,
    message: err.message || "Internal server error"
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
