const { Activity } = require("../models/associations");
const { ok, fail } = require("../utils/response");

// GET /api/activity -> newest first
exports.getAll = async (req, res) => {
  try {
    const rows = await Activity.findAll({ order: [["timestamp", "DESC"]], limit: 500 });
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
};

// DELETE /api/activity/:id (admin)
exports.remove = async (req, res) => {
  try {
    const n = await Activity.destroy({ where: { id: req.params.id } });
    return n ? ok(res, { id: req.params.id }, "Activity removed") : fail(res, "Activity not found", 404);
  } catch (e) {
    return fail(res, e.message, 400);
  }
};
