const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const c = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { succeeded: false, message: "Too many attempts, try later", data: null },
});

router.post("/register", c.register); // signup (public)
router.post("/login", loginLimiter, c.login); // login (public)
router.post("/logout", protect, c.logout);
router.get("/me", protect, c.me);
router.post("/change-password", protect, c.changePassword);

router.get("/", protect, authorize("admin"), c.getAllUsers);
router.post("/", protect, authorize("admin"), c.createUser);
router.get("/:id", protect, authorize("admin"), c.getUser);
router.put("/:id", protect, authorize("admin"), c.updateUser);
router.delete("/:id", protect, authorize("admin"), c.removeUser);

module.exports = router;
