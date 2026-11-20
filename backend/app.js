const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const { sequelize } = require("./models/associations");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // allow images to load in React
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/images", express.static(path.join(__dirname, "public/Images")));

app.get("/api/health", (req, res) => res.json({ succeeded: true, message: "API is running" }));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/buyers", require("./routes/buyerRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/activity", require("./routes/activityRoutes")); // GET only (+ admin delete)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT_NAME || 5000;
sequelize
  .authenticate()
  .then(() => sequelize.sync({ alter: true })) // creates / updates all tables automatically
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch((e) => console.error("Startup failed:", e.message));
