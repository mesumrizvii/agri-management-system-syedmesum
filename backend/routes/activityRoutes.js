// Read-only log for everyone logged in; only admin can delete an entry
const router = require("express").Router();
const c = require("../controllers/activityController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", c.getAll);
router.delete("/:id", authorize("admin"), c.remove);

module.exports = router;
