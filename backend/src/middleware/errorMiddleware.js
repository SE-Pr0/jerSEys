const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Uploaded design data is too large. Try a smaller logo/image or simplify the customization."
    });
  }

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
