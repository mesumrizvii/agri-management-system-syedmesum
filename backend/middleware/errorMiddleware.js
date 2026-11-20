exports.notFound = (req, res) =>
  res.status(404).json({ succeeded: false, message: "Route not found", data: null });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let message = err.message || "Server error";
  if (err.code === "LIMIT_FILE_SIZE") message = "Photo is too large (max 1 MB)";
  res.status(err.status || 400).json({ succeeded: false, message, data: null });
};
